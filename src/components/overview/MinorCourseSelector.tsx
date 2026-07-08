"use client";

import { minorDefinitions } from "@/data/seed/minors.seed";

interface MinorCourseSelectorProps {
  selectedMinorId: string;
  onSelect: (minorId: string) => void;
}

export function MinorCourseSelector({ selectedMinorId, onSelect }: MinorCourseSelectorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-foreground/70">
      <span>Browsing</span>
      <select
        value={selectedMinorId}
        onChange={(e) => onSelect(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-foreground/15 bg-background px-2 py-1 text-sm font-medium text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
      >
        {minorDefinitions.map((minor) => (
          <option key={minor.id} value={minor.id}>
            {minor.name}
          </option>
        ))}
      </select>
    </div>
  );
}
