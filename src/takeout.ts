import { unzipSync } from 'fflate';
import type { PhotoMetadata, ProgressUpdate, RepairItem, ScanResult, SourceFile, SourceKind } from './types';

const MEDIA_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'avif',
  'mp4', 'mov', 'm4v', 'avi', 'mkv', '3gp'
]);
const REWRITABLE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png']);

type Progress = (update: ProgressUpdate) => void;

export const extensionOf = (name: string) => {
  const match = name.toLowerCase().match(/\.([^.]+)$/);
  return match?.[1] ?? '';
};

export const isMediaFile = (name: string) => MEDIA_EXTENSIONS.has(extensionOf(name));
export const canRewriteMetadata = (name: string) => REWRITABLE_EXTENSIONS.has(extensionOf(name));

const leaf = (path: string) => path.split('/').pop() ?? path;
const parent = (path: string) => path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
const normal = (value: string) => value.normalize('NFKC').toLocaleLowerCase().trim();

export function sidecarStem(name: string): string {
  return normal(name)
    .replace(/\.supplemental-metadata\.json$/i, '')
    .replace(/\.json$/i, '');
}

function mediaStems(name: string): string[] {
  const full = normal(name);
  const withoutExt = full.replace(/\.[^.]+$/, '');
  const withoutCopy = full.replace(/\s*\(\d+\)(?=\.[^.]+$)/, '');
  const withoutExtCopy = withoutExt.replace(/\s*\(\d+\)$/, '');
  return [...new Set([full, withoutExt, withoutCopy, withoutExtCopy])];
}

export function parseSidecar(raw: unknown): PhotoMetadata {
  if (!raw || typeof raw !== 'object') throw new Error('The sidecar is not a JSON object');
  const json = raw as Record<string, unknown>;
  const taken = json.photoTakenTime as Record<string, unknown> | undefined;
  const created = json.creationTime as Record<string, unknown> | undefined;
  const timestampRaw = taken?.timestamp ?? created?.timestamp;
  const timestamp = timestampRaw === undefined ? undefined : Number(timestampRaw);

  const geoExif = recordOrUndefined(json.geoDataExif);
  const geo = recordOrUndefined(json.geoData);
  // Takeout frequently includes an empty or partial geoDataExif object next
  // to populated geoData. Prefer EXIF values where they exist, but never let
  // an absent field hide the corresponding populated geoData field.
  const exifCoordinates = coordinatesFrom(geoExif);
  const geoCoordinates = coordinatesFrom(geo);
  const latitude = exifCoordinates.latitude ?? geoCoordinates.latitude;
  const longitude = exifCoordinates.longitude ?? geoCoordinates.longitude;
  const hasLocation = latitude !== undefined && longitude !== undefined && (latitude !== 0 || longitude !== 0);
  const altitude = hasLocation ? numberOrUndefined(geoExif?.altitude) ?? numberOrUndefined(geo?.altitude) : undefined;

  return {
    timestamp: Number.isFinite(timestamp) && timestamp! > 0 ? timestamp : undefined,
    latitude: hasLocation ? latitude : undefined,
    longitude: hasLocation ? longitude : undefined,
    altitude,
    title: typeof json.title === 'string' ? json.title : undefined,
    description: typeof json.description === 'string' ? json.description : undefined
  };
}

