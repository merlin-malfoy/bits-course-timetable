"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Course } from "@/types/course";
import { SortableCourseBlock } from "@/components/overview/SortableCourseBlock";
import { MAX_CREDITS_PER_SEMESTER, totalCredits } from "@/lib/scheduling/creditRules";

interface SemesterRowProps {
  semesterNumber: number;
  itemIds: string[];
  resolveCourse: (itemId: string) => Course | undefined;
  onRemove: (itemId: string) => void;
}

function isRemovable(course: Course): boolean {
  return course.categoryType !== "CDC";
}

export function SemesterRow({ semesterNumber, itemIds, resolveCourse, onRemove }: SemesterRowProps) {
  const containerId = `sem-${semesterNumber}`;
  const { setNodeRef, isOver } = useDroppable({ id: containerId });

  const courses = itemIds.map((id) => resolveCourse(id)).filter((c): c is Course => Boolean(c));
  const credits = totalCredits(courses);
  const isOverLimit = credits > MAX_CREDITS_PER_SEMESTER;

  return (
    <div
      ref={setNodeRef}
      className={`flex w-32 shrink-0 flex-col gap-2 rounded-xl border-r border-foreground/10 p-2 pr-3 transition-colors last:border-r-0 ${
        isOver ? "bg-accent/10 ring-2 ring-accent/40" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground/80">Sem {semesterNumber}</h3>
      </div>
      <span className={`text-xs ${isOverLimit ? "text-red-500" : "text-foreground/40"}`}>{credits} credits</span>

      <SortableContext id={containerId} items={itemIds} strategy={verticalListSortingStrategy}>
        {itemIds.length > 0 ? (
          <div className="flex min-h-[5rem] flex-col gap-2">
            {itemIds.map((itemId) => {
              const course = resolveCourse(itemId);
              if (!course) return null;
              return (
                <SortableCourseBlock
                  key={itemId}
                  id={itemId}
                  course={course}
                  onRemove={isRemovable(course) ? () => onRemove(itemId) : undefined}
                />
              );
            })}
          </div>
        ) : (
          <p className="flex min-h-[5rem] flex-1 items-center rounded-xl border border-dashed border-foreground/15 px-2 py-3 text-center text-[10px] text-foreground/40">
            Drag a course here to add it.
          </p>
        )}
      </SortableContext>
    </div>
  );
}
