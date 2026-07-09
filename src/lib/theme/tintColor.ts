import type { CSSProperties } from "react";

// Shared hue -> themed inline-style resolver, used by categoryTypeColors.ts.
// Reads the --tint-* custom properties defined per theme in globals.css, so
// the same hue renders as a dark terminal card in Night/Violet/Contrast
// Terminal and a light paper card in Line Printer, automatically.
export interface Tint {
  cardStyle: CSSProperties;
  textStyle: CSSProperties;
  subtextStyle: CSSProperties;
  iconStyle: CSSProperties;
}

export function tintFromHue(hue: number): Tint {
  const surface = `oklch(var(--tint-surface-l) var(--tint-surface-c) ${hue})`;
  const text = `oklch(var(--tint-text-l) var(--tint-text-c) ${hue})`;
  const subtext = `oklch(var(--tint-subtext-l) var(--tint-subtext-c) ${hue})`;
  const border = `oklch(var(--tint-text-l) var(--tint-text-c) ${hue} / 0.55)`;

  return {
    cardStyle: { background: surface, borderColor: border },
    textStyle: { color: text },
    subtextStyle: { color: subtext },
    iconStyle: { background: "var(--surface)", color: text },
  };
}
