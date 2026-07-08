"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/state/useAppStore";
import { useCourseCatalog } from "@/lib/state/useCourseCatalog";
import { useTimetable } from "@/lib/state/useTimetable";
import { useBoard } from "@/lib/state/useBoard";
import { correctCdcChoiceElectives } from "@/lib/db/seed";
import { DEFAULT_CALENDAR_ID } from "@/lib/constants";

export function StoreHydrator({ children }: { children: React.ReactNode }) {
  const isHydrated = useAppStore((s) => s.isHydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  const activeCalendarId = useAppStore((s) => s.profile?.activeCalendarId);
  const loadCatalog = useCourseCatalog((s) => s.load);
  const loadTimetable = useTimetable((s) => s.load);
  const loadBoard = useBoard((s) => s.load);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    correctCdcChoiceElectives().then(loadCatalog);
    loadTimetable(activeCalendarId ?? DEFAULT_CALENDAR_ID);
    loadBoard(activeCalendarId ?? DEFAULT_CALENDAR_ID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, activeCalendarId]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground/60">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
