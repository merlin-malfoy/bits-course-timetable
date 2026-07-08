"use client";

import type { ElectiveProgress } from "@/lib/scheduling/creditRules";

export function ElectiveProgressPanel({ progress }: { progress: ElectiveProgress[] }) {
  return (
    <div className="flex flex-wrap gap-3 rounded-lg border border-foreground/10 p-3">
      {progress.map((item) => (
        <div key={item.categoryType} className="flex min-w-[9rem] flex-1 flex-col gap-1">
          <div className="flex items-center justify-between text-xs font-medium">
            <span>{item.categoryType}</span>
            <span className={item.isSatisfied ? "text-emerald-500" : "text-amber-500"}>
              {item.isSatisfied ? "Satisfied" : "In progress"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              className={`h-full ${item.isSatisfied ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${Math.min(100, (item.coursesTaken / item.minCourses) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-foreground/50">
            {item.coursesTaken}/{item.minCourses} courses · {item.creditsTaken}/{item.minCredits} credits
          </p>
        </div>
      ))}
    </div>
  );
}
