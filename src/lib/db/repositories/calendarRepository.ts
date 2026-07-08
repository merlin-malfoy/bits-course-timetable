import { getDb } from "@/lib/db/db";
import type { CalendarRepository } from "@/lib/db/interfaces";
import type { Calendar } from "@/types/calendar";

export const calendarRepository: CalendarRepository = {
  async getAll() {
    const db = await getDb();
    return db.getAll("calendars");
  },

  async getById(id) {
    const db = await getDb();
    return db.get("calendars", id);
  },

  async upsert(calendar: Calendar) {
    const db = await getDb();
    await db.put("calendars", calendar);
  },
};
