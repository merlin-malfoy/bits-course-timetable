"use client";

import type { MinorEligibility } from "@/lib/scheduling/minorRules";

interface MinorSelectorProps {
  eligibleMinors: MinorEligibility[];
  selectedMinorId?: string;
  onSelect: (minorId: string | null) => void;
}

export function MinorSelector({ eligibleMinors, selectedMinorId, onSelect }: MinorSelectorProps) {
  const isSelectedEligible = eligibleMinors.some(({ minor }) => minor.id === selectedMinorId);

  if (eligibleMinors.length === 0) {
    return <p className="text-sm text-foreground/40">Not eligible for a minor yet — keep adding courses.</p>;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-foreground/70">
      <span>Currently doing</span>
      <select
        value={isSelectedEligible ? selectedMinorId : ""}
        onChange={(e) => onSelect(e.target.value || null)}
        className="rounded-md border border-foreground/15 bg-background px-2 py-1 text-sm font-medium text-foreground outline-none focus:border-accent focus:ring-2 focus:ring-accent/40"
      >
        <option value="" disabled>
          Choose a minor…
        </option>
        {eligibleMinors.map(({ minor }) => (
          <option key={minor.id} value={minor.id}>
            {minor.name}
          </option>
        ))}
      </select>
      <span>minor</span>
    </div>
  );
}
