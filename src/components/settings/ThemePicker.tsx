"use client";

import { useAppStore } from "@/lib/state/useAppStore";
import { THEMES } from "@/lib/theme/themes";
import { DEFAULT_THEME_ID } from "@/lib/constants";

export function ThemePicker() {
  const themeId = useAppStore((s) => s.profile?.themeId) ?? DEFAULT_THEME_ID;
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {THEMES.map((theme) => {
        const isActive = theme.id === themeId;
        return (
          <button
            key={theme.id}
            onClick={() => setTheme(theme.id)}
            data-theme={theme.id}
            className={`flex flex-col gap-2 rounded-lg border-2 p-3 text-left transition-colors ${
              isActive ? "border-accent" : "border-transparent"
            }`}
            style={{ background: "var(--background)", color: "var(--foreground)" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold">{theme.label}</span>
              {isActive && (
                <span className="font-mono text-xs font-medium" style={{ color: "var(--accent)" }}>
                  active
                </span>
              )}
            </div>
            <p className="text-xs opacity-70">{theme.description}</p>
            <span
              className="inline-block h-4 w-4 rounded-full"
              style={{ background: "var(--accent)", boxShadow: "0 0 6px 1px var(--accent)" }}
            />
          </button>
        );
      })}
    </div>
  );
}
