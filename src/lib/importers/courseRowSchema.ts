import { v4 as uuid } from "uuid";
import type { Course, CourseCategoryType, SemesterParity } from "@/types/course";
import type { ImportRowError } from "@/types/importResult";

const VALID_CATEGORY_TYPES: CourseCategoryType[] = ["CDC", "DEL", "OPEL", "HUEL", "OTHER_ELECTIVE"];
const VALID_PARITIES: SemesterParity[] = ["ODD", "EVEN", "BOTH"];

function getField(row: Record<string, unknown>, name: string): string {
  const key = Object.keys(row).find((k) => k.trim().toLowerCase() === name.toLowerCase());
  const value = key ? row[key] : undefined;
  return value === undefined || value === null ? "" : String(value).trim();
}

function splitList(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

export interface ParsedCourseRow {
  course: Course; // categoryIds is [] here — resolved later against the vibe-category name map
  categoryNames: string[];
}

export type CourseRowParseResult =
  | { ok: true; row: ParsedCourseRow }
  | { ok: false; error: ImportRowError };

export function parseCourseRow(row: Record<string, unknown>, rowIndex: number): CourseRowParseResult {
  const code = getField(row, "code");
  const title = getField(row, "title");
  const creditsRaw = getField(row, "credits");
  const categoryTypeRaw = getField(row, "categorytype").toUpperCase();
  const department = getField(row, "department");

  if (!code) return { ok: false, error: { rowIndex, reason: "Missing Code", raw: row } };
  if (!title) return { ok: false, error: { rowIndex, reason: "Missing Title", raw: row } };

  const credits = Number(creditsRaw);
  if (!creditsRaw || Number.isNaN(credits) || credits <= 0) {
    return { ok: false, error: { rowIndex, reason: `Invalid Credits: "${creditsRaw}"`, raw: row } };
  }

  if (!VALID_CATEGORY_TYPES.includes(categoryTypeRaw as CourseCategoryType)) {
    return {
      ok: false,
      error: {
        rowIndex,
        reason: `Invalid CategoryType: "${categoryTypeRaw}" (expected CDC/DEL/OPEL/HUEL/OTHER_ELECTIVE)`,
        raw: row,
      },
    };
  }

  if (!department) return { ok: false, error: { rowIndex, reason: "Missing Department", raw: row } };

  const semesterParityRaw = getField(row, "semesterparity").toUpperCase();
  const semesterParity = VALID_PARITIES.includes(semesterParityRaw as SemesterParity)
    ? (semesterParityRaw as SemesterParity)
    : "BOTH";

  const instructors = splitList(getField(row, "instructors"));
  const notes = getField(row, "notes") || undefined;

  const course: Course = {
    id: uuid(),
    code,
    title,
    credits,
    categoryType: categoryTypeRaw as CourseCategoryType,
    department,
    branchApplicability: splitList(getField(row, "branches")),
    semesterParity,
    instructors: instructors.length > 0 ? instructors : undefined,
    notes,
    categoryIds: [],
  };

  return { ok: true, row: { course, categoryNames: splitList(getField(row, "categories")) } };
}
