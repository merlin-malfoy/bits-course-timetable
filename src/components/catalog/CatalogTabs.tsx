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
    <div className="flex flex-wrap gap-2 border-b border-foreground/10 pb-3">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${
            activeTab === tab.id ? "bg-accent text-accent-contrast" : "hover:bg-foreground/5"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
