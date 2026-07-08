import type { Course, CourseCategoryType } from "@/types/course";

type ElectiveCategoryType = "DEL" | "OPEL" | "HUEL";

export const ELECTIVE_REQUIREMENTS: Record<ElectiveCategoryType, { minCourses: number; minCredits: number }> = {
  DEL: { minCourses: 4, minCredits: 12 },
  OPEL: { minCourses: 5, minCredits: 15 },
  HUEL: { minCourses: 3, minCredits: 8 },
};

export const MAX_CREDITS_PER_SEMESTER = 25;

export interface ElectiveProgress {
  categoryType: ElectiveCategoryType;
  coursesTaken: number;
  creditsTaken: number;
  minCourses: number;
  minCredits: number;
  isSatisfied: boolean;
}

const ELECTIVE_TYPES = Object.keys(ELECTIVE_REQUIREMENTS) as ElectiveCategoryType[];

export function computeElectiveProgress(courses: Course[]): ElectiveProgress[] {
  return ELECTIVE_TYPES.map((categoryType) => {
    const relevant = courses.filter((course) => course.categoryType === categoryType);
    const coursesTaken = relevant.length;
    const creditsTaken = relevant.reduce((sum, course) => sum + course.credits, 0);
    const { minCourses, minCredits } = ELECTIVE_REQUIREMENTS[categoryType];
    return {
      categoryType,
      coursesTaken,
      creditsTaken,
      minCourses,
      minCredits,
      isSatisfied: coursesTaken >= minCourses && creditsTaken >= minCredits,
    };
  });
}

export function totalCredits(courses: Course[]): number {
  return courses.reduce((sum, course) => sum + course.credits, 0);
}

export function isOverCreditLimit(courses: Course[]): boolean {
  return totalCredits(courses) > MAX_CREDITS_PER_SEMESTER;
}

export function categoryTypeLabel(categoryType: CourseCategoryType): string {
  switch (categoryType) {
    case "CDC":
      return "CDC";
    case "DEL":
      return "DEL";
    case "OPEL":
      return "OPEL";
    case "HUEL":
      return "HUEL";
    case "OTHER_ELECTIVE":
      return "Other Elective";
  }
}
