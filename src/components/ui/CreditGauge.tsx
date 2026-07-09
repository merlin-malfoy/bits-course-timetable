"use client";

import { useEffect, useState } from "react";

interface CreditGaugeProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  className?: string;
}

// The Overview board's signature "wow" moment: credit counts render as a
// live radial gauge instead of flat text, animating from empty on mount and
// smoothly re-sweeping to the new fill whenever `value` changes (drag a
// course in/out of a semester). Colors reuse the same plain-Tailwind status
// palette as the rest of the app (red/amber), not theme tokens, per
// creditRules.ts's status-color convention. Respects prefers-reduced-motion
// globally via globals.css's transition-duration override.
export function CreditGauge({ value, max, size = 40, strokeWidth = 4, centerLabel, className = "" }: CreditGaugeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(1, value / max) : 0;
  const isOver = value > max;
  const tone = isOver ? "over" : ratio > 0.85 ? "warning" : "ok";
  const strokeColor = tone === "over" ? "#ef4444" : tone === "warning" ? "#f59e0b" : "var(--accent)";
  const dashOffset = mounted ? circumference * (1 - ratio) : circumference;

  return (
    <div
      role="img"
      aria-label={`${value} of ${max} credits used${isOver ? ", over limit" : ""}`}
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--foreground)" strokeOpacity={0.15} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 700ms var(--ease-out-expo), stroke 300ms var(--ease-out-quart)" }}
        />
      </svg>
      {centerLabel && (
        <span
          className="absolute font-mono font-semibold leading-none"
          style={{ color: strokeColor, fontSize: Math.max(8, size * 0.24) }}
        >
          {centerLabel}
        </span>
      )}
    </div>
  );
}
