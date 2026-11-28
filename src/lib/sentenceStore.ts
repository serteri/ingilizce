"use client";

import { useMemo, useSyncExternalStore } from "react";
import { sentenceKey, type Sentence } from "@/data/sentences";

const KEY = "sentence-pool-v1";
const MAX_EXTRA = 100;
const MAX_DONE = 500;

type Stored = {
  /** Sentences generated while practising, per topic. */
  extra: Record<string, Sentence[]>;
  /** Keys of solved sentences per topic, oldest first. */
  done: Record<string, string[]>;
};

const listeners = new Set<() => void>();

function record<T>(v: unknown): Record<string, T[]> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  return Object.fromEntries(
    Object.entries(v as Record<string, unknown>).filter(([, l]) => Array.isArray(l)),
  ) as Record<string, T[]>;
}

function read(): Stored {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Stored>;
    return { extra: record(p.extra), done: record(p.done) };
  } catch {
    return { extra: {}, done: {} };
  }
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

export const sentenceActions = {
  markDone(topic: string, key: string) {
    const s = read();
    const list = [...(s.done[topic] ?? []).filter((k) => k !== key), key];
    save({ ...s, done: { ...s.done, [topic]: list.slice(-MAX_DONE) } });
  },
  add(topic: string, items: Sentence[]) {
    const s = read();
    const old = s.extra[topic] ?? [];
    const seen = new Set(old.map(sentenceKey));
    const fresh = items.filter((x) => !seen.has(sentenceKey(x)));
    const list = [...old, ...fresh].slice(-MAX_EXTRA);
    save({ ...s, extra: { ...s.extra, [topic]: list } });
  },
};

const getSnapshot = () => JSON.stringify(read());
const getServerSnapshot = () => "";

export function useSentencePool(): Stored {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(
    () => (snap ? (JSON.parse(snap) as Stored) : { extra: {}, done: {} }),
    [snap],
  );
}
