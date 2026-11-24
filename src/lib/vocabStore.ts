"use client";

import { useMemo, useSyncExternalStore } from "react";

const KEY = "vocab-state-v1";
const DAILY = 5;

type Stored = {
  unlocked: number;
  lastDate: string;
  paused: boolean;
  learned: string[];
};

export type VocabState = Stored & { today: string };

const listeners = new Set<() => void>();

function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function daysBetween(from: string, to: string) {
  const a = new Date(`${from}T00:00:00`).getTime();
  const b = new Date(`${to}T00:00:00`).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function readStored(): Stored {
  const fallback: Stored = {
    unlocked: DAILY,
    lastDate: todayStr(),
    paused: false,
    learned: [],
  };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      // Persist the start so daily unlocking works across visits.
      localStorage.setItem(KEY, JSON.stringify(fallback));
      return fallback;
    }
    const p = JSON.parse(raw) as Partial<Stored>;
    return {
      unlocked: typeof p.unlocked === "number" ? p.unlocked : DAILY,
      lastDate: typeof p.lastDate === "string" ? p.lastDate : todayStr(),
      paused: p.paused === true,
      learned: Array.isArray(p.learned) ? p.learned.map(String) : [],
    };
  } catch {
    return fallback;
  }
}

/** Stored state with the daily +5 automation applied (unless paused). */
function effective(): VocabState {
  const s = readStored();
  const today = todayStr();
  if (!s.paused) {
    const days = daysBetween(s.lastDate, today);
    if (days > 0) {
      return { ...s, unlocked: s.unlocked + DAILY * days, lastDate: today, today };
    }
  }
  return { ...s, today };
}

function save(next: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep working without persistence */
  }
  listeners.forEach((l) => l());
}

function strip(s: VocabState): Stored {
  return {
    unlocked: s.unlocked,
    lastDate: s.lastDate,
    paused: s.paused,
    learned: s.learned,
  };
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

// The snapshot is a string so useSyncExternalStore sees stable values.
const getSnapshot = () => JSON.stringify(effective());
const getServerSnapshot = () => "";

export const vocabActions = {
  toggleLearned(word: string) {
    const s = effective();
    const learned = s.learned.includes(word)
      ? s.learned.filter((w) => w !== word)
      : [...s.learned, word];
    save({ ...strip(s), learned });
  },
  setPaused(paused: boolean) {
    const s = effective();
    // Resuming starts counting days from today (no catch-up for paused days).
    save({ ...strip(s), paused, lastDate: todayStr() });
  },
  unlockMore() {
    const s = effective();
    save({ ...strip(s), unlocked: s.unlocked + DAILY });
  },
  reset() {
    save({ unlocked: DAILY, lastDate: todayStr(), paused: false, learned: [] });
  },
};

export const DAILY_WORDS = DAILY;

export function useVocabState(): (VocabState & { ready: boolean }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    if (!snap) {
      return {
        unlocked: DAILY,
        lastDate: "",
        paused: false,
        learned: [],
        today: "",
        ready: false,
      };
    }
    return { ...(JSON.parse(snap) as VocabState), ready: true };
  }, [snap]);
}
