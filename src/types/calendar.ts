// Phase 3 will let users create/name multiple calendars for comparison.
// Phase 1 always operates against one seeded "default" calendar so the
// schema doesn't need to change later.
export interface Calendar {
  id: string;
  name: string;
  createdAt: string;
  isDefault?: boolean;
}
