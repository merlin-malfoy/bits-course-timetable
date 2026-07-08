// A course staged in the drag-and-drop board's catalog sidebar (Overview
// tab), distinct from a TimetableEntry — being "on the board" just means
// it's visible as a drag source, not that it's placed into a semester yet.
export interface BoardCourse {
  id: string;
  courseId: string;
  calendarId: string;
  addedAt: string;
}
