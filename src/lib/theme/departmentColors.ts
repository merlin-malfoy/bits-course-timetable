// Fixed, non-theme-token palette (like the amber/red/emerald status colors
// elsewhere) so department colors stay visually distinct and vivid across
// all four themes rather than shifting with the accent color.
interface DepartmentColor {
  card: string;
  text: string;
  subtext: string;
  icon: string;
}

const PALETTE: DepartmentColor[] = [
  { card: "bg-emerald-100 border-emerald-200", text: "text-emerald-950", subtext: "text-emerald-800/70", icon: "bg-white text-emerald-700" },
  { card: "bg-amber-100 border-amber-200", text: "text-amber-950", subtext: "text-amber-800/70", icon: "bg-white text-amber-700" },
  { card: "bg-sky-100 border-sky-200", text: "text-sky-950", subtext: "text-sky-800/70", icon: "bg-white text-sky-700" },
  { card: "bg-rose-100 border-rose-200", text: "text-rose-950", subtext: "text-rose-800/70", icon: "bg-white text-rose-700" },
  { card: "bg-violet-100 border-violet-200", text: "text-violet-950", subtext: "text-violet-800/70", icon: "bg-white text-violet-700" },
  { card: "bg-lime-100 border-lime-200", text: "text-lime-950", subtext: "text-lime-800/70", icon: "bg-white text-lime-700" },
  { card: "bg-cyan-100 border-cyan-200", text: "text-cyan-950", subtext: "text-cyan-800/70", icon: "bg-white text-cyan-700" },
  { card: "bg-fuchsia-100 border-fuchsia-200", text: "text-fuchsia-950", subtext: "text-fuchsia-800/70", icon: "bg-white text-fuchsia-700" },
  { card: "bg-orange-100 border-orange-200", text: "text-orange-950", subtext: "text-orange-800/70", icon: "bg-white text-orange-700" },
  { card: "bg-teal-100 border-teal-200", text: "text-teal-950", subtext: "text-teal-800/70", icon: "bg-white text-teal-700" },
  { card: "bg-indigo-100 border-indigo-200", text: "text-indigo-950", subtext: "text-indigo-800/70", icon: "bg-white text-indigo-700" },
  { card: "bg-pink-100 border-pink-200", text: "text-pink-950", subtext: "text-pink-800/70", icon: "bg-white text-pink-700" },
];

// Stable djb2 hash so the same department always lands on the same color,
// including departments not known at build time (e.g. from an xlsx import).
function hashString(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function getDepartmentColor(department: string): DepartmentColor {
  return PALETTE[hashString(department) % PALETTE.length];
}
