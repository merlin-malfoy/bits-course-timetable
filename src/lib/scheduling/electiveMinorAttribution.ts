import type { Course, CourseCategoryType } from "@/types/course";
import { minorCourseEntries, type MinorCourseEntry } from "@/data/seed/minors.seed";

const ELECTIVE_CATEGORY_TYPES: CourseCategoryType[] = ["DEL", "OPEL", "HUEL"];

// A course is "dual-eligible" when it's a real DEL/OPEL/HUEL elective AND
// also sits on the currently-selected minor's elective list — the one case
// where a single course could otherwise silently double-count toward both
// an elective requirement and the minor's total. Core minor courses are
// mandatory regardless and aren't part of this — only the elective list
// creates a genuine choice.
export function findDualEligibility(course: Course, selectedMinorId: string | undefined): MinorCourseEntry | undefined {
  if (!selectedMinorId) return undefined;
  if (!ELECTIVE_CATEGORY_TYPES.includes(course.categoryType)) return undefined;
  return minorCourseEntries.find(
    (entry) => entry.minorId === selectedMinorId && entry.code === course.code && entry.role === "elective",
  );
}
