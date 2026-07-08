"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Course } from "@/types/course";
import { CourseBlock } from "@/components/overview/CourseBlock";

interface SortableCourseBlockProps {
  id: string;
  course: Course;
  onRemove?: () => void;
}

export function SortableCourseBlock({ id, course, onRemove }: SortableCourseBlockProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id });

  return (
    <CourseBlock
      ref={setNodeRef}
      course={course}
      onRemove={onRemove}
      isDragging={isDragging}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="cursor-grab touch-none active:cursor-grabbing"
      {...attributes}
      {...listeners}
    />
  );
}
