import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type { BoardCourse } from "@/types/board";
import { boardRepository } from "@/lib/db/repositories/boardRepository";

interface BoardState {
  entries: BoardCourse[];
  isLoaded: boolean;
  load: (calendarId: string) => Promise<void>;
  addCourse: (calendarId: string, courseId: string) => Promise<void>;
  removeCourse: (calendarId: string, courseId: string) => Promise<void>;
}

export const useBoard = create<BoardState>((set, get) => ({
  entries: [],
  isLoaded: false,

  async load(calendarId: string) {
    const entries = await boardRepository.getAllForCalendar(calendarId);
    set({ entries, isLoaded: true });
  },

  async addCourse(calendarId, courseId) {
    const alreadyOnBoard = get().entries.some((e) => e.calendarId === calendarId && e.courseId === courseId);
    if (alreadyOnBoard) return;

    const entry: BoardCourse = {
      id: uuid(),
      courseId,
      calendarId,
      addedAt: new Date().toISOString(),
    };
    set((state) => ({ entries: [...state.entries, entry] }));
    await boardRepository.addCourse(entry);
  },

  async removeCourse(calendarId, courseId) {
    const previous = get().entries;
    set({
      entries: previous.filter((e) => !(e.calendarId === calendarId && e.courseId === courseId)),
    });
    try {
      await boardRepository.removeByCourse(calendarId, courseId);
    } catch (err) {
      set({ entries: previous });
      throw err;
    }
  },
}));
