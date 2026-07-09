"use client";

import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import type { Course } from "@/types/course";
import { getCategoryTypeColor } from "@/lib/theme/categoryTypeColors";

export interface MinorBadgeInfo {
  role: "core" | "elective";
  minorName: string;
  // True when this course is also a real DEL/OPEL/HUEL elective that could
  // count toward either requirement — makes the badge tappable to reconsider
  // which one it should contribute to (see ElectiveMinorChoiceDialog).
  dualEligible: boolean;
  onReconsider?: () => void;
}

interface CourseBlockProps extends HTMLAttributes<HTMLDivElement> {
  course: Course;
  onRemove?: () => void;
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: CSSProperties;
  minorBadge?: MinorBadgeInfo;
}

// Pure presentational card — SortableCourseBlock wires up the actual
// dnd-kit drag behavior and forwards its ref/listeners here.
export const CourseBlock = forwardRef<HTMLDivElement, CourseBlockProps>(function CourseBlock(
  { course, onRemove, isDragging, isOverlay, style, minorBadge, className = "", ...rest },
  ref,
) {
  const colors = getCategoryTypeColor(course.categoryType);

  return (
    <div
      ref={ref}
      style={{
        ...colors.cardStyle,
        ...(isOverlay ? { boxShadow: "0 4px 8px -2px var(--accent)" } : undefined),
        ...style,
      }}
      className={`group relative flex select-none flex-col gap-1 overflow-hidden rounded-xl border p-2 transition-transform ${
        isOverlay ? "w-28 shrink-0 scale-105" : "w-full"
      } ${isDragging ? "opacity-40" : ""} ${className}`}
      {...rest}
    >
      {isOverlay && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
          style={{
            background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
            opacity: 0.55,
            mixBlendMode: "screen",
            animation: "scanline-sweep 900ms var(--ease-out-quart) 1",
          }}
        />
      )}

      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${course.code} from this semester`}
          className="absolute right-1.5 top-1.5 hidden h-4 w-4 items-center justify-center rounded-full bg-black/20 text-[10px] leading-none hover:bg-black/30 group-hover:flex group-focus-within:flex"
          style={colors.textStyle}
        >
          ×
        </button>
      )}

      <div className="flex flex-col gap-0.5 pr-3">
        <p className="font-mono text-xs font-bold leading-tight" style={colors.textStyle}>
          {course.code}
        </p>
        <p className="line-clamp-2 text-[10px] leading-snug" style={colors.subtextStyle}>
          {course.title}
        </p>
      </div>

      <p className="font-mono text-[10px] font-medium" style={colors.subtextStyle}>
        {course.credits}cr
      </p>

      {minorBadge &&
        (minorBadge.dualEligible ? (
          <button
            type="button"
            onClick={minorBadge.onReconsider}
            title={`${minorBadge.role === "core" ? "Core" : "Elective"} for ${minorBadge.minorName} — tap to change which requirement this counts toward`}
            className="inline-flex w-fit cursor-pointer items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] font-medium text-accent hover:bg-accent/20"
          >
            ★ {minorBadge.role}
          </button>
        ) : (
          <span
            title={`${minorBadge.role === "core" ? "Core" : "Elective"} for ${minorBadge.minorName}`}
            className="inline-flex w-fit items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] font-medium text-accent"
          >
            ★ {minorBadge.role}
          </span>
        ))}
    </div>
  );
});
