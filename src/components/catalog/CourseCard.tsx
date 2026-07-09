"use client";

import { useState } from "react";
import type { Course } from "@/types/course";
import { categoryTypeLabel } from "@/lib/scheduling/creditRules";
import { getCategoryTypeColor } from "@/lib/theme/categoryTypeColors";

interface CourseCardProps {
  course: Course;
  addedSemesters?: number[];
  isOnBoard: boolean;
  onAdd: (semesterNumber: number) => void;
  onRemove: (semesterNumber: number) => void;
  onToggleBoard: () => void;
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export function CourseCard({ course, addedSemesters, isOnBoard, onAdd, onRemove, onToggleBoard }: CourseCardProps) {
  const [pendingSemester, setPendingSemester] = useState("");
  const isCdc = course.categoryType === "CDC";
  const category = getCategoryTypeColor(course.categoryType);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-foreground/10 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{course.title}</p>
          <p className="font-mono text-sm text-foreground/70">{course.code}</p>
        </div>
        <span className="shrink-0 rounded-full border px-2 py-0.5 font-mono text-xs font-medium" style={category.cardStyle}>
          <span style={category.textStyle}>{categoryTypeLabel(course.categoryType)}</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-foreground/60">
        <span>{course.credits} credits</span>
        <span>{course.department}</span>
        <span>{course.semesterParity === "BOTH" ? "any semester" : `${course.semesterParity} sems only`}</span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-xs">
        {isCdc ? (
          <>
            {(addedSemesters ?? []).map((sem) => (
              <span
                key={sem}
                className="self-start rounded-md border border-foreground/20 px-3 py-1 font-medium text-foreground/70"
              >
                sem {sem} — locked
              </span>
            ))}
            <select
              value={pendingSemester}
              onChange={(e) => {
                const value = e.target.value;
                setPendingSemester("");
                if (value) onAdd(Number(value));
              }}
              className="self-start rounded-md bg-accent px-3 py-1 font-medium text-accent-contrast hover:opacity-90"
            >
              <option value="" disabled>
                add to semester…
              </option>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem} className="bg-background text-foreground">
                  semester {sem}
                </option>
              ))}
            </select>
          </>
        ) : addedSemesters?.[0] !== undefined ? (
          <button
            onClick={() => onRemove(addedSemesters[0])}
            className="self-start rounded-md border border-foreground/20 px-3 py-1 font-medium text-foreground/80 hover:bg-foreground/5"
          >
            added to sem {addedSemesters[0]} — remove
          </button>
        ) : (
          <select
            value={pendingSemester}
            onChange={(e) => {
              const value = e.target.value;
              setPendingSemester("");
              if (value) onAdd(Number(value));
            }}
            className="self-start rounded-md bg-accent px-3 py-1 font-medium text-accent-contrast hover:opacity-90"
          >
            <option value="" disabled>
              add to semester…
            </option>
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem} className="bg-background text-foreground">
                semester {sem}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={onToggleBoard}
          className={`self-start rounded-md border px-3 py-1 font-medium ${
            isOnBoard
              ? "border-accent bg-accent/10 text-accent"
              : "border-foreground/20 text-foreground/80 hover:bg-foreground/5"
          }`}
        >
          {isOnBoard ? "✓ on board" : "+ board"}
        </button>
      </div>
    </div>
  );
}
