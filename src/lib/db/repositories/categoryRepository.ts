import { getDb } from "@/lib/db/db";
import type { CategoryRepository } from "@/lib/db/interfaces";
import type { CourseCategory } from "@/types/category";

export const categoryRepository: CategoryRepository = {
  async getAll() {
    const db = await getDb();
    return db.getAll("categories");
  },

  async upsert(category: CourseCategory) {
    const db = await getDb();
    await db.put("categories", category);
  },

  async bulkUpsert(categories: CourseCategory[]) {
    const db = await getDb();
    const tx = db.transaction("categories", "readwrite");
    await Promise.all([...categories.map((category) => tx.store.put(category)), tx.done]);
  },
};
