import type { Course } from "@/types/course";
import type { CourseCategory } from "@/types/category";
import type { Branch } from "@/types/branch";
import type { TimetableEntry } from "@/types/timetable";
import type { Calendar } from "@/types/calendar";
import type { UserProfile } from "@/types/user";
import type { BoardCourse } from "@/types/board";

// Every screen/component talks only through these interfaces, never directly
// to `idb`. This is the seam that lets local IndexedDB storage be swapped
// for a real backend later without touching UI code.

export interface CourseRepository {
  getAll(): Promise<Course[]>;
  getById(id: string): Promise<Course | undefined>;
  getByCode(code: string): Promise<Course | undefined>;
  upsert(course: Course): Promise<void>;
  bulkUpsert(courses: Course[]): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface CategoryRepository {
  getAll(): Promise<CourseCategory[]>;
  upsert(category: CourseCategory): Promise<void>;
  bulkUpsert(categories: CourseCategory[]): Promise<void>;
}

export interface BranchRepository {
  getAll(): Promise<Branch[]>;
  getByCode(code: string): Promise<Branch | undefined>;
  bulkUpsert(branches: Branch[]): Promise<void>;
}

export interface TimetableRepository {
  getAllForCalendar(calendarId: string): Promise<TimetableEntry[]>;
  getForCalendarSemester(calendarId: string, semesterNumber: number): Promise<TimetableEntry[]>;
  addEntry(entry: TimetableEntry): Promise<void>;
  updateEntry(entry: TimetableEntry): Promise<void>;
  removeEntry(id: string): Promise<void>;
  removeMany(ids: string[]): Promise<void>;
  removeByCourseAndSemester(calendarId: string, semesterNumber: number, courseId: string): Promise<void>;
}

export interface CalendarRepository {
  getAll(): Promise<Calendar[]>;
  getById(id: string): Promise<Calendar | undefined>;
  upsert(calendar: Calendar): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface UserRepository {
  get(): Promise<UserProfile | undefined>;
  upsert(profile: UserProfile): Promise<void>;
}

export interface BoardRepository {
  getAllForCalendar(calendarId: string): Promise<BoardCourse[]>;
  addCourse(entry: BoardCourse): Promise<void>;
  removeByCourse(calendarId: string, courseId: string): Promise<void>;
  removeAllForCalendar(calendarId: string): Promise<void>;
}
