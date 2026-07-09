"use client";

import { useState } from "react";
import { useCourseCatalog } from "@/lib/state/useCourseCatalog";
import { parseWorkbookFile, UnsupportedFileError } from "@/lib/importers/xlsxParser";
import { buildCourseImportPlan, type CourseImportPlan } from "@/lib/importers/importReport";
import { ImportDropzone } from "@/components/settings/ImportDropzone";
import { ImportPreviewTable } from "@/components/settings/ImportPreviewTable";

export default function ImportPage() {
  const courses = useCourseCatalog((s) => s.courses);
  const categories = useCourseCatalog((s) => s.categories);
  const bulkAddCourses = useCourseCatalog((s) => s.bulkAddCourses);
  const bulkAddCategories = useCourseCatalog((s) => s.bulkAddCategories);

  const [plan, setPlan] = useState<CourseImportPlan | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  async function handleFileSelected(file: File) {
    setErrorMessage(null);
    setImportedCount(null);
    setIsParsing(true);
    try {
      const rows = await parseWorkbookFile(file);
      const existingCodes = new Set(courses.map((c) => c.code.toLowerCase()));
      setPlan(buildCourseImportPlan(rows, existingCodes, categories));
    } catch (err) {
      if (err instanceof UnsupportedFileError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Couldn't read that file. Make sure it's a valid .xlsx or .csv file.");
      }
      setPlan(null);
    } finally {
      setIsParsing(false);
    }
  }

  async function handleConfirm() {
    if (!plan) return;
    setIsImporting(true);
    try {
      await bulkAddCategories(plan.newCategories);
      await bulkAddCourses(plan.toImport);
      setImportedCount(plan.toImport.length);
      setPlan(null);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-mono text-xl font-semibold">
        <span className="text-accent">{">"}</span> import course list
      </h1>

      {!plan && <ImportDropzone onFileSelected={handleFileSelected} isBusy={isParsing} />}

      {errorMessage && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-500">{errorMessage}</p>
      )}

      {importedCount !== null && (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-500">
          Imported {importedCount} course{importedCount === 1 ? "" : "s"}. Head to the Catalog to add them to a
          semester.
        </p>
      )}

      {plan && (
        <ImportPreviewTable
          plan={plan}
          onConfirm={handleConfirm}
          onCancel={() => setPlan(null)}
          isImporting={isImporting}
        />
      )}
    </div>
  );
}
