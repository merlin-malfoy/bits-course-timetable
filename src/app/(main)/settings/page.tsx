"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/state/useAppStore";
import { useCourseCatalog } from "@/lib/state/useCourseCatalog";
import { useTimetable } from "@/lib/state/useTimetable";
import { ThemePicker } from "@/components/settings/ThemePicker";
import { CalendarManager } from "@/components/settings/CalendarManager";
import { seedCdcForBranch } from "@/lib/db/seed";
import { DEFAULT_CALENDAR_ID } from "@/lib/constants";

export default function SettingsPage() {
  const profile = useAppStore((s) => s.profile);
  const branches = useAppStore((s) => s.branches);
  const setName = useAppStore((s) => s.setName);
  const setBranch = useAppStore((s) => s.setBranch);
  const calendarId = profile?.activeCalendarId ?? DEFAULT_CALENDAR_ID;
  const branchCode = profile?.branchCode ?? "A7";

  const loadCatalog = useCourseCatalog((s) => s.load);
  const entries = useTimetable((s) => s.entries);
  const removeEntries = useTimetable((s) => s.removeEntries);
  const loadTimetable = useTimetable((s) => s.load);
  const [isResetting, setIsResetting] = useState(false);

  async function handleResetToCdcs() {
    const calendarEntryIds = entries.filter((e) => e.calendarId === calendarId).map((e) => e.id);
    if (calendarEntryIds.length === 0) return;

    const confirmed = window.confirm(
      `Reset your semester plan back to the original ${branchCode} CDC layout? This removes all ${calendarEntryIds.length} placed course${calendarEntryIds.length === 1 ? "" : "s"} (including any CDCs you've moved or retaken) and re-adds the CDC curriculum into its default semesters. Your board stays untouched. This can't be undone.`,
    );
    if (!confirmed) return;

    setIsResetting(true);
    try {
      await removeEntries(calendarEntryIds);
      await seedCdcForBranch(branchCode, calendarId);
      await Promise.all([loadCatalog(), loadTimetable(calendarId)]);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-mono text-xl font-semibold">
        <span className="text-accent">{">"}</span> settings
      </h1>

      <section className="flex flex-col gap-3 rounded-lg border border-foreground/10 bg-surface p-4">
        <h2 className="font-mono text-sm text-foreground/60">{"//"} profile</h2>
        <label className="flex flex-col gap-1 font-mono text-sm">
          name
          <input
            value={profile?.name ?? ""}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-xs rounded-md border border-foreground/15 bg-background px-2 py-1.5"
          />
        </label>
        <label className="flex flex-col gap-1 font-mono text-sm">
          branch
          <select
            value={profile?.branchCode ?? "A7"}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full max-w-xs rounded-md border border-foreground/15 bg-background px-2 py-1.5"
          >
            {branches.map((branch) => (
              <option key={branch.code} value={branch.code}>
                {branch.name} ({branch.code})
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-foreground/10 bg-surface p-4">
        <h2 className="font-mono text-sm text-foreground/60">{"//"} calendars</h2>
        <p className="text-sm text-foreground/70">
          Keep multiple plans side by side — switch which one Overview and Catalog operate on, or duplicate one to
          try a different layout without losing the original. Head to Compare to view several at once.
        </p>
        <CalendarManager />
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-foreground/10 bg-surface p-4">
        <h2 className="font-mono text-sm text-foreground/60">{"//"} theme</h2>
        <ThemePicker />
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-foreground/10 bg-surface p-4">
        <h2 className="font-mono text-sm text-foreground/60">{"//"} data</h2>
        <div className="flex flex-wrap gap-2 font-mono text-sm">
          <Link
            href="/settings/import"
            className="rounded-md border border-foreground/20 px-3 py-1.5 font-medium hover:bg-foreground/5"
          >
            import course list (.xlsx/.csv)
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-red-500/30 bg-surface p-4">
        <h2 className="font-mono text-sm text-red-500">{"//"} danger zone</h2>
        <p className="text-sm text-foreground/70">
          Clear your entire semester plan and re-place the CDC curriculum into its original default semesters —
          undoes any manual moves, retakes, and electives. Your board is left as-is.
        </p>
        <button
          onClick={handleResetToCdcs}
          disabled={isResetting}
          className="self-start rounded-md border border-red-500/40 px-3 py-1.5 font-mono text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50"
        >
          {isResetting ? "resetting…" : "reset plan to original cdc layout"}
        </button>
      </section>
    </div>
  );
}
