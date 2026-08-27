import { zipSync, strToU8 } from 'fflate';
import { repairBytes } from './metadata';
import type { ExportManifest, ExportResult, ProgressUpdate, RepairItem, RepairOptions, ScanResult } from './types';

type Progress = (update: ProgressUpdate) => void;

export interface DirectoryHandleLike {
  getDirectoryHandle(name: string, options: { create: true }): Promise<DirectoryHandleLike>;
  getFileHandle(name: string, options: { create: true }): Promise<{ createWritable(): Promise<{ write(data: Uint8Array | string): Promise<void>; close(): Promise<void> }> }>;
}

const safePart = (value: string) => value.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/[. ]+$/, '').slice(0, 180) || 'untitled';

function dateParts(timestamp?: number) {
  const date = timestamp ? new Date(timestamp * 1000) : undefined;
  const two = (value: number) => String(value).padStart(2, '0');
  if (!date || Number.isNaN(date.getTime())) return undefined;
  return {
    year: String(date.getUTCFullYear()),
    month: two(date.getUTCMonth() + 1),
    stamp: `${date.getUTCFullYear()}-${two(date.getUTCMonth() + 1)}-${two(date.getUTCDate())}_${two(date.getUTCHours())}-${two(date.getUTCMinutes())}-${two(date.getUTCSeconds())}`
  };
}

export function outputPathFor(item: RepairItem, options: RepairOptions, sequence: number): string {
  const original = safePart(item.source.name);
  const dot = original.lastIndexOf('.');
  const stem = dot > 0 ? original.slice(0, dot) : original;
  const extension = dot > 0 ? original.slice(dot).toLowerCase() : '';
  const parts = dateParts(item.metadata?.timestamp);
  let name = original;
  if (options.rename && parts) {
    name = options.renamePattern === 'date-sequence'
      ? `${parts.stamp}_${String(sequence).padStart(4, '0')}${extension}`
      : `${parts.stamp}_${stem}${extension}`;
  }
  const folder = parts && options.organize === 'year-month' ? `${parts.year}/${parts.month}`
    : parts && options.organize === 'year' ? parts.year
      : '';
  return folder ? `${folder}/${name}` : name;
}