function recordOrUndefined(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function numberOrUndefined(value: unknown): number | undefined {
  if (value === null || value === '' || value === undefined) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function coordinatesFrom(value?: Record<string, unknown>) {
  const latitude = numberOrUndefined(value?.latitude);
  const longitude = numberOrUndefined(value?.longitude);
  // Google uses 0/0 for its no-location placeholder. Treat the pair as
  // missing so a populated geoData object can provide the real location.
  if (latitude === 0 && longitude === 0) return { latitude: undefined, longitude: undefined };
  return { latitude, longitude };
}

async function parseSidecarFile(source: SourceFile) {
  const file = await source.getFile();
  return parseSidecar(JSON.parse(await file.text()));
}

function scoreSidecar(media: SourceFile, candidate: SourceFile, metadata?: PhotoMetadata): number {
  const mediaPath = normal(media.path);
  const mediaName = leaf(mediaPath);
  const stems = mediaStems(mediaName);
  const candidateStem = sidecarStem(leaf(candidate.path));
  let score = parent(mediaPath) === parent(normal(candidate.path)) ? 40 : 0;

  if (candidateStem === stems[0]) score += 100;
  else if (stems.includes(candidateStem)) score += 86;
  else if (stems.some((stem) => stem.startsWith(candidateStem) || candidateStem.startsWith(stem))) score += 55;

  if (metadata?.title) {
    const title = normal(metadata.title);
    if (title === mediaName) score += 110;
    else if (mediaStems(title).some((stem) => stems.includes(stem))) score += 90;
  }
  return score;
}

export async function scanSources(
  files: SourceFile[],
  sourceKind: SourceKind,
  sourceLabel: string,
  onProgress: Progress = () => undefined
): Promise<ScanResult> {
  const media = files.filter((file) => isMediaFile(file.name));
  const sidecars = files.filter((file) => file.name.toLowerCase().endsWith('.json'));
  const parsed = new Map<SourceFile, PhotoMetadata>();
  const invalid = new Set<SourceFile>();
  const byStem = new Map<string, SourceFile[]>();
  const byTitle = new Map<string, SourceFile[]>();
  const byFolder = new Map<string, SourceFile[]>();

  for (let index = 0; index < sidecars.length; index += 1) {
    onProgress({ phase: 'reading', current: index + 1, total: sidecars.length, message: `Reading sidecar ${index + 1} of ${sidecars.length}` });
    try {
      parsed.set(sidecars[index], await parseSidecarFile(sidecars[index]));
    } catch {
      invalid.add(sidecars[index]);
    }
  }

  for (const sidecar of sidecars) {
    if (invalid.has(sidecar)) continue;
    const stem = sidecarStem(leaf(sidecar.path));
    byStem.set(stem, [...(byStem.get(stem) ?? []), sidecar]);
    const folder = parent(normal(sidecar.path));
    byFolder.set(folder, [...(byFolder.get(folder) ?? []), sidecar]);
    const title = parsed.get(sidecar)?.title;
    if (title) {
      for (const titleStem of mediaStems(title)) byTitle.set(titleStem, [...(byTitle.get(titleStem) ?? []), sidecar]);
    }
  }

  const items: RepairItem[] = [];
  for (let index = 0; index < media.length; index += 1) {
    const photo = media[index];
    onProgress({ phase: 'matching', current: index + 1, total: media.length, message: `Matching photo ${index + 1} of ${media.length}` });
    let best: SourceFile | undefined;
    let bestScore = 0;
    const stems = mediaStems(leaf(photo.path));
    const candidates = new Set<SourceFile>();
    for (const stem of stems) {
      byStem.get(stem)?.forEach((sidecar) => candidates.add(sidecar));
      byTitle.get(stem)?.forEach((sidecar) => candidates.add(sidecar));
    }
    const folderCandidates = byFolder.get(parent(normal(photo.path))) ?? [];
    if (candidates.size === 0) {
      for (const sidecar of folderCandidates) {
        const candidateStem = sidecarStem(leaf(sidecar.path));
        if (stems.some((stem) => stem.startsWith(candidateStem) || candidateStem.startsWith(stem))) candidates.add(sidecar);
      }
    }
    for (const sidecar of candidates) {
      const score = scoreSidecar(photo, sidecar, parsed.get(sidecar));
      if (score > bestScore) {
        best = sidecar;
        bestScore = score;
      }
    }

    const metadata = best ? parsed.get(best) : undefined;
    const matched = Boolean(best && bestScore >= 80 && metadata?.timestamp);
    const rewritable = canRewriteMetadata(photo.name);
    items.push({
      id: `${index}-${photo.path}`,
      source: photo,
      sidecar: matched ? best : undefined,
      metadata: matched ? metadata : undefined,
      status: matched ? (rewritable ? 'matched' : 'unsupported') : 'unmatched',
      reason: matched && !rewritable
        ? 'Date found; this format is copied unchanged because browser-safe metadata writing is unavailable.'
        : matched ? undefined : 'No date-bearing sidecar matched this file.'
    });
  }

  return {
    sourceKind,
    sourceLabel,
    items,
    mediaCount: media.length,
    sidecarCount: sidecars.length,
    matchedCount: items.filter((item) => item.status === 'matched').length,
    unmatchedCount: items.filter((item) => item.status === 'unmatched').length,
    unsupportedCount: items.filter((item) => item.status === 'unsupported').length,
    invalidSidecars: invalid.size
  };
}

export async function filesFromInput(fileList: FileList | File[]): Promise<SourceFile[]> {
  return [...fileList].map((file) => {
    const relative = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
    return {
      path: relative,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      getFile: async () => file
    };
  });
}

interface LegacyFileEntry {
  isFile: true;
  isDirectory: false;
  name: string;
  fullPath: string;
  file(success: (file: File) => void, failure?: (error: DOMException) => void): void;
}

interface LegacyDirectoryEntry {
  isFile: false;
  isDirectory: true;
  name: string;
  fullPath: string;
  createReader(): { readEntries(success: (entries: LegacyEntry[]) => void, failure?: (error: DOMException) => void): void };
}

type LegacyEntry = LegacyFileEntry | LegacyDirectoryEntry;

export async function filesFromDataTransfer(items: DataTransferItemList): Promise<SourceFile[]> {
  const entries = [...items].map((item) => item.webkitGetAsEntry?.() as unknown as LegacyEntry | null).filter(Boolean) as LegacyEntry[];
  const output: SourceFile[] = [];
  const readFile = (entry: LegacyFileEntry) => new Promise<File>((resolve, reject) => entry.file(resolve, reject));
  const readDirectory = async (entry: LegacyDirectoryEntry) => {
    const reader = entry.createReader();
    const children: LegacyEntry[] = [];
    while (true) {
      const batch = await new Promise<LegacyEntry[]>((resolve, reject) => reader.readEntries(resolve, reject));
      if (!batch.length) break;
      children.push(...batch);
    }
    await Promise.all(children.map(walk));
  };
  const walk = async (entry: LegacyEntry): Promise<void> => {
    if (entry.isDirectory) return readDirectory(entry);
    const file = await readFile(entry);
    const path = entry.fullPath.replace(/^\//, '') || file.name;
    output.push({ path, name: file.name, size: file.size, type: file.type, lastModified: file.lastModified, getFile: async () => file });
  };
  await Promise.all(entries.map(walk));
  return output;
}

export async function filesFromZips(zips: File[], onProgress: Progress = () => undefined): Promise<SourceFile[]> {
  const output: SourceFile[] = [];
  for (let zipIndex = 0; zipIndex < zips.length; zipIndex += 1) {
    const zip = zips[zipIndex];
    onProgress({ phase: 'reading', current: zipIndex + 1, total: zips.length, message: `Opening ${zip.name}` });
    const unzipped = unzipSync(new Uint8Array(await zip.arrayBuffer()));
    for (const [path, bytes] of Object.entries(unzipped)) {
      if (path.endsWith('/')) continue;
      const name = leaf(path);
      const file = new File([bytes], name, { lastModified: zip.lastModified });
      output.push({ path, name, size: bytes.byteLength, type: file.type, lastModified: zip.lastModified, getFile: async () => file });
    }
  }
  return output;
}

interface FileSystemFileHandleLike { kind: 'file'; name: string; getFile(): Promise<File> }
interface FileSystemDirectoryHandleLike {
  kind: 'directory';
  name: string;
  values(): AsyncIterableIterator<FileSystemFileHandleLike | FileSystemDirectoryHandleLike>;
}

export async function filesFromDirectory(root: FileSystemDirectoryHandleLike): Promise<SourceFile[]> {
  const output: SourceFile[] = [];
  async function walk(directory: FileSystemDirectoryHandleLike, prefix = ''): Promise<void> {
    for await (const handle of directory.values()) {
      const path = prefix ? `${prefix}/${handle.name}` : handle.name;
      if (handle.kind === 'directory') await walk(handle, path);
      else {
        const file = await handle.getFile();
        output.push({ path, name: file.name, size: file.size, type: file.type, lastModified: file.lastModified, getFile: () => handle.getFile() });
      }
    }
  }
  await walk(root);
  return output;
}
