"use client";

import { useMemo, useSyncExternalStore } from "react";

const KEY = "game-state-v1";

type Stored = {
  xp: number;
  streak: number;
  lastDay: string;
  combo: number;
  best: number;
};

export type GameState = Stored & { level: number };

const listeners = new Set<() => void>();

function dayStr(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const EMPTY: Stored = { xp: 0, streak: 0, lastDay: "", combo: 0, best: 0 };

function read(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<Stored>;
    const n = (v: unknown) => (typeof v === "number" && v >= 0 ? v : 0);
    return {
      xp: n(p.xp),
      streak: n(p.streak),
      lastDay: typeof p.lastDay === "string" ? p.lastDay : "",
      combo: n(p.combo),
      best: n(p.best),
    };
  } catch {
    return EMPTY;
  }
}

/** The streak only counts if the last active day was today or yesterday. */
function effective(): GameState {
  const s = read();
  const alive = s.lastDay === dayStr() || s.lastDay === dayStr(-1);
  const streak = alive ? s.streak : 0;
  return { ...s, streak, level: Math.floor(s.xp / 100) + 1 };
}

function save(next: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

/** Marks today as active and extends the streak when needed. */
function touched(s: Stored): Stored {
  const today = dayStr();
  if (s.lastDay === today) return s;
  const continues = s.lastDay === dayStr(-1);
  return { ...s, streak: continues ? s.streak + 1 : 1, lastDay: today };
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export const gameActions = {
  /** +10 XP, plus a combo bonus of up to +10. */
  correct() {
    const s = touched(read());
    const combo = s.combo + 1;
    save({
      ...s,
      combo,
      best: Math.max(s.best, combo),
      xp: s.xp + 10 + Math.min(combo - 1, 5) * 2,
    });
  },
  /** Finished with a hint or the shown answer: participation XP, no combo. */
  assisted() {
    const s = touched(read());
    save({ ...s, combo: 0, xp: s.xp + 5 });
  },
  wrong() {
    const s = touched(read());
    save({ ...s, combo: 0 });
  },
};

const getSnapshot = () => JSON.stringify(effective());
const getServerSnapshot = () => "";

export function useGameState(): GameState & { ready: boolean } {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    if (!snap) return { ...EMPTY, level: 1, ready: false };
    return { ...(JSON.parse(snap) as GameState), ready: true };
  }, [snap]);
}
