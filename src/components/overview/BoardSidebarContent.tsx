"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/state/useAppStore";
import { useCourseCatalog } from "@/lib/state/useCourseCatalog";
import { useBoard } from "@/lib/state/useBoard";
import { CatalogSidebarItem } from "@/components/overview/CatalogSidebarItem";
import type { CourseCategoryType } from "@/types/course";
import { DEFAULT_CALENDAR_ID } from "@/lib/constants";

const CATEGORY_TYPES: (CourseCategoryType | "ALL")[] = ["ALL", "CDC", "DEL", "OPEL", "HUEL", "OTHER_ELECTIVE"];

// Drag a course onto a semester to add it — the guts of the Overview
// sidebar's "Board" tab, split out from the <aside> shell so OverviewSidebar
// can switch it in/out alongside the "Minor" tab's content.
export function BoardSidebarContent() {
  const profile = useAppStore((s) => s.profile);
  const calendarId = profile?.activeCalendarId ?? DEFAULT_CALENDAR_ID;
  const courses = useCourseCatalog((s) => s.courses);
  const boardEntries = useBoard((s) => s.entries);
  const removeFromBoard = useBoard((s) => s.removeCourse);

  const [search, setSearch] = useState("");
  const [categoryType, setCategoryType] = useState<CourseCategoryType | "ALL">("ALL");

  const boardCourses = useMemo(() => {
    const courseById = new Map(courses.map((c) => [c.id, c]));
    return boardEntries
      .filter((e) => e.calendarId === calendarId)
      .map((e) => courseById.get(e.courseId))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [boardEntries, calendarId, courses]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return boardCourses
      .filter((c) => categoryType === "ALL" || c.categoryType === categoryType)
      .filter((c) => !query || c.code.toLowerCase().includes(query) || c.title.toLowerCase().includes(query));
  }, [boardCourses, search, categoryType]);

  if (boardCourses.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-foreground/15 px-3 py-4 text-center text-xs text-foreground/40">
        Your board is empty. Head to the Catalog and tap &quot;+ Board&quot; on a course to add it here.
      </p>
    );
  }

  return (
    <>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search code or title…"
        className="rounded-md border border-foreground/15 bg-background px-2 py-1.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
      />

      <select
        value={categoryType}
        onChange={(e) => setCategoryType(e.target.value as CourseCategoryType | "ALL")}
        className="rounded-md border border-foreground/15 bg-background px-2 py-1.5 text-sm"
      >
        {CATEGORY_TYPES.map((type) => (
          <option key={type} value={type}>
            {type === "ALL" ? "All requirement types" : type}
          </option>
        ))}
      </select>

      <div className="flex max-h-[60vh] flex-col gap-1.5 overflow-y-auto lg:max-h-[calc(100vh-16rem)]">
        {filteredCourses.length === 0 ? (
          <p className="py-4 text-center text-xs text-foreground/40">No courses match.</p>
        ) : (
          filteredCourses.map((course) => (
            <CatalogSidebarItem
              key={course.id}
              course={course}
              onRemoveFromBoard={() => removeFromBoard(calendarId, course.id)}
            />
          ))
        )}
      </div>
    </>
  );
}
