"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useAppStore } from "@/lib/state/useAppStore";
import { useCourseCatalog } from "@/lib/state/useCourseCatalog";
import { useTimetable } from "@/lib/state/useTimetable";
import { computeElectiveProgress, totalCredits } from "@/lib/scheduling/creditRules";
import { getEligibleMinors } from "@/lib/scheduling/minorRules";
import { findDualEligibility } from "@/lib/scheduling/electiveMinorAttribution";
import { minorDefinitions, minorCourseEntries } from "@/data/seed/minors.seed";
import { useElectiveMinorPrompt } from "@/lib/state/useElectiveMinorPrompt";
import { ElectiveProgressPanel } from "@/components/catalog/ElectiveProgressPanel";
import { SemesterRow } from "@/components/overview/SemesterRow";
import { OverviewSidebar } from "@/components/overview/OverviewSidebar";
import { CourseBlock, type MinorBadgeInfo } from "@/components/overview/CourseBlock";
import { MinorSelector } from "@/components/overview/MinorSelector";
import { ElectiveMinorChoiceDialog } from "@/components/ui/ElectiveMinorChoiceDialog";
import { CreditGauge } from "@/components/ui/CreditGauge";
import { MAX_CREDITS_PER_SEMESTER } from "@/lib/scheduling/creditRules";
import { DEFAULT_CALENDAR_ID } from "@/lib/constants";
import type { Course } from "@/types/course";
import type { TimetableEntry } from "@/types/timetable";

const SEMESTER_COUNT = 8;
const CATALOG_PREFIX = "catalog:";

type Board = Record<string, string[]>;

function containerId(semesterNumber: number): string {
  return `sem-${semesterNumber}`;
}

function buildBoardFromEntries(entries: TimetableEntry[], calendarId: string): Board {
  const board: Board = {};
  for (let s = 1; s <= SEMESTER_COUNT; s++) board[containerId(s)] = [];
  entries
    .filter((e) => e.calendarId === calendarId)
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || a.addedAt.localeCompare(b.addedAt))
    .forEach((entry) => {
      const key = containerId(entry.semesterNumber);
      if (!board[key]) board[key] = [];
      board[key].push(entry.id);
    });
  return board;
}

function findContainer(board: Board, id: string): string | undefined {
  if (id in board) return id;
  return Object.keys(board).find((key) => board[key].includes(id));
}

