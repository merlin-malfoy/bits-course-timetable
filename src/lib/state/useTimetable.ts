import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { TimetableEntry } from "@/types/timetable";
import { timetableRepository } from "@/lib/db/repositories/timetableRepository";

interface TimetableState {
  entries: TimetableEntry[];
  isLoaded: boolean;
  load: (calendarId: string) => Promise<void>;
  addEntry: (calendarId: string, courseId: string, semesterNumber: number) => Promise<string>;
  removeEntry: (entryId: string) => Promise<void>;
  removeEntries: (entryIds: string[]) => Promise<void>;
  removeCourseFromSemester: (calendarId: string, semesterNumber: number, courseId: string) => Promise<void>;
  // Reconciles one semester's full ordering after a board drag: any entry in
  // `orderedEntryIds` gets `semesterNumber` + `order` (its index) written,
  // whether it's a plain reorder or a move in from a different semester.
  setSemesterOrder: (calendarId: string, semesterNumber: number, orderedEntryIds: string[]) => Promise<void>;
}

export const useTimetable = create<TimetableState>((set, get) => ({
  entries: [],
  isLoaded: false,

  async load(calendarId: string) {
    const entries = await timetableRepository.getAllForCalendar(calendarId);
    set({ entries, isLoaded: true });
  },

  async addEntry(calendarId, courseId, semesterNumber) {
    const order = get().entries.filter(
      (e) => e.calendarId === calendarId && e.semesterNumber === semesterNumber,
    ).length;
    const entry: TimetableEntry = {
      id: uuid(),
      courseId,
      semesterNumber,
      calendarId,
      addedAt: new Date().toISOString(),
      order,
    };
    set((state) => ({ entries: [...state.entries, entry] }));
    await timetableRepository.addEntry(entry);
    return entry.id;
  },

  async setSemesterOrder(calendarId, semesterNumber, orderedEntryIds) {
    const previous = get().entries;
    const byId = new Map(previous.map((e) => [e.id, e]));
    const changed: TimetableEntry[] = [];
    orderedEntryIds.forEach((id, index) => {
      const entry = byId.get(id);
      if (!entry || entry.calendarId !== calendarId) return;
      if (entry.semesterNumber !== semesterNumber || entry.order !== index) {
        changed.push({ ...entry, semesterNumber, order: index });
      }
    });
    if (changed.length === 0) return;

    const changedById = new Map(changed.map((e) => [e.id, e]));
    set({ entries: previous.map((e) => changedById.get(e.id) ?? e) });
    try {
      await Promise.all(changed.map((e) => timetableRepository.updateEntry(e)));
    } catch (err) {
      set({ entries: previous });
      throw err;
    }
  },

  async removeEntry(entryId) {
    const previous = get().entries;
    set({ entries: previous.filter((e) => e.id !== entryId) });
    try {
      await timetableRepository.removeEntry(entryId);
    } catch (err) {
      set({ entries: previous });
      throw err;
    }
  },

  async removeEntries(entryIds) {
    if (entryIds.length === 0) return;
    const previous = get().entries;
    const idSet = new Set(entryIds);
    set({ entries: previous.filter((e) => !idSet.has(e.id)) });
    try {
      await timetableRepository.removeMany(entryIds);
    } catch (err) {
      set({ entries: previous });
      throw err;
    }
  },

  async removeCourseFromSemester(calendarId, semesterNumber, courseId) {
    const previous = get().entries;
    set({
      entries: previous.filter(
        (e) => !(e.calendarId === calendarId && e.semesterNumber === semesterNumber && e.courseId === courseId),
      ),
    });
    try {
      await timetableRepository.removeByCourseAndSemester(calendarId, semesterNumber, courseId);
    } catch (err) {
      set({ entries: previous });
      throw err;
    }
  },
}));
