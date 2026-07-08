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
}
