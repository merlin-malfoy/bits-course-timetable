"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/state/useAppStore";

const NAV_ITEMS = [
  { href: "/overview", label: "Overview" },
  { href: "/catalog", label: "Catalog" },
  { href: "/compare", label: "Compare" },
  { href: "/settings", label: "Settings" },
];

export function NavBar() {
  const pathname = usePathname();
  const name = useAppStore((s) => s.profile?.name);

  return (
    <header className="sticky top-0 z-20 border-b border-foreground/10 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-3">
        <Link
          href="/overview"
          className="flex min-w-0 shrink-0 items-baseline gap-1.5 font-mono text-sm font-semibold tracking-tight text-foreground"
        >
          <span aria-hidden className="text-accent">{">"}</span>
          <span className="truncate">{name ? `${name}@registrar` : "registrar"}</span>
          <span aria-hidden className="w-[1ch] animate-[terminal-caret_1.1s_steps(1)_infinite] text-accent">
            _
          </span>
        </Link>
        <nav className="flex shrink-0 gap-1 font-mono text-xs">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 rounded-md border px-2 py-1.5 uppercase tracking-wide transition-colors sm:px-3 ${
                  isActive
                    ? "border-accent/40 bg-accent/15 text-accent"
                    : "border-transparent text-foreground/70 hover:border-foreground/15 hover:bg-foreground/5 hover:text-foreground"
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
