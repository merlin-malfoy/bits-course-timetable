import { branchRepository } from "@/lib/db/repositories/branchRepository";
import { categoryRepository } from "@/lib/db/repositories/categoryRepository";
import { calendarRepository } from "@/lib/db/repositories/calendarRepository";
import { courseRepository } from "@/lib/db/repositories/courseRepository";
import { timetableRepository } from "@/lib/db/repositories/timetableRepository";
import { branchesSeed } from "@/data/seed/branches.seed";
import { categoriesSeed } from "@/data/seed/categories.seed";
import { cdcSeedA7, unplacedCdcSeedA7, cdcChoiceElectivesA7 } from "@/data/seed/cdc.a7.seed";
import { minorCourseEntries } from "@/data/seed/minors.seed";
import { electiveSeedA7 } from "@/data/seed/electives.a7.seed";
import type { Course } from "@/types/course";
import { DEFAULT_CALENDAR_ID } from "@/lib/constants";

// Bootstraps reference data (branches, vibe categories, and the single
// default calendar) on first-ever load. Idempotent: only runs when the
// branches store is still empty, so it's safe to call unconditionally from
// StoreHydrator on every mount.
export async function seedIfEmpty(): Promise<void> {
  const existingBranches = await branchRepository.getAll();
  if (existingBranches.length > 0) return;

  await branchRepository.bulkUpsert(branchesSeed);
  await categoryRepository.bulkUpsert(categoriesSeed);
  await calendarRepository.upsert({
    id: DEFAULT_CALENDAR_ID,
    name: "My Plan",
    isDefault: true,
    createdAt: new Date().toISOString(),
  });
}

const branchCdcSeeds: Record<string, typeof cdcSeedA7> = {
  A7: cdcSeedA7,
};

const branchUnplacedCdcSeeds: Record<string, Course[]> = {
  A7: unplacedCdcSeedA7,
};

const branchCdcChoiceElectiveSeeds: Record<string, Course[]> = {
  A7: cdcChoiceElectivesA7,
};

// ECON F211/MGTS F211 used to be seeded as CDC (see cdc.a7.seed.ts's
// cdcChoiceElectivesA7 comment) before it was noticed they're actually a
// "pick one" pair, not two compulsory courses. Called unconditionally from
// StoreHydrator on every mount (cheap — a couple of index lookups) so a
// database that already ran the old CDC seed gets corrected without the
// user needing to know to re-click "Load CDCs".
export async function correctCdcChoiceElectives(): Promise<void> {
  for (const courses of Object.values(branchCdcChoiceElectiveSeeds)) {
    for (const course of courses) {
      const existingCourse = await courseRepository.getByCode(course.code);
      if (existingCourse?.categoryType === "CDC") {
        await courseRepository.upsert({ ...existingCourse, categoryType: "OTHER_ELECTIVE" });
      }
    }
  }
}

const branchElectiveSeeds: Record<string, typeof electiveSeedA7> = {
  A7: electiveSeedA7,
};

// Re-triggerable, idempotent CDC auto-add: loads CDC courses into the
// catalog (skipping ones already present) and adds a timetable entry for
// each into its typical semester (skipping ones already added). Courses
// with no settled semester placement (e.g. Practice School I, whose summer
// term isn't modeled as a numbered semester) are added to the catalog only,
// left for you to place manually.
export async function seedCdcForBranch(
  branchCode: string,
  calendarId: string,
): Promise<{ addedCourses: number; addedEntries: number }> {
  const seedEntries = branchCdcSeeds[branchCode] ?? [];
  const unplacedCourses = branchUnplacedCdcSeeds[branchCode] ?? [];
  const choiceElectives = branchCdcChoiceElectiveSeeds[branchCode] ?? [];
  let addedCourses = 0;
  let addedEntries = 0;

  for (const { course, typicalSemester } of seedEntries) {
    const existingCourse = await courseRepository.getByCode(course.code);
    if (!existingCourse) {
      await courseRepository.upsert(course);
      addedCourses++;
    } else if (existingCourse.categoryType !== "CDC") {
      // A CDC is compulsory — never leave it classified as whatever elective
      // type it happened to be seeded as first.
      await courseRepository.upsert({ ...existingCourse, categoryType: "CDC" });
    }
    const courseId = existingCourse?.id ?? course.id;

    const semesterEntries = await timetableRepository.getForCalendarSemester(calendarId, typicalSemester);
    const alreadyAdded = semesterEntries.some((entry) => entry.courseId === courseId);
    if (!alreadyAdded) {
      await timetableRepository.addEntry({
        id: `cdc-${calendarId}-${courseId}`,
        courseId,
        semesterNumber: typicalSemester,
        calendarId,
        addedAt: new Date().toISOString(),
        order: semesterEntries.length,
      });
      addedEntries++;
    }
  }

  for (const course of unplacedCourses) {
    const existingCourse = await courseRepository.getByCode(course.code);
    if (!existingCourse) {
      await courseRepository.upsert(course);
      addedCourses++;
    } else if (existingCourse.categoryType !== "CDC") {
      await courseRepository.upsert({ ...existingCourse, categoryType: "CDC" });
    }
  }

  // ECON F211/MGTS F211 are a "pick one" pair, not two compulsory courses —
  // this used to seed them as CDC (permanently non-removable). Correct any
  // database that already ran the old CDC seed by downgrading them back to
  // OTHER_ELECTIVE; leave alone if something else (e.g. an xlsx import or
  // seedElectivesForBranch) has already given them a more specific category.
  for (const course of choiceElectives) {
    const existingCourse = await courseRepository.getByCode(course.code);
    if (!existingCourse) {
      await courseRepository.upsert(course);
      addedCourses++;
    } else if (existingCourse.categoryType === "CDC") {
      await courseRepository.upsert({ ...existingCourse, categoryType: "OTHER_ELECTIVE" });
    }
  }

  return { addedCourses, addedEntries };
}

