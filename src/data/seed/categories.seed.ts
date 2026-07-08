import type { CourseCategory } from "@/types/category";

export const categoriesSeed: CourseCategory[] = [
  { id: "cat-coding-intensive", name: "Coding Intensive", colorToken: "category-1", sortOrder: 1 },
  { id: "cat-math-heavy", name: "Math-Heavy", colorToken: "category-2", sortOrder: 2 },
  { id: "cat-theory", name: "Theory Deep-Dives", colorToken: "category-3", sortOrder: 3 },
  { id: "cat-systems-hardware", name: "Systems & Hardware", colorToken: "category-4", sortOrder: 4 },
  { id: "cat-chill", name: "Chill Electives", colorToken: "category-5", sortOrder: 5 },
];
