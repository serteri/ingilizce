"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/motion";

/**
 * Plays the entrance of a section when it scrolls into view. Classes are set on
 * the DOM node directly, so the className here must stay constant.
 */
export default function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !("IntersectionObserver" in window)) return;
    el.classList.add("reveal-wait");
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.classList.replace("reveal-wait", "reveal-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("reveal-wait", "reveal-in");
    };
  }, []);

  return <div ref={ref} className="empty:hidden">{children}</div>;
}
