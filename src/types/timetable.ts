// One entry = one course placed into one semester of one calendar.
export interface TimetableEntry {
  id: string;
  courseId: string;
  semesterNumber: number;
  calendarId: string;
  addedAt: string;
  // Position within its semester, for the drag-and-drop board. Entries
  // written before this field existed have no `order`; callers should treat
  // that as "sort last" / fall back to `addedAt`.
  order: number;
  // Only meaningful for a course that is BOTH a real DEL/OPEL/HUEL elective
  // AND one of the currently-selected minor's elective-list courses — an
  // explicit choice of which requirement it should count toward, made once
  // via the dialog shown when such a course is added (see
  // electiveMinorAttribution.ts). Undefined (not dual-eligible, or added
  // before this feature/before a minor was selected) means "count toward
  // both", the original behavior — never retroactively reinterpreted.
  creditContribution?: "ELECTIVE" | "MINOR";
}