export default function OverviewPage() {
  const profile = useAppStore((s) => s.profile);
  const calendarId = profile?.activeCalendarId ?? DEFAULT_CALENDAR_ID;

  const courses = useCourseCatalog((s) => s.courses);
  const entries = useTimetable((s) => s.entries);
  const addEntry = useTimetable((s) => s.addEntry);
  const removeCourseFromSemester = useTimetable((s) => s.removeCourseFromSemester);
  const setSemesterOrder = useTimetable((s) => s.setSemesterOrder);
  const setSelectedMinor = useAppStore((s) => s.setSelectedMinor);
  const { pendingCourse, pendingMinorName, pendingContribution, checkAndPrompt, choose, dismiss } =
    useElectiveMinorPrompt();

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const entryById = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);

  const selectedMinor = useMemo(
    () => minorDefinitions.find((m) => m.id === profile?.selectedMinorId),
    [profile?.selectedMinorId],
  );
  const minorRoleByCode = useMemo(() => {
    const map = new Map<string, "core" | "elective">();
    if (!selectedMinor) return map;
    for (const entry of minorCourseEntries) {
      if (entry.minorId === selectedMinor.id) map.set(entry.code, entry.role);
    }
    return map;
  }, [selectedMinor]);

  const [board, setBoard] = useState<Board>(() => buildBoardFromEntries(entries, calendarId));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [syncedFrom, setSyncedFrom] = useState({ entries, calendarId });

  // Board mirrors the store, except mid-drag when it's allowed to diverge for
  // the live preview. Re-derive it during render (not an effect) when the
  // store changes and no drag is in progress — React's documented pattern for
  // resetting state from a changing external source without an extra render pass.
  if (activeId === null && (syncedFrom.entries !== entries || syncedFrom.calendarId !== calendarId)) {
    setSyncedFrom({ entries, calendarId });
    setBoard(buildBoardFromEntries(entries, calendarId));
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const calendarEntries = useMemo(() => entries.filter((e) => e.calendarId === calendarId), [entries, calendarId]);
  const allAddedCourses = useMemo(
    () => calendarEntries.map((e) => courseById.get(e.courseId)).filter((c): c is Course => Boolean(c)),
    [calendarEntries, courseById],
  );
  // A dual-eligible course's `creditContribution` choice (see
  // ElectiveMinorChoiceDialog) determines which of these two lists it feeds —
  // unset (not dual-eligible, or added before a contribution choice existed)
  // still counts toward both, the original behavior.
  const electiveProgressCourses = useMemo(
    () =>
      calendarEntries
        .filter((e) => e.creditContribution !== "MINOR")
        .map((e) => courseById.get(e.courseId))
        .filter((c): c is Course => Boolean(c)),
    [calendarEntries, courseById],
  );
  const minorEligibilityCourses = useMemo(
    () =>
      calendarEntries
        .filter((e) => e.creditContribution !== "ELECTIVE")
        .map((e) => courseById.get(e.courseId))
        .filter((c): c is Course => Boolean(c)),
    [calendarEntries, courseById],
  );
  const electiveProgress = useMemo(() => computeElectiveProgress(electiveProgressCourses), [electiveProgressCourses]);
  const eligibleMinors = useMemo(() => getEligibleMinors(minorEligibilityCourses), [minorEligibilityCourses]);

  function resolveCourse(itemId: string): Course | undefined {
    if (itemId.startsWith(CATALOG_PREFIX)) return courseById.get(itemId.slice(CATALOG_PREFIX.length));
    const entry = entryById.get(itemId);
    return entry ? courseById.get(entry.courseId) : undefined;
  }

  // Placed courses that belong to the currently-selected minor (core or
  // elective) get a small badge on their card; dual-eligible ones (also a
  // real DEL/OPEL/HUEL elective) are tappable to reconsider which
  // requirement they count toward.
  function getMinorBadge(itemId: string): MinorBadgeInfo | undefined {
    if (!selectedMinor) return undefined;
    const entry = entryById.get(itemId);
    if (!entry) return undefined;
    const course = courseById.get(entry.courseId);
    if (!course) return undefined;
    const role = minorRoleByCode.get(course.code);
    if (!role) return undefined;
    const dualEligible = role === "elective" && Boolean(findDualEligibility(course, selectedMinor.id));
    return {
      role,
      minorName: selectedMinor.name,
      dualEligible,
      onReconsider: dualEligible ? () => checkAndPrompt(entry.id, course, entry.creditContribution) : undefined,
    };
  }

  async function handleRemove(itemId: string) {
    const entry = entryById.get(itemId);
    if (!entry) return;
    if (courseById.get(entry.courseId)?.categoryType === "CDC") return; // compulsory — never removable
    await removeCourseFromSemester(calendarId, entry.semesterNumber, entry.courseId);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const overContainer = findContainer(board, overId) ?? (overId in board ? overId : undefined);
    if (!overContainer) return;
    const activeContainer = findContainer(board, activeId);
    if (activeContainer === overContainer) return;

    setBoard((prev) => {
      const overItems = prev[overContainer] ?? [];
      const activeItems = activeContainer ? prev[activeContainer] ?? [] : [];
      const overIndex = overItems.indexOf(overId);

      const activeRect = active.rect.current.translated;
      const overRect = over.rect;
      const isAfter = activeRect && overRect ? activeRect.top > overRect.top + overRect.height / 2 : false;
      const newIndex = overId === overContainer ? overItems.length : overIndex >= 0 ? overIndex + (isAfter ? 1 : 0) : overItems.length;

      const next: Board = {
        ...prev,
        [overContainer]: [...overItems.slice(0, newIndex), activeId, ...overItems.slice(newIndex)],
      };
      if (activeContainer) {
        next[activeContainer] = activeItems.filter((id) => id !== activeId);
      }
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const activeId = String(active.id);
    setActiveId(null);

    if (!over) {
      setBoard(buildBoardFromEntries(entries, calendarId));
      return;
    }

    const overId = String(over.id);
    const overContainer = findContainer(board, overId) ?? (overId in board ? overId : undefined);
    const activeContainer = findContainer(board, activeId);

    if (!overContainer || !activeContainer) {
      setBoard(buildBoardFromEntries(entries, calendarId));
      return;
    }

    let finalBoard = board;
    if (activeContainer === overContainer) {
      const items = board[activeContainer];
      const oldIndex = items.indexOf(activeId);
      const newIndex = overId === overContainer ? items.length - 1 : items.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return;
      // Even when the index doesn't change (the common case for a simple
      // single-item drop, since handleDragOver already optimistically placed
      // it here), a catalog:-sourced item still needs committing — it's not
      // a real TimetableEntry yet. Returning early here used to skip
      // commitBoard entirely for that case, leaving a phantom item that only
      // existed in local state and vanished the next time `board` was
      // re-derived from the real `entries` store.
      if (oldIndex !== newIndex) {
        finalBoard = { ...board, [activeContainer]: arrayMove(items, oldIndex, newIndex) };
        setBoard(finalBoard);
      }
    }

    void commitBoard(finalBoard, [activeContainer, overContainer]);
  }

  async function commitBoard(finalBoard: Board, touchedContainerIds: string[]) {
    const uniqueContainers = Array.from(new Set(touchedContainerIds));
    for (const key of uniqueContainers) {
      const semesterNumber = Number(key.replace("sem-", ""));
      const itemIds = finalBoard[key] ?? [];

      const existingCourseIds = new Set(
        itemIds
          .filter((id) => !id.startsWith(CATALOG_PREFIX))
          .map((id) => entryById.get(id)?.courseId)
          .filter((id): id is string => Boolean(id)),
      );

      const resolvedIds: string[] = [];
      const addedCourseIds = new Set<string>();
      for (const itemId of itemIds) {
        if (itemId.startsWith(CATALOG_PREFIX)) {
          const courseId = itemId.slice(CATALOG_PREFIX.length);
          if (existingCourseIds.has(courseId) || addedCourseIds.has(courseId)) continue;
          const newId = await addEntry(calendarId, courseId, semesterNumber);
          resolvedIds.push(newId);
          addedCourseIds.add(courseId);
          const addedCourse = courseById.get(courseId);
          if (addedCourse) checkAndPrompt(newId, addedCourse);
        } else {
          resolvedIds.push(itemId);
        }
      }
      await setSemesterOrder(calendarId, semesterNumber, resolvedIds);
    }
  }

  // One-shot re-sort of every semester's courses by the chosen key — not a
  // persisted "mode": commits through the same setSemesterOrder path as a
  // manual drag, so dragging afterward still works normally.
  function sortBoardBy(criterion: "credits" | "department") {
    const compare = (a: Course, b: Course) =>
      criterion === "credits" ? a.credits - b.credits : a.department.localeCompare(b.department);

    const newBoard: Board = {};
    for (const semesterNumber of semesters) {
      const key = containerId(semesterNumber);
      const itemIds = board[key] ?? [];
      newBoard[key] = [...itemIds].sort((a, b) => {
        const courseA = resolveCourse(a);
        const courseB = resolveCourse(b);
        if (!courseA || !courseB) return 0;
        return compare(courseA, courseB);
      });
    }
    setBoard(newBoard);
    void Promise.all(semesters.map((n) => setSemesterOrder(calendarId, n, newBoard[containerId(n)] ?? [])));
  }

  const activeCourse = activeId ? resolveCourse(activeId) : undefined;
  const semesters = Array.from({ length: SEMESTER_COUNT }, (_, i) => i + 1);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CreditGauge
                value={totalCredits(allAddedCourses)}
                max={SEMESTER_COUNT * MAX_CREDITS_PER_SEMESTER}
                size={44}
                strokeWidth={4}
              />
              <div>
                <h1 className="font-mono text-xl font-semibold">
                  <span className="text-accent">{">"}</span> overview
                </h1>
                <p className="font-mono text-sm text-foreground/60">
                  {totalCredits(allAddedCourses)} credits across {SEMESTER_COUNT} semesters
                </p>
              </div>
            </div>
            <MinorSelector
              eligibleMinors={eligibleMinors}
              selectedMinorId={profile?.selectedMinorId}
              onSelect={setSelectedMinor}
            />
          </div>

          <ElectiveProgressPanel progress={electiveProgress} />

          <div className="flex items-center gap-1.5 font-mono text-xs text-foreground/60">
            <span>sort each semester by:</span>
            <button
              onClick={() => sortBoardBy("credits")}
              className="rounded-md border border-foreground/20 px-2 py-1 font-medium hover:bg-foreground/5"
            >
              credits
            </button>
            <button
              onClick={() => sortBoardBy("department")}
              className="rounded-md border border-foreground/20 px-2 py-1 font-medium hover:bg-foreground/5"
            >
              department
            </button>
          </div>

          <div className="flex snap-x snap-mandatory flex-row gap-3 overflow-x-auto rounded-2xl border border-foreground/10 bg-surface/40 p-4">
            {semesters.map((semesterNumber) => (
              <SemesterRow
                key={semesterNumber}
                semesterNumber={semesterNumber}
                itemIds={board[containerId(semesterNumber)] ?? []}
                resolveCourse={resolveCourse}
                onRemove={handleRemove}
                getMinorBadge={getMinorBadge}
              />
            ))}
          </div>
        </div>

        <OverviewSidebar />
      </div>

      <DragOverlay>{activeCourse ? <CourseBlock course={activeCourse} isOverlay /> : null}</DragOverlay>

      <ElectiveMinorChoiceDialog
        course={pendingCourse}
        minorName={pendingMinorName}
        currentContribution={pendingContribution}
        onChoose={choose}
        onClose={dismiss}
      />
    </DndContext>
  );
}
