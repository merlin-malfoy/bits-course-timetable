"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/lib/state/useAppStore";
import { useCourseCatalog } from "@/lib/state/useCourseCatalog";
import { useTimetable } from "@/lib/state/useTimetable";
import { ThemePicker } from "@/components/settings/ThemePicker";
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
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-4">
        <h2 className="text-sm font-semibold">Profile</h2>
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            value={profile?.name ?? ""}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-xs rounded-md border border-foreground/15 bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Branch
          <select
            value={profile?.branchCode ?? "A7"}
            onChange={(e) => setBranch(e.target.value)}
            className="w-full max-w-xs rounded-md border border-foreground/15 bg-background px-2 py-1.5 text-sm"
          >
            {branches.map((branch) => (
              <option key={branch.code} value={branch.code}>
                {branch.name} ({branch.code})
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-4">
        <h2 className="text-sm font-semibold">Theme</h2>
        <ThemePicker />
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-4">
        <h2 className="text-sm font-semibold">Data</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/settings/import"
            className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm font-medium hover:bg-foreground/5"
          >
            Import course list (.xlsx/.csv)
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-lg border border-red-500/20 p-4">
        <h2 className="text-sm font-semibold text-red-500">Danger zone</h2>
        <p className="text-sm text-foreground/60">
          Clear your entire semester plan and re-place the CDC curriculum into its original default semesters —
          undoes any manual moves, retakes, and electives. Your board is left as-is.
        </p>
        <button
          onClick={handleResetToCdcs}
          disabled={isResetting}
          className="self-start rounded-md border border-red-500/40 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500/10 disabled:opacity-50"
        >
          {isResetting ? "Resetting…" : "Reset plan to original CDC layout"}
        </button>
      </section>
    </div>
  );
}
