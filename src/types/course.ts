export type CourseCategoryType = "CDC" | "DEL" | "OPEL" | "HUEL" | "OTHER_ELECTIVE";

export type SemesterParity = "ODD" | "EVEN" | "BOTH";

export interface Course {
  id: string;
  code: string; // "CS F211"
  title: string;
  credits: number;
  categoryType: CourseCategoryType;
  department: string;
  branchApplicability: string[]; // Branch codes; empty = all branches
  semesterParity: SemesterParity;
  instructors?: string[];
  notes?: string;

  // "Vibe" groupings for the catalog browse view.
  categoryIds: string[];

  // Reserved for Phase 2 — present now so no migration is needed later.
  minorTags?: string[];
  difficultyRating?: number;
  popularity?: number;

  // Reserved for Phase 3, unused while everything runs against one calendar.
  calendarId?: string;
}
