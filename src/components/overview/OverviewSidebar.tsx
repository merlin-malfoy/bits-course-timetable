"use client";

import { useState } from "react";
import { BoardSidebarContent } from "@/components/overview/BoardSidebarContent";
import { MinorSidebarContent } from "@/components/overview/MinorSidebarContent";

type SidebarTab = "BOARD" | "MINOR";

export function OverviewSidebar() {
  const [tab, setTab] = useState<SidebarTab>("BOARD");

  return (
    <aside className="flex w-full flex-col gap-3 rounded-2xl border border-foreground/10 bg-surface p-3 lg:sticky lg:top-20 lg:w-64 lg:shrink-0 lg:self-start">
      <div className="flex gap-1 border-b border-foreground/10 pb-2 font-mono text-xs">
        <button
          onClick={() => setTab("BOARD")}
          className={`rounded-md px-2.5 py-1 font-medium uppercase tracking-wide ${
            tab === "BOARD" ? "bg-accent text-accent-contrast" : "text-foreground/70 hover:bg-foreground/5"
          }`}
        >
          Board
        </button>
        <button
          onClick={() => setTab("MINOR")}
          className={`rounded-md px-2.5 py-1 font-medium uppercase tracking-wide ${
            tab === "MINOR" ? "bg-accent text-accent-contrast" : "text-foreground/70 hover:bg-foreground/5"
          }`}
        >
          Minor
        </button>
      </div>

      {tab === "BOARD" ? <BoardSidebarContent /> : <MinorSidebarContent />}
    </aside>
  );
}
