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
import { ElectiveProgressPanel } from "@/components/catalog/ElectiveProgressPanel";
import { SemesterRow } from "@/components/overview/SemesterRow";
import { OverviewSidebar } from "@/components/overview/OverviewSidebar";
import { CourseBlock } from "@/components/overview/CourseBlock";
import { MinorSelector } from "@/components/overview/MinorSelector";
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

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const entryById = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);

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

  const allAddedCourses = useMemo(
    () =>
      entries
        .filter((e) => e.calendarId === calendarId)
        .map((e) => courseById.get(e.courseId))
        .filter((c): c is Course => Boolean(c)),
    [entries, calendarId, courseById],
  );
  const electiveProgress = useMemo(() => computeElectiveProgress(allAddedCourses), [allAddedCourses]);
  const eligibleMinors = useMemo(() => getEligibleMinors(allAddedCourses), [allAddedCourses]);

  function resolveCourse(itemId: string): Course | undefined {
    if (itemId.startsWith(CATALOG_PREFIX)) return courseById.get(itemId.slice(CATALOG_PREFIX.length));
    const entry = entryById.get(itemId);
    return entry ? courseById.get(entry.courseId) : undefined;
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
        } else {
          resolvedIds.push(itemId);
        }
      }
      await setSemesterOrder(calendarId, semesterNumber, resolvedIds);
    }
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
            <div>
              <h1 className="text-xl font-semibold">Overview</h1>
              <p className="text-sm text-foreground/50">
                {totalCredits(allAddedCourses)} credits across {SEMESTER_COUNT} semesters
              </p>
            </div>
            <MinorSelector
              eligibleMinors={eligibleMinors}
              selectedMinorId={profile?.selectedMinorId}
              onSelect={setSelectedMinor}
            />
          </div>

          <ElectiveProgressPanel progress={electiveProgress} />

          <div className="flex flex-row gap-3 overflow-x-auto rounded-2xl border border-foreground/10 p-4">
            {semesters.map((semesterNumber) => (
              <SemesterRow
                key={semesterNumber}
                semesterNumber={semesterNumber}
                itemIds={board[containerId(semesterNumber)] ?? []}
                resolveCourse={resolveCourse}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>

        <OverviewSidebar />
      </div>

      <DragOverlay>{activeCourse ? <CourseBlock course={activeCourse} isOverlay /> : null}</DragOverlay>
    </DndContext>
  );
}
