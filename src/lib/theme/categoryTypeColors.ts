import type { CourseCategoryType } from "@/types/course";
import { tintFromHue, type Tint } from "@/lib/theme/tintColor";

// Fixed hue per requirement category — the app's primary color language.
// Hues pulled from the user-supplied reference palette (dusty rose, sage,
// dusty teal, mauve, mint), each re-rendered through tintColor.ts's
// theme-aware --tint-* tokens so every theme gets its own light/dark balance
// at the same hue.
const CATEGORY_HUES: Record<CourseCategoryType, number> = {
  CDC: 12, // dusty rose/red — the compulsory core
  DEL: 105, // sage green
  OPEL: 180, // dusty teal
  HUEL: 335, // mauve/pink
  OTHER_ELECTIVE: 145, // mint green
};

export function getCategoryTypeColor(categoryType: CourseCategoryType): Tint {
  return tintFromHue(CATEGORY_HUES[categoryType]);
}

// Short badge glyph for tiny (h-6 w-6) circular icons where a full label
// wouldn't fit — full label is shown elsewhere via categoryTypeLabel().
const CATEGORY_INITIAL: Record<CourseCategoryType, string> = {
  CDC: "C",
  DEL: "D",
  OPEL: "O",
  HUEL: "H",
  OTHER_ELECTIVE: "E",
};

export function categoryTypeInitial(categoryType: CourseCategoryType): string {
  return CATEGORY_INITIAL[categoryType];
}
