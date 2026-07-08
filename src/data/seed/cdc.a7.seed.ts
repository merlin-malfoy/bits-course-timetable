import type { Course } from "@/types/course";

// Real CSE (A7) compulsory curriculum, transcribed from an actual BITS
// Pilani Hyderabad performance sheet (Academic Year 2025-2026 onward).
// `typicalSemester` is seed-only metadata (not part of the Course type)
// used by seedCdcForBranch() to know which semester to auto-add each course
// into. Grades aren't tracked — this is a generic catalog seed, not a
// personal transcript.
export interface CdcSeedEntry {
  course: Course;
  typicalSemester: number;
}

function cdc(
  code: string,
  title: string,
  credits: number,
  categoryIds: string[] = [],
): Course {
  return {
    id: `cdc-a7-${code.toLowerCase().replace(/\s+/g, "-")}`,
    code,
    title,
    credits,
    categoryType: "CDC",
    department: code.split(" ")[0],
    branchApplicability: ["A7"],
    semesterParity: "BOTH",
    categoryIds,
  };
}

export const cdcSeedA7: CdcSeedEntry[] = [
  // Semester 1
  { typicalSemester: 1, course: cdc("BIO F101", "Introduction to Biological Sciences", 3) },
  { typicalSemester: 1, course: cdc("BITS F101-1", "Social Conduct", 0.5) },
  { typicalSemester: 1, course: cdc("BITS F103", "Introduction to Engineering Design", 4) },
  { typicalSemester: 1, course: cdc("BITS F111", "Thermodynamics", 3) },
  { typicalSemester: 1, course: cdc("BITS K101-1", "Physical Education, Health & Wellbeing / Creative Arts", 0.5) },
  { typicalSemester: 1, course: cdc("CHEM F101", "Fundamentals of Chemistry", 3) },
  { typicalSemester: 1, course: cdc("MATH F101", "Multivariable Calculus", 3, ["cat-math-heavy"]) },

  // Semester 2
  { typicalSemester: 2, course: cdc("BITS F101-2", "Social Conduct", 0.5) },
  { typicalSemester: 2, course: cdc("BITS F102", "Innovation and Design Thinking", 1) },
  { typicalSemester: 2, course: cdc("BITS K101-2", "Physical Education, Health & Wellbeing / Creative Arts", 0.5) },
  { typicalSemester: 2, course: cdc("CS F111", "Computer Programming", 4, ["cat-coding-intensive"]) },
  { typicalSemester: 2, course: cdc("EEE F111", "Electrical Sciences", 3, ["cat-systems-hardware"]) },
  { typicalSemester: 2, course: cdc("HSS F101", "Understanding Self and Society", 2) },
  { typicalSemester: 2, course: cdc("MATH F102", "Linear Algebra and Complex Variables", 3, ["cat-math-heavy"]) },
  { typicalSemester: 2, course: cdc("MATH F113", "Probability and Statistics", 3, ["cat-math-heavy"]) },
  { typicalSemester: 2, course: cdc("PHY F101", "Oscillations and Waves", 3) },

  // Semester 3
  { typicalSemester: 3, course: cdc("CS F213", "Object Oriented Programming", 4, ["cat-coding-intensive"]) },
  { typicalSemester: 3, course: cdc("CS F214", "Logic in Computer Science", 3, ["cat-theory"]) },
  { typicalSemester: 3, course: cdc("CS F215", "Digital Design", 4, ["cat-systems-hardware"]) },
  { typicalSemester: 3, course: cdc("CS F222", "Discrete Structures for Computer Science", 3, ["cat-theory", "cat-math-heavy"]) },
  { typicalSemester: 3, course: cdc("MATH F211", "Mathematics III", 3, ["cat-math-heavy"]) },

  // Semester 4
  { typicalSemester: 4, course: cdc("BITS F225", "Environmental Studies", 3) },
  { typicalSemester: 4, course: cdc("CS F211", "Data Structures & Algorithms", 4, ["cat-coding-intensive", "cat-theory"]) },
  { typicalSemester: 4, course: cdc("CS F212", "Database Systems", 4, ["cat-coding-intensive", "cat-systems-hardware"]) },
  { typicalSemester: 4, course: cdc("CS F241", "Microprocessors & Interfacing", 4, ["cat-systems-hardware"]) },

  // Semester 5
  { typicalSemester: 5, course: cdc("CS F301", "Principles of Programming Languages", 2, ["cat-theory"]) },
  { typicalSemester: 5, course: cdc("CS F342", "Computer Architecture", 4, ["cat-systems-hardware"]) },
  { typicalSemester: 5, course: cdc("CS F351", "Theory of Computation", 3, ["cat-theory"]) },
  { typicalSemester: 5, course: cdc("CS F372", "Operating Systems", 3, ["cat-systems-hardware", "cat-coding-intensive"]) },

  // Semester 6
  { typicalSemester: 6, course: cdc("CS F303", "Computer Networks", 4, ["cat-systems-hardware"]) },
  { typicalSemester: 6, course: cdc("CS F363", "Compiler Construction", 3, ["cat-coding-intensive", "cat-theory"]) },
  { typicalSemester: 6, course: cdc("CS F364", "Design & Analysis of Algorithms", 3, ["cat-theory", "cat-coding-intensive"]) },

  // Semester 7: no CDCs on record — typically a fully elective semester.

  // Semester 8
  { typicalSemester: 8, course: cdc("BITS F412", "Practice School II", 20) },
];

// Practice School I (BITS F221) runs in a "Summer Term," which this app
// doesn't model as a numbered semester — added to the catalog only, not
// auto-placed. Add it to whichever semester/summer slot makes sense for you.
export const unplacedCdcSeedA7: Course[] = [cdc("BITS F221", "Practice School I", 5)];

// Sem 3 actually offers ECON F211/MGTS F211 as a "pick one" pair, not two
// separate compulsory courses — they were previously (incorrectly) seeded as
// CDC, which made both permanently non-removable. Seeded as OTHER_ELECTIVE
// and left off cdcSeedA7's auto-placement so a student adds whichever one
// they're actually taking; seedCdcForBranch() also corrects any course
// already sitting in a database from before this fix.
export const cdcChoiceElectivesA7: Course[] = [
  { ...cdc("ECON F211", "Principles of Economics", 3), categoryType: "OTHER_ELECTIVE" },
  { ...cdc("MGTS F211", "Principles of Management", 3), categoryType: "OTHER_ELECTIVE" },
];
