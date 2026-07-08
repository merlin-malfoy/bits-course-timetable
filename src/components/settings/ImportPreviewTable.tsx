"use client";

import type { CourseImportPlan } from "@/lib/importers/importReport";

interface ImportPreviewTableProps {
  plan: CourseImportPlan;
  onConfirm: () => void;
  onCancel: () => void;
  isImporting: boolean;
}

export function ImportPreviewTable({ plan, onConfirm, onCancel, isImporting }: ImportPreviewTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-foreground">{plan.report.totalRows} rows read</span>
        <span className="text-emerald-500">{plan.report.importedCount} ready to import</span>
        <span className="text-amber-500">{plan.duplicates.length} duplicate (already in catalog)</span>
        <span className="text-red-500">{plan.errors.length} errors</span>
        {plan.newCategories.length > 0 && (
          <span className="text-foreground/60">
            {plan.newCategories.length} new categor{plan.newCategories.length === 1 ? "y" : "ies"} will be created
          </span>
        )}
      </div>

      {plan.errors.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border border-red-500/30 bg-red-500/5 p-3">
          <p className="text-xs font-semibold text-red-500">Errors (these rows will be skipped)</p>
          <ul className="flex flex-col gap-0.5 text-xs text-red-500/90">
            {plan.errors.map((error) => (
              <li key={error.rowIndex}>
                Row {error.rowIndex}: {error.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.duplicates.length > 0 && (
        <div className="flex flex-col gap-1 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="text-xs font-semibold text-amber-500">Duplicates (skipped — already in catalog)</p>
          <ul className="flex flex-col gap-0.5 text-xs text-amber-500/90">
            {plan.duplicates.map((dup) => (
              <li key={dup.rowIndex}>
                Row {dup.rowIndex}: {dup.code}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.toImport.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-foreground/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-foreground/5 text-foreground/60">
              <tr>
                <th className="p-2">Code</th>
                <th className="p-2">Title</th>
                <th className="p-2">Credits</th>
                <th className="p-2">Type</th>
              </tr>
            </thead>
            <tbody>
              {plan.toImport.map((course) => (
                <tr key={course.id} className="border-t border-foreground/10">
                  <td className="p-2 font-medium">{course.code}</td>
                  <td className="p-2">{course.title}</td>
                  <td className="p-2">{course.credits}</td>
                  <td className="p-2">{course.categoryType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          disabled={plan.toImport.length === 0 || isImporting}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-contrast hover:opacity-90 disabled:opacity-40"
        >
          {isImporting ? "Importing…" : `Confirm import (${plan.toImport.length})`}
        </button>
        <button
          onClick={onCancel}
          disabled={isImporting}
          className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
