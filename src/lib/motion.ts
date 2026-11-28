"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function watchMotion(cb: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", cb);
  return () => query.removeEventListener("change", cb);
}

export function useReducedMotion() {
  return useSyncExternalStore(watchMotion, reducedMotion, () => false);
}

/**
 * Holds the old value on screen while it leaves the stage.
 * `target` is what was chosen, `shown` is what should be rendered.
 */
export function useStagedValue<T>(initial: T, exitMs = 200) {
  const [target, set] = useState<T>(initial);
  const [shown, setShown] = useState<T>(initial);
  const leaving = target !== shown;

  useEffect(() => {
    if (target === shown) return;
    const timer = setTimeout(
      () => setShown(target),
      reducedMotion() ? 0 : exitMs,
    );
    return () => clearTimeout(timer);
  }, [target, shown, exitMs]);

  return { target, shown, leaving, set };
}
