"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Course } from "@/types/course";
import { SortableCourseBlock } from "@/components/overview/SortableCourseBlock";
import type { MinorBadgeInfo } from "@/components/overview/CourseBlock";
import { CreditGauge } from "@/components/ui/CreditGauge";
import { MAX_CREDITS_PER_SEMESTER, totalCredits } from "@/lib/scheduling/creditRules";

interface SemesterRowProps {
  semesterNumber: number;
  itemIds: string[];
  resolveCourse: (itemId: string) => Course | undefined;
  onRemove: (itemId: string) => void;
  getMinorBadge?: (itemId: string) => MinorBadgeInfo | undefined;
}

function isRemovable(course: Course): boolean {
  return course.categoryType !== "CDC";
}

export function SemesterRow({ semesterNumber, itemIds, resolveCourse, onRemove, getMinorBadge }: SemesterRowProps) {
  const containerId = `sem-${semesterNumber}`;
  const { setNodeRef, isOver } = useDroppable({ id: containerId });

  const courses = itemIds.map((id) => resolveCourse(id)).filter((c): c is Course => Boolean(c));
  const credits = totalCredits(courses);

  return (
    <div
      ref={setNodeRef}
      className={`flex w-36 shrink-0 snap-start flex-col gap-2 rounded-xl border-r border-foreground/10 p-2 pr-3 transition-colors last:border-r-0 ${
        isOver ? "bg-accent/10 ring-2 ring-accent/40" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-mono text-xs font-semibold text-foreground/80">SEM.{String(semesterNumber).padStart(2, "0")}</h3>
          <p className="font-mono text-[10px] text-foreground/50">
            {credits}/{MAX_CREDITS_PER_SEMESTER}cr
          </p>
        </div>
        <CreditGauge value={credits} max={MAX_CREDITS_PER_SEMESTER} size={26} strokeWidth={3} />
      </div>

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
                  minorBadge={getMinorBadge?.(itemId)}
                />
              );
            })}
          </div>
        ) : (
          <p className="flex min-h-[5rem] flex-1 items-center rounded-xl border border-dashed border-foreground/15 px-2 py-3 text-center font-mono text-[10px] text-foreground/50">
            drop course here
          </p>
        )}
      </SortableContext>
    </div>
  );
}
