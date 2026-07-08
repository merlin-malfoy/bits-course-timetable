import { getDb } from "@/lib/db/db";
import type { TimetableRepository } from "@/lib/db/interfaces";
import type { TimetableEntry } from "@/types/timetable";

export const timetableRepository: TimetableRepository = {
  async getAllForCalendar(calendarId: string) {
    const db = await getDb();
    return db.getAllFromIndex("timetableEntries", "calendarId", calendarId);
  },

  async getForCalendarSemester(calendarId: string, semesterNumber: number) {
    const db = await getDb();
    return db.getAllFromIndex("timetableEntries", "calendarSemester", [calendarId, semesterNumber]);
  },

  async addEntry(entry: TimetableEntry) {
    const db = await getDb();
    const course = await db.get("courses", entry.courseId);
    if (!course) {
      console.warn(`timetableRepository.addEntry: course ${entry.courseId} not found — adding anyway`);
    }
    await db.put("timetableEntries", entry);
  },

  async updateEntry(entry: TimetableEntry) {
    const db = await getDb();
    await db.put("timetableEntries", entry);
  },

  async removeEntry(id: string) {
    const db = await getDb();
    await db.delete("timetableEntries", id);
  },

  async removeMany(ids: string[]) {
    const db = await getDb();
    const tx = db.transaction("timetableEntries", "readwrite");
    await Promise.all([...ids.map((id) => tx.store.delete(id)), tx.done]);
  },

  async removeByCourseAndSemester(calendarId: string, semesterNumber: number, courseId: string) {
    const db = await getDb();
    const entries = await db.getAllFromIndex("timetableEntries", "calendarSemester", [calendarId, semesterNumber]);
    const tx = db.transaction("timetableEntries", "readwrite");
    await Promise.all([
      ...entries.filter((entry) => entry.courseId === courseId).map((entry) => tx.store.delete(entry.id)),
      tx.done,
    ]);
  },
};
