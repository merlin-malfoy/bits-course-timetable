import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { Calendar } from "@/types/calendar";
import { calendarRepository } from "@/lib/db/repositories/calendarRepository";
import { timetableRepository } from "@/lib/db/repositories/timetableRepository";
import { boardRepository } from "@/lib/db/repositories/boardRepository";

interface CalendarsState {
  calendars: Calendar[];
  isLoaded: boolean;
  load: () => Promise<void>;
  // duplicateFromId, if given, copies every TimetableEntry and BoardCourse
  // from that calendar into the new one (new ids, fresh addedAt) — the
  // "start from a copy of my current plan" path for a real A/B comparison.
  create: (name: string, duplicateFromId?: string) => Promise<string>;
  rename: (id: string, name: string) => Promise<void>;
  // Never removes the last remaining calendar. Cascades: deletes every
  // TimetableEntry and BoardCourse scoped to this calendarId too, so nothing
  // orphaned is left behind in IndexedDB.
  remove: (id: string) => Promise<void>;
}

export const useCalendars = create<CalendarsState>((set, get) => ({
  calendars: [],
  isLoaded: false,

  async load() {
    const calendars = await calendarRepository.getAll();
    set({ calendars, isLoaded: true });
  },

  async create(name, duplicateFromId) {
    const calendar: Calendar = { id: uuid(), name, createdAt: new Date().toISOString() };
    await calendarRepository.upsert(calendar);
    set((state) => ({ calendars: [...state.calendars, calendar] }));

    if (duplicateFromId) {
      const [sourceEntries, sourceBoard] = await Promise.all([
        timetableRepository.getAllForCalendar(duplicateFromId),
        boardRepository.getAllForCalendar(duplicateFromId),
      ]);
      await Promise.all([
        ...sourceEntries.map((entry) =>
          timetableRepository.addEntry({ ...entry, id: uuid(), calendarId: calendar.id, addedAt: new Date().toISOString() }),
        ),
        ...sourceBoard.map((item) =>
          boardRepository.addCourse({ ...item, id: uuid(), calendarId: calendar.id, addedAt: new Date().toISOString() }),
        ),
      ]);
    }

    return calendar.id;
  },

  async rename(id, name) {
    const previous = get().calendars;
    const target = previous.find((c) => c.id === id);
    if (!target) return;
    const updated = { ...target, name };
    set({ calendars: previous.map((c) => (c.id === id ? updated : c)) });
    try {
      await calendarRepository.upsert(updated);
    } catch (err) {
      set({ calendars: previous });
      throw err;
    }
  },

  async remove(id) {
    const previous = get().calendars;
    if (previous.length <= 1) return;
    set({ calendars: previous.filter((c) => c.id !== id) });
    try {
      const entries = await timetableRepository.getAllForCalendar(id);
      await Promise.all([
        timetableRepository.removeMany(entries.map((e) => e.id)),
        boardRepository.removeAllForCalendar(id),
      ]);
      await calendarRepository.remove(id);
    } catch (err) {
      set({ calendars: previous });
      throw err;
    }
  },
}));
