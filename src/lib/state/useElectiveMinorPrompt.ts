"use client";

import { useState } from "react";
import type { Course } from "@/types/course";
import type { TimetableEntry } from "@/types/timetable";
import { useAppStore } from "@/lib/state/useAppStore";
import { useTimetable } from "@/lib/state/useTimetable";
import { minorDefinitions } from "@/data/seed/minors.seed";
import { findDualEligibility } from "@/lib/scheduling/electiveMinorAttribution";

interface PendingChoice {
  entryId: string;
  course: Course;
  minorName: string;
  currentContribution?: TimetableEntry["creditContribution"];
}

// Shared by overview/page.tsx and catalog/page.tsx: after adding a course
// (or when the user taps a placed course's minor badge to reconsider),
// check whether it's dual-eligible against the currently-selected minor and,
// if so, surface ElectiveMinorChoiceDialog to ask which requirement it
// should count toward.
export function useElectiveMinorPrompt() {
  const selectedMinorId = useAppStore((s) => s.profile?.selectedMinorId);
  const setEntryContribution = useTimetable((s) => s.setEntryContribution);
  const [pending, setPending] = useState<PendingChoice | null>(null);

  function checkAndPrompt(entryId: string, course: Course, currentContribution?: TimetableEntry["creditContribution"]) {
    const dual = findDualEligibility(course, selectedMinorId);
    if (!dual) return false;
    const minor = minorDefinitions.find((m) => m.id === selectedMinorId);
    if (!minor) return false;
    setPending({ entryId, course, minorName: minor.name, currentContribution });
    return true;
  }

  async function choose(contribution: NonNullable<TimetableEntry["creditContribution"]>) {
    if (!pending) return;
    await setEntryContribution(pending.entryId, contribution);
    setPending(null);
  }

  function dismiss() {
    setPending(null);
  }

  return {
    pendingCourse: pending?.course ?? null,
    pendingMinorName: pending?.minorName ?? null,
    pendingContribution: pending?.currentContribution,
    checkAndPrompt,
    choose,
    dismiss,
  };
}
