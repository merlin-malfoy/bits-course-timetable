export interface ThemeMeta {
  id: string;
  label: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "night-campus", label: "Night Terminal", description: "Green phosphor on near-black — the definitive registrar terminal." },
  { id: "cozy", label: "Violet Terminal", description: "Magenta/violet phosphor on near-black — a synthwave hacker glow." },
  { id: "high-contrast", label: "Contrast Terminal", description: "Pure black and white with hot terminal cyan — maximum legibility." },
  { id: "paper-academic", label: "Line Printer", description: "Light dot-matrix paper with ink-green type and a deep blue-ink accent." },
];
