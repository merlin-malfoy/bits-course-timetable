import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Course } from "@/types/course";
import type { CourseCategory } from "@/types/category";
import type { Branch } from "@/types/branch";
import type { TimetableEntry } from "@/types/timetable";
import type { Calendar } from "@/types/calendar";
import type { UserProfile } from "@/types/user";
import type { BoardCourse } from "@/types/board";

const DB_NAME = "bits-timetable-db";
const DB_VERSION = 5;

interface AppDBSchema extends DBSchema {
  courses: {
    key: string;
    value: Course;
    indexes: { code: string; categoryType: string; branchApplicability: string };
  };
  categories: {
    key: string;
    value: CourseCategory;
  };
  branches: {
    key: string;
    value: Branch;
  };
  timetableEntries: {
    key: string;
    value: TimetableEntry;
    indexes: {
      semesterNumber: number;
      calendarId: string;
      calendarSemester: [string, number];
    };
  };
  calendars: {
    key: string;
    value: Calendar;
  };
  userProfile: {
    key: string;
    value: UserProfile;
  };
  boardCourses: {
    key: string;
    value: BoardCourse;
    indexes: { calendarId: string };
  };
}

let dbPromise: Promise<IDBPDatabase<AppDBSchema>> | null = null;

export function getDb(): Promise<IDBPDatabase<AppDBSchema>> {
  if (typeof indexedDB === "undefined") {
    throw new Error("getDb() called outside the browser — IndexedDB is unavailable");
  }
  if (!dbPromise) {
    dbPromise = openDB<AppDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const courseStore = db.createObjectStore("courses", { keyPath: "id" });
          courseStore.createIndex("code", "code", { unique: true });
          courseStore.createIndex("categoryType", "categoryType");
          courseStore.createIndex("branchApplicability", "branchApplicability", { multiEntry: true });

          db.createObjectStore("categories", { keyPath: "id" });
          db.createObjectStore("branches", { keyPath: "code" });

          const entryStore = db.createObjectStore("timetableEntries", { keyPath: "id" });
          entryStore.createIndex("semesterNumber", "semesterNumber");
          entryStore.createIndex("calendarId", "calendarId");
          entryStore.createIndex("calendarSemester", ["calendarId", "semesterNumber"]);

          db.createObjectStore("calendars", { keyPath: "id" });
          db.createObjectStore("userProfile", { keyPath: "id" });
        }

        // v1 -> v2: the week/slot-based scheduling system was removed entirely.
        // "slotMaps" no longer exists in AppDBSchema, but may still be present
        // in a v1 database being upgraded, hence the cast.
        const legacySlotMapsStore = "slotMaps" as unknown as "courses";
        if (oldVersion < 2 && db.objectStoreNames.contains(legacySlotMapsStore)) {
          db.deleteObjectStore(legacySlotMapsStore);
        }

        // v2 -> v3: added the drag-and-drop board (a curated subset of the
        // catalog staged for placement, separate from actual semester entries).
        if (oldVersion < 3) {
          const boardStore = db.createObjectStore("boardCourses", { keyPath: "id" });
          boardStore.createIndex("calendarId", "calendarId");
        }

        // v3 -> v4: added a per-minor shortlist board on the Catalog page's
        // Minors tab. v4 -> v5: that tab was removed in favor of dragging
        // straight from a "Minor" tab in the Overview sidebar (same pattern
        // as the Overview drag-and-drop board), so the store is dropped —
        // same cast-and-delete pattern as the v1 -> v2 slotMaps removal.
        const legacyMinorBoardStore = "minorBoardCourses" as unknown as "courses";
        if (oldVersion < 5 && db.objectStoreNames.contains(legacyMinorBoardStore)) {
          db.deleteObjectStore(legacyMinorBoardStore);
        }
      },
    });
  }
  return dbPromise;
}

export type { AppDBSchema };
