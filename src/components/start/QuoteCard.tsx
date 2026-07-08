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
    <p className="max-w-sm text-center text-sm italic text-foreground/60">
      {quote ?? " "}
    </p>
  );
}
