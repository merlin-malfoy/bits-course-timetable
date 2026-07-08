export interface ThemeMeta {
  id: string;
  label: string;
  description: string;
}

export const THEMES: ThemeMeta[] = [
  { id: "cozy", label: "Warm & Cozy", description: "Cream and terracotta — relaxed, coffee-shop energy." },
  { id: "night-campus", label: "Cool Night Campus", description: "Deep navy with a sky-blue accent for late-night planning." },
  { id: "high-contrast", label: "High Contrast", description: "Pure black and white with a bright accent — maximum legibility." },
  { id: "paper-academic", label: "Paper Academic", description: "Warm paper white with an ink and maroon academic feel." },
];
