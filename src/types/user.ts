export interface UserProfile {
  id: string; // "local-user" constant in Phase 1
  name: string;
  branchCode: string;
  activeCalendarId: string;
  themeId: string;
  createdAt: string;
  // The minor the student is currently tracking progress toward. Only ever
  // set to a minor whose requirements are actually met at selection time —
  // see MinorSelector — but may go stale if courses are later removed.
  selectedMinorId?: string;
}
