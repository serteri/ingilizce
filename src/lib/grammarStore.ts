"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Question, Snippet } from "@/data/grammar";

const KEY = "grammar-state-v1";

type Stored = {
  completed: string[];
  /** Manually requested extra question batches per topic. */
  manual: Record<string, number>;
  /** Automatic daily batches accrued so far (frozen while paused). */
  autoDays: number;
  /** Last day autoDays was brought up to date. */
  lastDate: string;
  paused: boolean;
  /** AI-generated questions appended after the local ones, per topic. */
  extras: Record<string, Question[]>;
  /** AI-generated conversation snippets, per topic. */
  snippets: Record<string, Snippet[]>;
};

export type GrammarState = Stored & { today: string; days: number };

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
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function obj<T>(v: unknown): Record<string, T[]> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, T[]>)
    : {};
}

function fresh(): Stored {
  return {
    completed: [],
    manual: {},
    autoDays: 0,
    lastDate: todayStr(),
    paused: false,
    extras: {},
    snippets: {},
  };
}

function readStored(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Stored> & { startDate?: string };
      const today = todayStr();
      // Older versions stored startDate; treat it as the last accrual date.
      const lastDate =
        typeof p.lastDate === "string"
          ? p.lastDate
          : typeof p.startDate === "string"
            ? p.startDate
            : today;
      return {
        completed: Array.isArray(p.completed) ? p.completed.map(String) : [],
        manual:
          p.manual && typeof p.manual === "object"
            ? (p.manual as Record<string, number>)
            : {},
        autoDays: typeof p.autoDays === "number" ? p.autoDays : 0,
        lastDate,
        paused: p.paused === true,
        extras: obj(p.extras),
        snippets: obj(p.snippets),
      };
    }
    const f = fresh();
    localStorage.setItem(KEY, JSON.stringify(f));
    return f;
  } catch {
    return fresh();
  }
}

/** Brings autoDays up to date; while paused, no days accrue. */
function rolled(s: Stored): Stored {
  const today = todayStr();
  if (s.paused) return { ...s, lastDate: s.lastDate };
  const gained = daysBetween(s.lastDate, today);
  return gained > 0
    ? { ...s, autoDays: s.autoDays + gained, lastDate: today }
    : s;
}

function effective(): GrammarState {
  const s = rolled(readStored());
  return { ...s, today: todayStr(), days: s.autoDays };
}

function save(next: Stored) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const getSnapshot = () => JSON.stringify(effective());
const getServerSnapshot = () => "";

export const grammarActions = {
  complete(id: string) {
    const s = rolled(readStored());
    if (s.completed.includes(id)) return;
    save({ ...s, completed: [...s.completed, id] });
  },
  addBatch(id: string) {
    const s = rolled(readStored());
    save({ ...s, manual: { ...s.manual, [id]: (s.manual[id] ?? 0) + 1 } });
  },
  addExtras(id: string, qs: Question[]) {
    const s = rolled(readStored());
    const list = [...(s.extras[id] ?? []), ...qs].slice(-60);
    save({ ...s, extras: { ...s.extras, [id]: list } });
  },
  addSnippet(id: string, sn: Snippet) {
    const s = rolled(readStored());
    const list = [...(s.snippets[id] ?? []), sn].slice(-5);
    save({ ...s, snippets: { ...s.snippets, [id]: list } });
  },
  /** Pausing freezes the daily counter; resuming restarts it from today. */
  setPaused(paused: boolean) {
    const s = rolled(readStored());
    save({ ...s, paused, lastDate: todayStr() });
  },
};

export function useGrammarState(): GrammarState & { ready: boolean } {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => {
    if (!snap) {
      return {
        completed: [],
        manual: {},
        autoDays: 0,
        lastDate: "",
        paused: false,
        extras: {},
        snippets: {},
        today: "",
        days: 0,
        ready: false,
      };
    }
    return { ...(JSON.parse(snap) as GrammarState), ready: true };
  }, [snap]);
}
