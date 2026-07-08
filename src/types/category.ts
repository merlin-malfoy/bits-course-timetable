// Loose "vibe" groupings for the catalog browse view — distinct from the
// academic-requirement axis (CDC/DEL/OPEL/HUEL) on Course.categoryType.
// A course may belong to multiple categories.
export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  colorToken?: string;
  sortOrder?: number;
}
