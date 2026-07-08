"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/state/useAppStore";
import { useCourseCatalog } from "@/lib/state/useCourseCatalog";
import { useTimetable } from "@/lib/state/useTimetable";
import { minorDefinitions, minorCourseEntries } from "@/data/seed/minors.seed";
import { MINOR_ELECTIVE_MIN_COURSES, evaluateMinorEligibility, isProjectTypeCourse } from "@/lib/scheduling/minorRules";
import { MinorCourseSelector } from "@/components/overview/MinorCourseSelector";
import { MinorSidebarItem } from "@/components/overview/MinorSidebarItem";
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
      .filter((e) => e.calendarId === calendarId)
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
    return <p className="text-xs text-foreground/40">No minors loaded yet.</p>;
  }

  return (
    <>
      <MinorCourseSelector selectedMinorId={selectedMinorId} onSelect={setSelectedMinorId} />

      {eligibility && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-foreground/10 p-2.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span>{selectedMinor.name}</span>
            <span className={eligibility.isEligible ? "text-emerald-500" : "text-amber-500"}>
              {eligibility.isEligible ? "Eligible" : "In progress"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
            <div
              className={`h-full ${eligibility.isEligible ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${Math.min(100, (eligibility.totalCourses / selectedMinor.totalMinCourses) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-foreground/50">
            Core {eligibility.coreCompletedCount}/{eligibility.coreTotalCount} · Electives{" "}
            {eligibility.electiveCompletedCount}/{MINOR_ELECTIVE_MIN_COURSES} · Total {eligibility.totalCourses}/
            {selectedMinor.totalMinCourses} courses
          </p>
        </div>
      )}

      <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto lg:max-h-[calc(100vh-20rem)]">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-foreground/40">Core</h3>
          {coreCourses.length === 0 ? (
            <p className="text-[10px] text-foreground/40">
              No core courses in the catalog yet — load minors data from Catalog.
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
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-foreground/40">Electives</h3>
          {electiveCourses.length === 0 ? (
            <p className="text-[10px] text-foreground/40">
              No elective courses in the catalog yet — load minors data from Catalog.
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
