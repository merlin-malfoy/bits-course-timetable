"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/state/useAppStore";
import { useCourseCatalog } from "@/lib/state/useCourseCatalog";
import { useTimetable } from "@/lib/state/useTimetable";
import { minorDefinitions, minorCourseEntries } from "@/data/seed/minors.seed";
import { MINOR_ELECTIVE_MIN_COURSES, evaluateMinorEligibility, isProjectTypeCourse } from "@/lib/scheduling/minorRules";
import { MinorCourseSelector } from "@/components/overview/MinorCourseSelector";
import { MinorSidebarItem } from "@/components/overview/MinorSidebarItem";
import { CreditGauge } from "@/components/ui/CreditGauge";
import { DEFAULT_CALENDAR_ID } from "@/lib/constants";
import type { Course } from "@/types/course";

// Guts of the Overview sidebar's "Minor" tab: pick a minor, see progress
// toward it, and drag its core/elective courses straight onto a semester —
// same drag mechanics as the "Board" tab, just sourced from a minor's course
// list instead of a persisted board.
export function MinorSidebarContent() {
  const profile = useAppStore((s) => s.profile);
  const calendarId = profile?.activeCalendarId ?? DEFAULT_CALENDAR_ID;
  const courses = useCourseCatalog((s) => s.courses);
  const entries = useTimetable((s) => s.entries);

  const [selectedMinorId, setSelectedMinorId] = useState(minorDefinitions[0]?.id ?? "");
  const selectedMinor = minorDefinitions.find((m) => m.id === selectedMinorId) ?? minorDefinitions[0];

  const courseByCode = useMemo(() => new Map(courses.map((c) => [c.code, c])), [courses]);

  const completedCourses = useMemo(() => {
    const courseById = new Map(courses.map((c) => [c.id, c]));
    return entries
      .filter((e) => e.calendarId === calendarId && e.creditContribution !== "ELECTIVE")
      .map((e) => courseById.get(e.courseId))
      .filter((c): c is Course => Boolean(c));
  }, [entries, calendarId, courses]);

  const coreCourses = useMemo(() => {
    if (!selectedMinor) return [];
    return minorCourseEntries
      .filter((e) => e.minorId === selectedMinor.id && e.role === "core")
      .map((e) => courseByCode.get(e.code))
      .filter((c): c is Course => Boolean(c));
  }, [selectedMinor, courseByCode]);

  const electiveCourses = useMemo(() => {
    if (!selectedMinor) return [];
    return minorCourseEntries
      .filter((e) => e.minorId === selectedMinor.id && e.role === "elective")
      .map((e) => courseByCode.get(e.code))
      .filter((c): c is Course => Boolean(c));
  }, [selectedMinor, courseByCode]);

  const eligibility = useMemo(
    () => (selectedMinor ? evaluateMinorEligibility(selectedMinor, completedCourses) : undefined),
    [selectedMinor, completedCourses],
  );

  if (!selectedMinor) {
    return <p className="font-mono text-xs text-foreground/60">no minors loaded yet.</p>;
  }

  return (
    <>
      <MinorCourseSelector selectedMinorId={selectedMinorId} onSelect={setSelectedMinorId} />

      {eligibility && (
        <div className="flex items-center gap-2.5 rounded-lg border border-foreground/10 p-2.5">
          <CreditGauge
            value={eligibility.totalCourses}
            max={selectedMinor.totalMinCourses}
            size={34}
            strokeWidth={4}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between font-mono text-xs font-medium">
              <span className="truncate">{selectedMinor.name}</span>
              <span className={eligibility.isEligible ? "text-emerald-500" : "text-amber-500"}>
                {eligibility.isEligible ? "eligible" : "in progress"}
              </span>
            </div>
            <p className="font-mono text-[10px] text-foreground/60">
              core {eligibility.coreCompletedCount}/{eligibility.coreTotalCount} · electives{" "}
              {eligibility.electiveCompletedCount}/{MINOR_ELECTIVE_MIN_COURSES} · total {eligibility.totalCourses}/
              {selectedMinor.totalMinCourses}
            </p>
          </div>
        </div>
      )}

      <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto lg:max-h-[calc(100vh-20rem)]">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-mono text-[10px] text-foreground/60">{"// core"}</h3>
          {coreCourses.length === 0 ? (
            <p className="font-mono text-[10px] text-foreground/60">
              no core courses in the catalog yet — load minors data from Catalog.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {coreCourses.map((course) => (
                <MinorSidebarItem key={course.id} course={course} role="core" isProjectType={isProjectTypeCourse(course.title)} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-mono text-[10px] text-foreground/60">{"// electives"}</h3>
          {electiveCourses.length === 0 ? (
            <p className="font-mono text-[10px] text-foreground/60">
              no elective courses in the catalog yet — load minors data from Catalog.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {electiveCourses.map((course) => (
                <MinorSidebarItem
                  key={course.id}
                  course={course}
                  role="elective"
                  isProjectType={isProjectTypeCourse(course.title)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
