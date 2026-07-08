// Fixed 2-entry palette (unlike departmentColors.ts's hashed palette) for the
// Minors tab: core vs. elective courses get a stable, distinguishing color
// regardless of department, following the same shape so it drops into the
// same className patterns as departmentColors.ts.
interface MinorRoleColor {
  card: string;
  text: string;
  subtext: string;
  icon: string;
}

const MINOR_ROLE_PALETTE: Record<"core" | "elective", MinorRoleColor> = {
  core: {
    card: "bg-indigo-100 border-indigo-200",
    text: "text-indigo-950",
    subtext: "text-indigo-800/70",
    icon: "bg-white text-indigo-700",
  },
  elective: {
    card: "bg-teal-100 border-teal-200",
    text: "text-teal-950",
    subtext: "text-teal-800/70",
    icon: "bg-white text-teal-700",
  },
};

export function getMinorRoleColor(role: "core" | "elective"): MinorRoleColor {
  return MINOR_ROLE_PALETTE[role];
}
