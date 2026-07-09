"use client";

import type { ElectiveProgress } from "@/lib/scheduling/creditRules";
import { CreditGauge } from "@/components/ui/CreditGauge";

export function ElectiveProgressPanel({ progress }: { progress: ElectiveProgress[] }) {
  return (
    <div className="flex flex-wrap gap-4 rounded-lg border border-foreground/10 p-3">
      {progress.map((item) => (
        <div key={item.categoryType} className="flex min-w-[10rem] flex-1 items-center gap-3">
          <CreditGauge value={item.coursesTaken} max={item.minCourses} size={36} strokeWidth={4} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between font-mono text-xs font-medium">
              <span>{item.categoryType}</span>
              <span className={item.isSatisfied ? "text-emerald-500" : "text-amber-500"}>
                {item.isSatisfied ? "satisfied" : "in progress"}
              </span>
            </div>
            <p className="font-mono text-[10px] text-foreground/60">
              {item.coursesTaken}/{item.minCourses} courses · {item.creditsTaken}/{item.minCredits} credits
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
