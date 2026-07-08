"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useDraggable } from "@dnd-kit/core";
import type { Course } from "@/types/course";
import { getMinorRoleColor } from "@/lib/theme/minorRoleColors";
import { categoryTypeLabel } from "@/lib/scheduling/creditRules";

interface MinorSidebarItemProps {
  course: Course;
  role: "core" | "elective";
  isProjectType: boolean;
}

const TOOLTIP_WIDTH = 224;

// Draggable source for the Overview sidebar's "Minor" tab — same drag
// mechanics as CatalogSidebarItem (synthetic `catalog:{courseId}` id, so
// overview/page.tsx's existing drop-handling needs no changes), just colored
// by minor role instead of department and without a "remove" affordance
// since this list isn't a persisted board — it's a live browse of the
// selected minor's courses.
export function MinorSidebarItem({ course, role, isProjectType }: MinorSidebarItemProps) {
  const colors = getMinorRoleColor(role);
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: `catalog:${course.id}` });
  const itemRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);

  function setRefs(node: HTMLDivElement | null) {
    itemRef.current = node;
    setNodeRef(node);
  }

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
        className={`group relative flex cursor-grab touch-none items-center gap-2 rounded-lg border px-2 py-1.5 active:cursor-grabbing ${colors.card} ${
          isDragging ? "opacity-40" : ""
        }`}
        {...attributes}
        {...listeners}
      >
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${colors.icon}`}>
          {role === "core" ? "C" : "E"}
        </span>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-xs font-semibold ${colors.text}`}>{course.code}</p>
          <p className={`truncate text-[10px] ${colors.subtext}`}>{course.title}</p>
        </div>
        {isProjectType && (
          <span className="shrink-0 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
            Project
          </span>
        )}
        <span className={`shrink-0 text-[10px] font-medium ${colors.subtext}`}>{course.credits}cr</span>
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
              <span>{role === "core" ? "Core" : "Elective"}</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
