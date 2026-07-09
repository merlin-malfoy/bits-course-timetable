"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDraggable } from "@dnd-kit/core";
import type { Course } from "@/types/course";
import { getCategoryTypeColor, categoryTypeInitial } from "@/lib/theme/categoryTypeColors";
import { categoryTypeLabel } from "@/lib/scheduling/creditRules";

interface CatalogSidebarItemProps {
  course: Course;
  onRemoveFromBoard: () => void;
}

const TOOLTIP_WIDTH = 224;

export function CatalogSidebarItem({ course, onRemoveFromBoard }: CatalogSidebarItemProps) {
  const colors = getCategoryTypeColor(course.categoryType);
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: `catalog:${course.id}` });
  const itemRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);

  function setRefs(node: HTMLDivElement | null) {
    itemRef.current = node;
    setNodeRef(node);
  }

  // The sidebar's scrollable list forces overflow-x: auto (a CSS quirk — setting
  // only overflow-y non-visible computes the other axis to auto too), which would
  // clip a CSS-positioned tooltip. Portal it to <body> with JS-computed coordinates instead.
  function showTooltip() {
    const rect = itemRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fitsOnLeft = rect.left - TOOLTIP_WIDTH - 8 > 0;
    setTooltipPosition(
      fitsOnLeft
        ? { top: rect.top, left: rect.left - TOOLTIP_WIDTH - 8 }
        : { top: rect.bottom + 8, left: Math.max(8, rect.right - TOOLTIP_WIDTH) },
    );
  }

  return (
    <>
      <div
        ref={setRefs}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltipPosition(null)}
        style={colors.cardStyle}
        className={`group relative flex cursor-grab touch-none select-none items-center gap-2 rounded-lg border px-2 py-1.5 active:cursor-grabbing ${
          isDragging ? "opacity-40" : ""
        }`}
        {...attributes}
        {...listeners}
      >
        <button
          onClick={onRemoveFromBoard}
          aria-label={`Remove ${course.code} from the board`}
          style={colors.textStyle}
          className="absolute right-1 top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-black/20 text-[10px] leading-none hover:bg-black/30 group-hover:flex group-focus-within:flex"
        >
          ×
        </button>

        <span
          style={colors.iconStyle}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[9px] font-bold"
        >
          {categoryTypeInitial(course.categoryType)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs font-semibold" style={colors.textStyle}>
            {course.code}
          </p>
          <p className="truncate text-[10px]" style={colors.subtextStyle}>
            {course.title}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] font-medium" style={colors.subtextStyle}>
          {course.credits}cr
        </span>
      </div>

      {tooltipPosition &&
        createPortal(
          <div
            style={{ position: "fixed", top: tooltipPosition.top, left: tooltipPosition.left, width: TOOLTIP_WIDTH }}
            className="pointer-events-none z-50 rounded-lg border border-foreground/10 bg-background p-3 text-xs shadow-lg"
          >
            <p className="font-semibold">{course.code}</p>
            <p className="mt-0.5 text-foreground/70">{course.title}</p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-foreground/50">
              <span>{course.credits} credits</span>
              <span>{course.department}</span>
              <span>{categoryTypeLabel(course.categoryType)}</span>
              <span>{course.semesterParity === "BOTH" ? "Any semester" : `${course.semesterParity} sems only`}</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
