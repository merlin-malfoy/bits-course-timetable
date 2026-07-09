"use client";

export type CatalogTab = "DEL" | "OPEL" | "HUEL" | "ALL";

const TABS: { id: CatalogTab; label: string }[] = [
  { id: "DEL", label: "DEL" },
  { id: "OPEL", label: "OPEL" },
  { id: "HUEL", label: "HUEL" },
  { id: "ALL", label: "All Courses" },
];

interface CatalogTabsProps {
  activeTab: CatalogTab;
  onChange: (tab: CatalogTab) => void;
}

export function CatalogTabs({ activeTab, onChange }: CatalogTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-foreground/10 pb-3 font-mono text-sm">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-md border px-3 py-1.5 font-medium transition-colors ${
            activeTab === tab.id
              ? "border-accent/40 bg-accent/15 text-accent"
              : "border-transparent text-foreground/70 hover:border-foreground/15 hover:bg-foreground/5 hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
