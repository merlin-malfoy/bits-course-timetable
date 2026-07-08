import { getDb } from "@/lib/db/db";
import type { BoardRepository } from "@/lib/db/interfaces";
import type { BoardCourse } from "@/types/board";

export const boardRepository: BoardRepository = {
  async getAllForCalendar(calendarId: string) {
    const db = await getDb();
    return db.getAllFromIndex("boardCourses", "calendarId", calendarId);
  },

  async addCourse(entry: BoardCourse) {
    const db = await getDb();
    await db.put("boardCourses", entry);
  },

  async removeByCourse(calendarId: string, courseId: string) {
    const db = await getDb();
    const entries = await db.getAllFromIndex("boardCourses", "calendarId", calendarId);
    const tx = db.transaction("boardCourses", "readwrite");
    await Promise.all([
      ...entries.filter((entry) => entry.courseId === courseId).map((entry) => tx.store.delete(entry.id)),
      tx.done,
    ]);
  },
};
