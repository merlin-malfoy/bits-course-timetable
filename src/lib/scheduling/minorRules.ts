import type { Course } from "@/types/course";
import { minorDefinitions, minorCourseEntries, type MinorDefinition, type MinorCourseEntry } from "@/data/seed/minors.seed";

// From "Requirements for a minor" (Minor Programmes for First Degree Students
// at BITS, Students' Academic Cell — p.4). GPA (>= 4.5/10 in the courses
// applied to the minor) is intentionally not checked here: this app doesn't
// track grades yet.
export const MINOR_CORE_MAX_COURSES = 4;
export const MINOR_CORE_MAX_UNITS = 12;
export const MINOR_ELECTIVE_MIN_COURSES = 2;
export const MINOR_ELECTIVE_MIN_UNITS = 6;
// General-rule floor, applied uniformly to every minor (MinorDefinition.
// totalMinCourses/totalMinUnits, what evaluateMinorEligibility actually
// uses, is always 5/15 regardless of what a minor's own program page states).
export const MINOR_TOTAL_MIN_COURSES = 5;
export const MINOR_TOTAL_MIN_UNITS = 15;
// "At most 2 courses (and at most 6 units) out of the above requirement...
// may be met by mandatory courses of the student's degree i.e. major...
// (excluding Humanities requirement)." A course counts as "major" here if
// it's a CDC — HUEL/DEL/OPEL/OTHER_ELECTIVE never do, matching the exclusion.
export const MINOR_MAJOR_OVERLAP_MAX_COURSES = 2;
export const MINOR_MAJOR_OVERLAP_MAX_UNITS = 6;

export interface MinorEligibility {
  minor: MinorDefinition;
  isEligible: boolean;
  coreComplete: boolean;
  coreCompletedCount: number;
  coreTotalCount: number;
  electiveCompletedCount: number;
  electiveCompletedUnits: number;
  totalCourses: number;
  totalUnits: number;
}

// A course only "counts" toward the minor's 5-course/15-unit total (and, by
// extension, toward the elective sub-minimum) if admitting it doesn't push
// the major-CDC overlap past its cap. Courses that are excluded this way are
// still genuinely "taken" — they just can't be double-counted here.
function applyOverlapCap(
  entries: MinorCourseEntry[],
  completedByCode: Map<string, Course>,
  overlap: { coursesUsed: number; unitsUsed: number },
): MinorCourseEntry[] {
  const counted: MinorCourseEntry[] = [];
  for (const entry of entries) {
    const isMajorOverlap = completedByCode.get(entry.code)?.categoryType === "CDC";
    if (isMajorOverlap) {
      const wouldExceed =
        overlap.coursesUsed + 1 > MINOR_MAJOR_OVERLAP_MAX_COURSES ||
        overlap.unitsUsed + entry.credits > MINOR_MAJOR_OVERLAP_MAX_UNITS;
      if (wouldExceed) continue;
      overlap.coursesUsed += 1;
      overlap.unitsUsed += entry.credits;
    }
    counted.push(entry);
  }
  return counted;
}

// Evaluates one minor against the set of courses on the student's plan.
// Core courses for a minor are a small fixed required list (already <= the
// 4-course/12-unit cap by construction in the seed data), so "core complete"
// means all of them are present — not a subset, and unaffected by the overlap
// cap below (that cap limits what counts toward the 5/15 total, not whether
// you've factually taken the mandatory core courses). Electives are a larger
// pool to choose from (min 2 courses/6 units, counted only after the overlap
// cap so a CDC-electives-only selection can't satisfy this on paper while
// contributing nothing to the actual total). Core courses consume the overlap
// allowance before electives do, since the spec doesn't define a tie-break
// and this is a reasonable default.
export function evaluateMinorEligibility(minor: MinorDefinition, completedCourses: Course[]): MinorEligibility {
  const entries = minorCourseEntries.filter((e) => e.minorId === minor.id);
  const coreEntries = entries.filter((e) => e.role === "core");
  const electiveEntries = entries.filter((e) => e.role === "elective");

  const completedByCode = new Map(completedCourses.map((c) => [c.code, c]));

  const completedCore = coreEntries.filter((e) => completedByCode.has(e.code));
  const coreComplete = coreEntries.length > 0 && completedCore.length === coreEntries.length;

  const completedElectives = electiveEntries.filter((e) => completedByCode.has(e.code));

  const overlap = { coursesUsed: 0, unitsUsed: 0 };
  const countedCore = applyOverlapCap(completedCore, completedByCode, overlap);
  const countedElectives = applyOverlapCap(completedElectives, completedByCode, overlap);

  const electiveCompletedCount = countedElectives.length;
  const electiveCompletedUnits = countedElectives.reduce((sum, e) => sum + e.credits, 0);
  const electiveMinMet =
    electiveCompletedCount >= MINOR_ELECTIVE_MIN_COURSES && electiveCompletedUnits >= MINOR_ELECTIVE_MIN_UNITS;

  const totalCourses = countedCore.length + countedElectives.length;
  const totalUnits = [...countedCore, ...countedElectives].reduce((sum, e) => sum + e.credits, 0);
  const totalMet = totalCourses >= minor.totalMinCourses && totalUnits >= minor.totalMinUnits;

  return {
    minor,
    isEligible: coreComplete && electiveMinMet && totalMet,
    coreComplete,
    coreCompletedCount: completedCore.length,
    coreTotalCount: coreEntries.length,
    electiveCompletedCount,
    electiveCompletedUnits,
    totalCourses,
    totalUnits,
  };
}

export function getEligibleMinors(completedCourses: Course[]): MinorEligibility[] {
  return minorDefinitions
    .map((minor) => evaluateMinorEligibility(minor, completedCourses))
    .filter((result) => result.isEligible);
}

// Title-keyword heuristic — the minors seed data doesn't tag project/seminar
// electives explicitly, so this is applied at render time only.
export function isProjectTypeCourse(title: string): boolean {
  return /\b(project|seminar)\b/i.test(title);
}
