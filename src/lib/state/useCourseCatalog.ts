import { create } from "zustand";
import type { Course } from "@/types/course";
import type { CourseCategory } from "@/types/category";
import { courseRepository } from "@/lib/db/repositories/courseRepository";
import { categoryRepository } from "@/lib/db/repositories/categoryRepository";

interface CourseCatalogState {
  courses: Course[];
  categories: CourseCategory[];
  isLoaded: boolean;
  load: () => Promise<void>;
  addOrUpdateCourse: (course: Course) => Promise<void>;
  bulkAddCourses: (courses: Course[]) => Promise<void>;
  bulkAddCategories: (categories: CourseCategory[]) => Promise<void>;
  removeCourse: (id: string) => Promise<void>;
}

export const useCourseCatalog = create<CourseCatalogState>((set, get) => ({
  courses: [],
  categories: [],
  isLoaded: false,

  async load() {
    const [courses, categories] = await Promise.all([courseRepository.getAll(), categoryRepository.getAll()]);
    set({ courses, categories, isLoaded: true });
  },

  async addOrUpdateCourse(course: Course) {
    set((state) => ({ courses: [...state.courses.filter((c) => c.id !== course.id), course] }));
    await courseRepository.upsert(course);
  },

  async bulkAddCourses(courses: Course[]) {
    const ids = new Set(courses.map((c) => c.id));
    set((state) => ({ courses: [...state.courses.filter((c) => !ids.has(c.id)), ...courses] }));
    await courseRepository.bulkUpsert(courses);
  },

  async bulkAddCategories(categories: CourseCategory[]) {
    if (categories.length === 0) return;
    const ids = new Set(categories.map((c) => c.id));
    set((state) => ({ categories: [...state.categories.filter((c) => !ids.has(c.id)), ...categories] }));
    await categoryRepository.bulkUpsert(categories);
  },

  async removeCourse(id: string) {
    const previous = get().courses;
    set({ courses: previous.filter((c) => c.id !== id) });
    try {
      await courseRepository.remove(id);
    } catch (err) {
      set({ courses: previous });
      throw err;
    }
  },
}));