async function sha256(bytes: Uint8Array) {
  const hash = await crypto.subtle.digest('SHA-256', bytes.slice().buffer);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function uniquePath(path: string, used: Set<string>) {
  if (!used.has(path.toLowerCase())) { used.add(path.toLowerCase()); return path; }
  const slash = path.lastIndexOf('/');
  const folder = slash >= 0 ? path.slice(0, slash + 1) : '';
  const name = slash >= 0 ? path.slice(slash + 1) : path;
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const extension = dot > 0 ? name.slice(dot) : '';
  let counter = 2;
  while (used.has(`${folder}${stem}_${counter}${extension}`.toLowerCase())) counter += 1;
  const result = `${folder}${stem}_${counter}${extension}`;
  used.add(result.toLowerCase());
  return result;
}

async function prepare(
  scan: ScanResult,
  options: RepairOptions,
  onProgress: Progress,
  onFile?: (output: { item: RepairItem; path: string; bytes: Uint8Array; hash?: string }, index: number, total: number) => Promise<void>
): Promise<{ files: Array<{ item: RepairItem; path: string; bytes: Uint8Array; hash?: string }>; result: ExportResult }> {
  const candidates = scan.items.filter((item) => options.includeUnmatched || item.status !== 'unmatched');
  const seenHashes = new Map<string, string>();
  const usedPaths = new Set<string>();
  const files: Array<{ item: RepairItem; path: string; bytes: Uint8Array; hash?: string }> = [];
  const manifest: ExportManifest = {
    app: 'Takeout Tidy', version: 1, createdAt: new Date().toISOString(), source: scan.sourceLabel, options, files: []
  };
  let skippedDuplicates = 0;
  let writtenCount = 0;

  for (let index = 0; index < candidates.length; index += 1) {
    const item = candidates[index];
    onProgress({ phase: options.deduplicate ? 'hashing' : 'writing', current: index + 1, total: candidates.length, message: `${options.deduplicate ? 'Checking' : 'Preparing'} ${item.source.name}` });
    try {
      const original = await item.source.getFile();
      const originalBytes = new Uint8Array(await original.arrayBuffer());
      const hash = options.deduplicate ? await sha256(originalBytes) : undefined;
      if (hash && seenHashes.has(hash)) {
        item.duplicateOf = seenHashes.get(hash);
        skippedDuplicates += 1;
        manifest.files.push({ input: item.source.path, sidecar: item.sidecar?.path, status: 'skipped-duplicate', sha256: hash, note: `Exact copy of ${item.duplicateOf}` });
        continue;
      }
      if (hash) seenHashes.set(hash, item.source.path);
      const path = uniquePath(outputPathFor(item, options, index + 1), usedPaths);
      item.outputPath = path;
      const bytes = repairBytes(originalBytes, original.name, item.status === 'matched' ? item.metadata : undefined);
      const output = { item, path, bytes, hash };
      if (onFile) await onFile(output, writtenCount + 1, candidates.length);
      else files.push(output);
      writtenCount += 1;
      manifest.files.push({ input: item.source.path, sidecar: item.sidecar?.path, output: path, status: item.status === 'matched' ? 'metadata-written' : item.status === 'unsupported' ? 'copied-container-unchanged' : 'copied-unmatched', sha256: hash });
    } catch (error) {
      manifest.files.push({ input: item.source.path, sidecar: item.sidecar?.path, status: 'failed', note: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  const failed = manifest.files.filter((file) => file.status === 'failed').map((file) => ({ path: file.input, reason: file.note ?? 'Unknown error' }));
  return { files, result: { written: writtenCount, skippedDuplicates, failed, manifest } };
}

async function directoryFor(root: DirectoryHandleLike, path: string) {
  const parts = path.split('/');
  parts.pop();
  let directory = root;
  for (const part of parts) directory = await directory.getDirectoryHandle(part, { create: true });
  return directory;
}

export async function exportToDirectory(scan: ScanResult, options: RepairOptions, root: DirectoryHandleLike, onProgress: Progress = () => undefined) {
  let writeIndex = 0;
  const { result } = await prepare(scan, options, onProgress, async (output, _index, total) => {
    writeIndex += 1;
    onProgress({ phase: 'writing', current: writeIndex, total: total + 1, message: `Writing ${output.path}` });
    const directory = await directoryFor(root, output.path);
    const name = output.path.split('/').pop()!;
    const handle = await directory.getFileHandle(name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(output.bytes);
    await writable.close();
  });
  const manifestHandle = await root.getFileHandle('takeout-tidy-manifest.json', { create: true });
  const writable = await manifestHandle.createWritable();
  await writable.write(JSON.stringify(result.manifest, null, 2));
  await writable.close();
  onProgress({ phase: 'done', current: result.written + 1, total: result.written + 1, message: 'Clean archive written' });
  return result;
}

export async function exportToZip(scan: ScanResult, options: RepairOptions, onProgress: Progress = () => undefined) {
  const { files, result } = await prepare(scan, options, onProgress);
  const entries: Record<string, Uint8Array> = {};
  for (const output of files) entries[output.path] = output.bytes;
  entries['takeout-tidy-manifest.json'] = strToU8(JSON.stringify(result.manifest, null, 2));
  onProgress({ phase: 'writing', current: files.length, total: files.length, message: 'Packing clean archive' });
  const archive = zipSync(entries, { level: 0 });
  onProgress({ phase: 'done', current: files.length, total: files.length, message: 'Clean archive ready' });
  return { blob: new Blob([archive], { type: 'application/zip' }), result };
}