// Re-triggerable, idempotent minors-elective loader. Each minor's core and
// elective courses are seeded into the catalog as OTHER_ELECTIVE courses
// tagged with `minorTags`. Course codes that already exist in the catalog
// (e.g. a course that's both a CDC and a minor elective) are left as-is
// except for merging in the new minorTags, so real CDC classification is
// never downgraded.
export async function seedMinorsData(): Promise<{ addedCourses: number; updatedCourses: number }> {
  let addedCourses = 0;
  let updatedCourses = 0;

  const byCode = new Map<string, { code: string; title: string; credits: number; minorTags: string[] }>();
  for (const entry of minorCourseEntries) {
    const existing = byCode.get(entry.code);
    if (existing) {
      if (!existing.minorTags.includes(entry.minorId)) existing.minorTags.push(entry.minorId);
    } else {
      byCode.set(entry.code, { code: entry.code, title: entry.title, credits: entry.credits, minorTags: [entry.minorId] });
    }
  }

  for (const entry of byCode.values()) {
    const existingCourse = await courseRepository.getByCode(entry.code);
    if (existingCourse) {
      const mergedTags = Array.from(new Set([...(existingCourse.minorTags ?? []), ...entry.minorTags]));
      const tagsChanged = mergedTags.length !== (existingCourse.minorTags?.length ?? 0);
      if (tagsChanged) {
        await courseRepository.upsert({ ...existingCourse, minorTags: mergedTags });
        updatedCourses++;
      }
      continue;
    }

    const department = entry.code.split(" ")[0];
    const newCourse: Course = {
      id: `minor-${entry.code.toLowerCase().replace(/\s+/g, "-")}`,
      code: entry.code,
      title: entry.title,
      credits: entry.credits,
      categoryType: "OTHER_ELECTIVE",
      department,
      branchApplicability: [],
      semesterParity: "BOTH",
      categoryIds: [],
      minorTags: entry.minorTags,
    };
    await courseRepository.upsert(newCourse);
    addedCourses++;
  }

  return { addedCourses, updatedCourses };
}

// Re-triggerable, idempotent DEL/HUEL/OPEL elective-pool loader, seeded from
// the official course list spreadsheet. Never downgrades a course that's
// already classified as CDC; upgrades a course seeded as OTHER_ELECTIVE (e.g.
// by seedMinorsData, before we knew its real DEL/HUEL/OPEL classification)
// to its authoritative category from this list. Existing titles are kept
// as-is rather than overwritten, since earlier seed sources may already
// have a fuller title than this list's abbreviated ones.
export async function seedElectivesForBranch(branchCode: string): Promise<{ addedCourses: number; updatedCourses: number }> {
  const seedEntries = branchElectiveSeeds[branchCode] ?? [];
  let addedCourses = 0;
  let updatedCourses = 0;

  for (const entry of seedEntries) {
    const existingCourse = await courseRepository.getByCode(entry.code);
    if (existingCourse) {
      if (existingCourse.categoryType === "OTHER_ELECTIVE") {
        await courseRepository.upsert({ ...existingCourse, categoryType: entry.categoryType });
        updatedCourses++;
      }
      continue;
    }

    const department = entry.code.split(" ")[0];
    const newCourse: Course = {
      id: `elective-${entry.code.toLowerCase().replace(/\s+/g, "-")}`,
      code: entry.code,
      title: entry.title,
      credits: entry.credits,
      categoryType: entry.categoryType,
      department,
      branchApplicability: entry.categoryType === "DEL" ? [branchCode] : [],
      semesterParity: "BOTH",
      categoryIds: [],
    };
    await courseRepository.upsert(newCourse);
    addedCourses++;
  }

  return { addedCourses, updatedCourses };
}
