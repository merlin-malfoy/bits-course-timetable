import { getDb } from "@/lib/db/db";
import type { CourseRepository } from "@/lib/db/interfaces";
import type { Course } from "@/types/course";

export const courseRepository: CourseRepository = {
  async getAll() {
    const db = await getDb();
    return db.getAll("courses");
  },

  async getById(id) {
    const db = await getDb();
    return db.get("courses", id);
  },

  async getByCode(code) {
    const db = await getDb();
    return db.getFromIndex("courses", "code", code);
  },

  async upsert(course: Course) {
    const db = await getDb();
    await db.put("courses", course);
  },

  async bulkUpsert(courses: Course[]) {
    const db = await getDb();
    const tx = db.transaction("courses", "readwrite");
    await Promise.all([...courses.map((course) => tx.store.put(course)), tx.done]);
  },

  async remove(id) {
    const db = await getDb();
    await db.delete("courses", id);
  },
};
