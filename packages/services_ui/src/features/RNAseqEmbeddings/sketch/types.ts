export type RunStatus = 'running' | 'complete' | 'failed' | 'cancelled';

/** Caps on what a tabular result keeps; results persist in localStorage. */
export const PREVIEW_ROW_LIMIT = 1000;
export const PREVIEW_COLUMN_LIMIT = 50;

export interface ExtensionStat {
  extension: string;
  count: number;
  bytes: number;
}

/** Replace this with whatever your real processing step produces. */
export interface RunResult {
  entryCount: number;
  totalBytes: number;
  byExtension: ExtensionStat[];
  largest: { path: string; bytes: number }[];
  /** Set for tabular inputs (.tsv). */
  table?: {
    rowCount: number;
    columnCount: number;
    /** first PREVIEW_COLUMN_LIMIT column names */
    columns: string[];
    /** first PREVIEW_ROW_LIMIT data rows, keyed by the names in `columns` */
    rows: Record<string, string>[];
  };
}

export interface Run {
  id: string;
  fileName: string;
  fileSize: number;
  startedAt: number;
  finishedAt?: number;
  status: RunStatus;
  progress: number; // 0-100
  stageLabel: string;
  error?: string;
  result?: RunResult;
}
