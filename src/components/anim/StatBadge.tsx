"use client";

import { useState } from "react";
import { Sparks } from "@/components/anim/Effects";

/** Header badge that celebrates when its value goes up. */
export default function StatBadge({
  value,
  ready,
  title,
  className,
  cheer,
  children,
}: {
  value: number;
  ready: boolean;
  title: string;
  className: string;
  /** Floating message for an increase of `delta`. */
  cheer: (delta: number) => string;
  children: React.ReactNode;
}) {
  // The first loaded value is the baseline, not an increase.
  const [seen, setSeen] = useState<number | null>(null);
  const [burst, setBurst] = useState({ n: 0, delta: 0 });
  if (ready && seen !== value) {
    setSeen(value);
    if (seen !== null) {
      // A drop (e.g. combo reset) clears the celebration.
      setBurst(
        value > seen
          ? { n: burst.n + 1, delta: value - seen }
          : { n: 0, delta: 0 },
      );
    }
  }

  return (
    <span className="relative inline-block">
      <span
        key={burst.n}
        title={title}
        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${className} ${burst.n ? "anim-celebrate" : ""}`}
      >
        {children}
      </span>
      {burst.n > 0 && (
        <span key={`fx-${burst.n}`}>
          <Sparks />
          <span
            role="status"
            className="fx-float rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white shadow-lg"
          >
            {cheer(burst.delta)}
          </span>
        </span>
      )}
    </span>
  );
}
