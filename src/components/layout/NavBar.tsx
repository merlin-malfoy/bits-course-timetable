"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/state/useAppStore";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview" },
  { href: "/catalog", label: "Catalog" },
  { href: "/settings", label: "Settings" },
];

export function NavBar() {
  const pathname = usePathname();
  const name = useAppStore((s) => s.profile?.name);

  return (
    <header className="sticky top-0 z-20 border-b border-foreground/10 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-3">
        <Link href="/overview" className="min-w-0 shrink-0 truncate font-semibold tracking-tight">
          {name ? `${name}'s Timetable` : "Timetable Planner"}
        </Link>
        <nav className="flex shrink-0 gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-md px-2 py-1.5 text-sm font-medium transition-colors sm:px-3 ${
                  isActive
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
