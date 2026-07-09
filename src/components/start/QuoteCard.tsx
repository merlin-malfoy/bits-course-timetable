"use client";

import { useState, useEffect } from "react";
import { randomQuote } from "@/lib/quotes/motivationalQuotes";

export function QuoteCard() {
  const [quote, setQuote] = useState<string | null>(null);

  useEffect(() => {
    // Picked only after mount (not via useState(randomQuote)) so the server-rendered
    // HTML and the client's first render match — a random pick would otherwise
    // differ between the two and trigger a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuote(randomQuote());
  }, []);

  return (
    <div className="flex max-w-sm flex-col gap-1 text-center">
      <p className="font-mono text-[10px] uppercase tracking-wide text-foreground/50">motd</p>
      <p className="text-sm italic text-foreground/70">{quote ?? " "}</p>
    </div>
  );
}
