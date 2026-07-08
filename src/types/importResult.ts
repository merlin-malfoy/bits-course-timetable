export interface ImportRowError {
  rowIndex: number;
  reason: string;
  raw: Record<string, unknown>;
}

export interface ImportReport {
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errors: ImportRowError[];
}
