"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Course } from "@/types/course";
import { CourseBlock, type MinorBadgeInfo } from "@/components/overview/CourseBlock";

interface SortableCourseBlockProps {
  id: string;
  course: Course;
  onRemove?: () => void;
  minorBadge?: MinorBadgeInfo;
}

export function SortableCourseBlock({ id, course, onRemove, minorBadge }: SortableCourseBlockProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id,
    transition: { duration: 250, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  });

  return (
    <CourseBlock
      ref={setNodeRef}
      course={course}
      onRemove={onRemove}
      isDragging={isDragging}
      minorBadge={minorBadge}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="cursor-grab touch-none active:cursor-grabbing"
      {...attributes}
      {...listeners}
    />
  );
}
