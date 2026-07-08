"use client";

import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import type { Course } from "@/types/course";
import { getDepartmentColor } from "@/lib/theme/departmentColors";

interface CourseBlockProps extends HTMLAttributes<HTMLDivElement> {
  course: Course;
  onRemove?: () => void;
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: CSSProperties;
}

// Pure presentational card — SortableCourseBlock wires up the actual
// dnd-kit drag behavior and forwards its ref/listeners here.
export const CourseBlock = forwardRef<HTMLDivElement, CourseBlockProps>(function CourseBlock(
  { course, onRemove, isDragging, isOverlay, style, className = "", ...rest },
  ref,
) {
  const colors = getDepartmentColor(course.department);

  return (
    <div
      ref={ref}
      style={style}
      className={`group relative flex flex-col gap-1 rounded-xl border p-2 ${colors.card} ${
        isOverlay ? "w-28 shrink-0 rotate-2 scale-105 shadow-xl" : "w-full"
      } ${isDragging ? "opacity-40" : ""} ${className}`}
      {...rest}
    >
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${course.code} from this semester`}
          className={`absolute right-1.5 top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[10px] leading-none hover:bg-black/20 group-hover:flex ${colors.text}`}
        >
          ×
        </button>
      )}

      <div className="flex flex-col gap-0.5 pr-3">
        <p className={`text-xs font-bold leading-tight ${colors.text}`}>{course.code}</p>
        <p className={`line-clamp-2 text-[10px] leading-snug ${colors.subtext}`}>{course.title}</p>
      </div>

      <p className={`text-[10px] font-medium ${colors.subtext}`}>{course.credits} credits</p>
    </div>
  );
});
