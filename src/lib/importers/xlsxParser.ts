import * as XLSX from "xlsx";

export interface ParsedWorkbookRow {
  rowIndex: number; // matches the spreadsheet row number (header is row 1)
  data: Record<string, unknown>;
}

export class UnsupportedFileError extends Error {}

export async function parseWorkbookFile(file: File): Promise<ParsedWorkbookRow[]> {
  if (file.name.toLowerCase().endsWith(".numbers")) {
    throw new UnsupportedFileError(
      "Numbers files aren't supported. In Numbers, use File > Export To > Excel, then upload the .xlsx file.",
    );
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  if (workbook.SheetNames.length === 0) {
    throw new UnsupportedFileError("This file has no sheets to import.");
  }

  const sheetName = workbook.SheetNames.includes("Courses") ? "Courses" : workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return rows.map((data, i) => ({ rowIndex: i + 2, data }));
}
