"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/state/useAppStore";
import { useCourseCatalog } from "@/lib/state/useCourseCatalog";
import { useTimetable } from "@/lib/state/useTimetable";
import { useBoard } from "@/lib/state/useBoard";
import { computeElectiveProgress } from "@/lib/scheduling/creditRules";
import { seedCdcForBranch, seedMinorsData, seedElectivesForBranch } from "@/lib/db/seed";
import { CourseFilterBar, type CatalogFilters } from "@/components/catalog/CourseFilterBar";
import { CategorySection } from "@/components/catalog/CategorySection";
import { ElectiveProgressPanel } from "@/components/catalog/ElectiveProgressPanel";
import { CatalogTabs, type CatalogTab } from "@/components/catalog/CatalogTabs";
import { DEFAULT_CALENDAR_ID } from "@/lib/constants";

const DEFAULT_FILTERS: CatalogFilters = {
  search: "",
  categoryType: "ALL",
  vibeCategoryId: "ALL",
  department: "ALL",
};

export default function CatalogPage() {
  const profile = useAppStore((s) => s.profile);
  const calendarId = profile?.activeCalendarId ?? DEFAULT_CALENDAR_ID;
  const branchCode = profile?.branchCode ?? "A7";

  const courses = useCourseCatalog((s) => s.courses);
  const categories = useCourseCatalog((s) => s.categories);
  const loadCatalog = useCourseCatalog((s) => s.load);

  const entries = useTimetable((s) => s.entries);
  const addEntry = useTimetable((s) => s.addEntry);
  const removeCourseFromSemester = useTimetable((s) => s.removeCourseFromSemester);
  const loadTimetable = useTimetable((s) => s.load);

  const boardEntries = useBoard((s) => s.entries);
  const addToBoard = useBoard((s) => s.addCourse);
  const removeFromBoard = useBoard((s) => s.removeCourse);

  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState<CatalogTab>("DEL");
  const [isSeedingCdc, setIsSeedingCdc] = useState(false);
  const [isSeedingMinors, setIsSeedingMinors] = useState(false);
  const [isSeedingElectives, setIsSeedingElectives] = useState(false);

  const departments = useMemo(
    () => Array.from(new Set(courses.map((c) => c.department))).sort(),
    [courses],
  );

  const branchCourses = useMemo(
    () => courses.filter((c) => c.branchApplicability.length === 0 || c.branchApplicability.includes(branchCode)),
    [courses, branchCode],
  );

  const filteredCourses = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return branchCourses.filter((course) => {
      if ((activeTab === "DEL" || activeTab === "OPEL" || activeTab === "HUEL") && course.categoryType !== activeTab) {
        return false;
      }
      if (filters.categoryType !== "ALL" && course.categoryType !== filters.categoryType) return false;
      if (filters.vibeCategoryId !== "ALL" && !course.categoryIds.includes(filters.vibeCategoryId)) return false;
      if (filters.department !== "ALL" && course.department !== filters.department) return false;
      if (search && !course.code.toLowerCase().includes(search) && !course.title.toLowerCase().includes(search)) {
        return false;
      }
      return true;
    });
  }, [branchCourses, filters, activeTab]);

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const addedSemestersByCourseId = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const entry of entries) {
      if (entry.calendarId !== calendarId) continue;
      const list = map.get(entry.courseId) ?? [];
      list.push(entry.semesterNumber);
      map.set(entry.courseId, list);
    }
    for (const list of map.values()) list.sort((a, b) => a - b);
    return map;
  }, [entries, calendarId]);

  const allAddedCourses = useMemo(() => {
    return entries
      .filter((e) => e.calendarId === calendarId)
      .map((e) => courseById.get(e.courseId))
      .filter((c): c is NonNullable<typeof c> => Boolean(c));
  }, [entries, calendarId, courseById]);

  const electiveProgress = useMemo(() => computeElectiveProgress(allAddedCourses), [allAddedCourses]);

  const uncategorizedCourses = useMemo(
    () => filteredCourses.filter((c) => c.categoryIds.length === 0),
    [filteredCourses],
  );

  const boardCourseIds = useMemo(
    () => new Set(boardEntries.filter((e) => e.calendarId === calendarId).map((e) => e.courseId)),
    [boardEntries, calendarId],
  );

  async function handleAdd(courseId: string, semesterNumber: number) {
    await addEntry(calendarId, courseId, semesterNumber);
  }

  async function handleRemove(courseId: string, semesterNumber: number) {
    if (courseById.get(courseId)?.categoryType === "CDC") return; // compulsory — never removable
    await removeCourseFromSemester(calendarId, semesterNumber, courseId);
  }

  async function handleToggleBoard(courseId: string) {
    if (boardCourseIds.has(courseId)) {
      await removeFromBoard(calendarId, courseId);
    } else {
      await addToBoard(calendarId, courseId);
    }
  }

  async function handleLoadCdcs() {
    setIsSeedingCdc(true);
    try {
      await seedCdcForBranch(branchCode, calendarId);
      await Promise.all([loadCatalog(), loadTimetable(calendarId)]);
    } finally {
      setIsSeedingCdc(false);
    }
  }

  async function handleLoadMinors() {
    setIsSeedingMinors(true);
    try {
      await seedMinorsData();
      await loadCatalog();
    } finally {
      setIsSeedingMinors(false);
    }
  }

  async function handleLoadElectives() {
    setIsSeedingElectives(true);
    try {
      await seedElectivesForBranch(branchCode);
      await loadCatalog();
    } finally {
      setIsSeedingElectives(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Course Catalog</h1>
        <div className="flex gap-2">
          <button
            onClick={handleLoadCdcs}
            disabled={isSeedingCdc}
            className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm font-medium hover:bg-foreground/5 disabled:opacity-50"
          >
            {isSeedingCdc ? "Loading CDCs…" : `Load ${branchCode} CDCs`}
          </button>
          <button
            onClick={handleLoadElectives}
            disabled={isSeedingElectives}
            className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm font-medium hover:bg-foreground/5 disabled:opacity-50"
          >
            {isSeedingElectives ? "Loading electives…" : `Load ${branchCode} DEL/HUEL/OPEL`}
          </button>
          <button
            onClick={handleLoadMinors}
            disabled={isSeedingMinors}
            className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm font-medium hover:bg-foreground/5 disabled:opacity-50"
          >
            {isSeedingMinors ? "Loading minors…" : "Load minors electives"}
          </button>
        </div>
      </div>

      <CatalogTabs activeTab={activeTab} onChange={setActiveTab} />

      <ElectiveProgressPanel
        progress={activeTab === "ALL" ? electiveProgress : electiveProgress.filter((p) => p.categoryType === activeTab)}
      />

      <CourseFilterBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
        departments={departments}
        showCategoryTypeFilter={activeTab === "ALL"}
      />

      <div className="flex flex-col gap-8">
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            courses={filteredCourses.filter((c) => c.categoryIds.includes(category.id))}
            addedSemestersByCourseId={addedSemestersByCourseId}
            boardCourseIds={boardCourseIds}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onToggleBoard={handleToggleBoard}
          />
        ))}
        <CategorySection
          category={{ id: "uncategorized", name: "Uncategorized" }}
          courses={uncategorizedCourses}
          addedSemestersByCourseId={addedSemestersByCourseId}
          boardCourseIds={boardCourseIds}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onToggleBoard={handleToggleBoard}
        />
      </div>

      {filteredCourses.length === 0 && (
        <p className="text-sm text-foreground/50">
          No courses match your filters yet. Try &quot;Load {branchCode} CDCs&quot; above, or import your course list
          from Settings.
        </p>
      )}
    </div>
  );
}
