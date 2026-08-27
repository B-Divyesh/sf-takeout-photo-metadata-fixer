export type SourceKind = 'folder' | 'zip' | 'files';

export interface SourceFile {
  path: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  getFile(): Promise<File>;
}

export interface PhotoMetadata {
  timestamp?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  title?: string;
  description?: string;
}

export type MatchStatus = 'matched' | 'unmatched' | 'unsupported' | 'invalid';

export interface RepairItem {
  id: string;
  source: SourceFile;
  sidecar?: SourceFile;
  metadata?: PhotoMetadata;
  status: MatchStatus;
  reason?: string;
  duplicateOf?: string;
  outputPath?: string;
}

export interface ScanResult {
  sourceKind: SourceKind;
  sourceLabel: string;
  items: RepairItem[];
  mediaCount: number;
  sidecarCount: number;
  matchedCount: number;
  unmatchedCount: number;
  unsupportedCount: number;
  invalidSidecars: number;
}

export interface RepairOptions {
  deduplicate: boolean;
  rename: boolean;
  renamePattern: 'date-original' | 'date-sequence';
  organize: 'flat' | 'year' | 'year-month';
  includeUnmatched: boolean;
}

export interface SessionSummary {
  at: number;
  sourceLabel: string;
  mediaCount: number;
  matchedCount: number;
  exportedCount: number;
  skippedDuplicates: number;
}

export interface ProgressUpdate {
  phase: 'reading' | 'matching' | 'hashing' | 'writing' | 'done';
  current: number;
  total: number;
  message: string;
}

export interface ExportResult {
  written: number;
  skippedDuplicates: number;
  failed: Array<{ path: string; reason: string }>;
  manifest: ExportManifest;
}

export interface ExportManifest {
  app: 'Takeout Tidy';
  version: 1;
  createdAt: string;
  source: string;
  options: RepairOptions;
  files: Array<{
    input: string;
    sidecar?: string;
    output?: string;
    status: string;
    sha256?: string;
    note?: string;
  }>;
}
