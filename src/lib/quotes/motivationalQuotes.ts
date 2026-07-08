export const motivationalQuotes: string[] = [
  "Small steps, every semester, add up to a degree.",
  "The best time to plan your semester was yesterday. The next best time is now.",
  "Pick courses that stretch you, not just ones that are easy to grade.",
  "A well-planned timetable is a gift to your future, sleep-deprived self.",
  "Every CDC you clear is one less thing standing between you and graduation.",
  "Balance is a skill — practice it on your timetable before you need it in life.",
  "You don't have to have it all figured out. You just have to take the next course.",
  "Progress, not perfection — one semester at a time.",
];

export function randomQuote(): string {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
}
