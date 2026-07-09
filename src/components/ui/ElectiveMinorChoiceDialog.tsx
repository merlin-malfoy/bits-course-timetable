"use client";

import { useEffect, useRef } from "react";
import type { Course } from "@/types/course";
import type { TimetableEntry } from "@/types/timetable";
import { categoryTypeLabel } from "@/lib/scheduling/creditRules";

interface ElectiveMinorChoiceDialogProps {
  course: Course | null;
  minorName: string | null;
  currentContribution?: TimetableEntry["creditContribution"];
  onChoose: (contribution: NonNullable<TimetableEntry["creditContribution"]>) => void;
  onClose: () => void;
}

// Native <dialog> so it escapes any ancestor overflow/stacking context —
// fires when a course being added (or reconsidered via its minor badge) is
// both a real DEL/OPEL/HUEL elective and on the active minor's elective
// list, which would otherwise silently count toward both requirements.
export function ElectiveMinorChoiceDialog({
  course,
  minorName,
  currentContribution,
  onChoose,
  onClose,
}: ElectiveMinorChoiceDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (course && !dialog.open) dialog.showModal();
    if (!course && dialog.open) dialog.close();
  }, [course]);

  if (!course) return null;

  const requirementLabel = categoryTypeLabel(course.categoryType);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className="w-full max-w-sm rounded-xl border border-foreground/15 bg-surface p-5 text-foreground backdrop:bg-black/60"
    >
      <p className="font-mono text-xs text-foreground/60">{"// dual-eligible course"}</p>
      <h2 className="mt-1 font-mono text-sm font-semibold">
        {course.code} — {course.title}
      </h2>
      <p className="mt-2 text-sm text-foreground/70">
        This course is also on your <span className="font-semibold">{minorName}</span> minor&apos;s elective list.
        Where should its credits count?
      </p>
      <div className="mt-4 flex flex-col gap-2 font-mono text-sm">
        <button
          onClick={() => onChoose("ELECTIVE")}
          className={`rounded-md border px-3 py-2 text-left transition-colors ${
            currentContribution === "ELECTIVE"
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-foreground/20 hover:bg-foreground/5"
          }`}
        >
          count toward {requirementLabel} requirement
        </button>
        <button
          onClick={() => onChoose("MINOR")}
          className={`rounded-md border px-3 py-2 text-left transition-colors ${
            currentContribution === "MINOR"
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-foreground/20 hover:bg-foreground/5"
          }`}
        >
          count toward {minorName} minor
        </button>
      </div>
      <button
        onClick={onClose}
        className="mt-3 w-full rounded-md px-3 py-1.5 text-center font-mono text-xs text-foreground/50 hover:text-foreground"
      >
        decide later
      </button>
    </dialog>
  );
}
