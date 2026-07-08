"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/state/useAppStore";
import { DEFAULT_THEME_ID } from "@/lib/constants";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useAppStore((s) => s.profile?.themeId) ?? DEFAULT_THEME_ID;

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;
  }, [themeId]);

  return <>{children}</>;
}
