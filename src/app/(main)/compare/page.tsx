"use client";

import { useEffect, useState } from "react";
import { useCalendars } from "@/lib/state/useCalendars";
import { useCourseCatalog } from "@/lib/state/useCourseCatalog";
import { timetableRepository } from "@/lib/db/repositories/timetableRepository";
import { CourseBlock } from "@/components/overview/CourseBlock";
import { CreditGauge } from "@/components/ui/CreditGauge";
import { MAX_CREDITS_PER_SEMESTER, totalCredits } from "@/lib/scheduling/creditRules";
import type { TimetableEntry } from "@/types/timetable";
import type { Course } from "@/types/course";

const SEMESTER_COUNT = 8;

export default function ComparePage() {
  const calendars = useCalendars((s) => s.calendars);
  const courses = useCourseCatalog((s) => s.courses);
  const courseById = new Map(courses.map((c) => [c.id, c]));

  // null = "not manually touched yet" — defaults to the first two calendars
  // during render (no setState-in-effect needed) until the user toggles one.
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [entriesByCalendar, setEntriesByCalendar] = useState<Record<string, TimetableEntry[]>>({});
  const effectiveSelectedIds = selectedIds ?? calendars.slice(0, 2).map((c) => c.id);

  // Compare reads calendars directly through the repository rather than the
  // single-active-calendar useTimetable store, since it needs several
  // calendars' entries loaded side by side at once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pairs = await Promise.all(
        effectiveSelectedIds.map(async (id) => [id, await timetableRepository.getAllForCalendar(id)] as const),
      );
      if (cancelled) return;
      setEntriesByCalendar(Object.fromEntries(pairs));
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSelectedIds.join(",")]);

  function toggleCalendar(id: string) {
    setSelectedIds(
      effectiveSelectedIds.includes(id) ? effectiveSelectedIds.filter((x) => x !== id) : [...effectiveSelectedIds, id],
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-mono text-xl font-semibold">
        <span className="text-accent">{">"}</span> compare
      </h1>

      <div className="flex flex-wrap gap-2 font-mono text-sm">
        {calendars.map((calendar) => (
          <button
            key={calendar.id}
            onClick={() => toggleCalendar(calendar.id)}
            className={`rounded-md border px-3 py-1.5 font-medium transition-colors ${
              effectiveSelectedIds.includes(calendar.id)
                ? "border-accent/40 bg-accent/15 text-accent"
                : "border-foreground/20 text-foreground/70 hover:bg-foreground/5"
            }`}
          >
            {calendar.name}
          </button>
        ))}
      </div>

      {effectiveSelectedIds.length === 0 ? (
        <p className="font-mono text-sm text-foreground/60">select at least one calendar above to compare.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {effectiveSelectedIds.map((id) => {
            const calendar = calendars.find((c) => c.id === id);
            const entries = entriesByCalendar[id] ?? [];

            const semesters = Array.from({ length: SEMESTER_COUNT }, (_, i) => i + 1).map((semesterNumber) => ({
              semesterNumber,
              courses: entries
                .filter((e) => e.semesterNumber === semesterNumber)
                .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
                .map((e) => courseById.get(e.courseId))
                .filter((c): c is Course => Boolean(c)),
            }));
            const allCourses = semesters.flatMap((s) => s.courses);

            return (
              <section key={id} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <CreditGauge
                    value={totalCredits(allCourses)}
                    max={SEMESTER_COUNT * MAX_CREDITS_PER_SEMESTER}
                    size={36}
                    strokeWidth={4}
                  />
                  <div>
                    <h2 className="font-mono text-sm font-semibold">{calendar?.name ?? "Untitled"}</h2>
                    <p className="font-mono text-xs text-foreground/60">
                      {totalCredits(allCourses)} credits across {SEMESTER_COUNT} semesters
                    </p>
                  </div>
                </div>

                <div className="flex snap-x snap-mandatory flex-row gap-3 overflow-x-auto rounded-2xl border border-foreground/10 bg-surface/40 p-4">
                  {semesters.map((semester) => (
                    <div
                      key={semester.semesterNumber}
                      className="flex w-36 shrink-0 snap-start flex-col gap-2 rounded-xl border-r border-foreground/10 p-2 pr-3 last:border-r-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-mono text-xs font-semibold text-foreground/80">
                          SEM.{String(semester.semesterNumber).padStart(2, "0")}
                        </h3>
                        <CreditGauge value={totalCredits(semester.courses)} max={MAX_CREDITS_PER_SEMESTER} size={22} strokeWidth={3} />
                      </div>

                      {semester.courses.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {semester.courses.map((course) => (
                            <CourseBlock key={course.id} course={course} />
                          ))}
                        </div>
                      ) : (
                        <p className="flex min-h-[3rem] flex-1 items-center rounded-xl border border-dashed border-foreground/15 px-2 py-3 text-center font-mono text-[10px] text-foreground/50">
                          empty
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
