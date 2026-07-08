import { v4 as uuid } from "uuid";
import type { Course } from "@/types/course";
import type { CourseCategory } from "@/types/category";
import type { ImportReport, ImportRowError } from "@/types/importResult";
import type { ParsedWorkbookRow } from "@/lib/importers/xlsxParser";
import { parseCourseRow } from "@/lib/importers/courseRowSchema";

export interface DuplicateCourseRow {
  rowIndex: number;
  code: string;
}

export interface CourseImportPlan {
  toImport: Course[];
  duplicates: DuplicateCourseRow[];
  newCategories: CourseCategory[];
  errors: ImportRowError[];
  report: ImportReport;
}

export function buildCourseImportPlan(
  rows: ParsedWorkbookRow[],
  existingCourseCodes: Set<string>,
  existingCategories: CourseCategory[],
): CourseImportPlan {
  const existingCategoryIdByName = new Map(
    existingCategories.map((category) => [category.name.toLowerCase(), category.id]),
  );

  const errors: ImportRowError[] = [];
  const duplicates: DuplicateCourseRow[] = [];
  const validRows: { course: Course; categoryNames: string[] }[] = [];
  const seenCodesThisBatch = new Set<string>();

  for (const { rowIndex, data } of rows) {
    const result = parseCourseRow(data, rowIndex);
    if (!result.ok) {
      errors.push(result.error);
      continue;
    }

    const codeKey = result.row.course.code.toLowerCase();
    if (existingCourseCodes.has(codeKey) || seenCodesThisBatch.has(codeKey)) {
      duplicates.push({ rowIndex, code: result.row.course.code });
      continue;
    }

    seenCodesThisBatch.add(codeKey);
    validRows.push(result.row);
  }

  const newCategoryNames = new Set<string>();
  for (const { categoryNames } of validRows) {
    for (const name of categoryNames) {
      if (!existingCategoryIdByName.has(name.toLowerCase())) {
        newCategoryNames.add(name);
      }
    }
  }

  const newCategories: CourseCategory[] = Array.from(newCategoryNames).map((name) => ({
    id: uuid(),
    name,
  }));
  const newCategoryIdByName = new Map(newCategories.map((c) => [c.name.toLowerCase(), c.id]));

  const toImport: Course[] = validRows.map(({ course, categoryNames }) => ({
    ...course,
    categoryIds: categoryNames.map(
      (name) => existingCategoryIdByName.get(name.toLowerCase()) ?? newCategoryIdByName.get(name.toLowerCase())!,
    ),
  }));

  return {
    toImport,
    duplicates,
    newCategories,
    errors,
    report: {
      totalRows: rows.length,
      importedCount: toImport.length,
      skippedCount: duplicates.length,
      errors,
    },
  };
}
