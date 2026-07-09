"use client";

import type { Course } from "@/types/course";
import type { CourseCategory } from "@/types/category";
import { CourseCard } from "@/components/catalog/CourseCard";

interface CategorySectionProps {
  category: CourseCategory | { id: "uncategorized"; name: string };
  courses: Course[];
  addedSemestersByCourseId: Map<string, number[]>;
  boardCourseIds: Set<string>;
  onAdd: (courseId: string, semesterNumber: number) => void;
  onRemove: (courseId: string, semesterNumber: number) => void;
  onToggleBoard: (courseId: string) => void;
}

export function CategorySection({
  category,
  courses,
  addedSemestersByCourseId,
  boardCourseIds,
  onAdd,
  onRemove,
  onToggleBoard,
}: CategorySectionProps) {
  if (courses.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-sm text-foreground/60">
        <span className="text-accent">{"//"}</span> {category.name.toLowerCase()}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            addedSemesters={addedSemestersByCourseId.get(course.id)}
            isOnBoard={boardCourseIds.has(course.id)}
            onAdd={(semesterNumber) => onAdd(course.id, semesterNumber)}
            onRemove={(semesterNumber) => onRemove(course.id, semesterNumber)}
            onToggleBoard={() => onToggleBoard(course.id)}
          />
        ))}
      </div>
    </section>
  );
}
