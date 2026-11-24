"use client";

import { useMemo, useState } from "react";
import { LESSONS, sortWords, type Difficulty } from "@/data/lessons";
import { DAILY_WORDS, useVocabState, vocabActions } from "@/lib/vocabStore";

const DIFF_STYLE: Record<Difficulty, { label: string; cls: string }> = {
  easy: { label: "Kolay", cls: "bg-emerald-50 text-emerald-700" },
  medium: { label: "Orta", cls: "bg-amber-50 text-amber-700" },
  hard: { label: "Zor", cls: "bg-rose-50 text-rose-700" },
};

function speak(text: string, onUnsupported: (msg: string) => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onUnsupported("Bu tarayıcı sesli okumayı desteklemiyor.");
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch {
    onUnsupported("Sesli okuma başlatılamadı.");
  }
}

export default function VocabSection() {
  const vocab = useVocabState();
  const [info, setInfo] = useState<string | null>(null);

  const all = useMemo(
    () => sortWords(LESSONS.flatMap((l) => l.words)),
    [],
  );
  const words = all.slice(0, vocab.unlocked);
  const locked = all.length - words.length;
  const learnedCount = words.filter((w) => vocab.learned.includes(w.word)).length;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm">
        <span className="text-slate-700">
          Öğrenilen:{" "}
          <b className="text-emerald-700">
            {learnedCount}/{words.length}
          </b>
          <span className="text-slate-500">
            {" "}
            · açık {words.length}/{all.length}
          </span>
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => vocabActions.setPaused(!vocab.paused)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              vocab.paused
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
            aria-pressed={!vocab.paused}
          >
            {vocab.paused ? "⏸ Duraklatıldı (Paused)" : "▶ Günlük +5 Aktif"}
          </button>
          <button
            onClick={() => vocabActions.unlockMore()}
            className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
          >
            Yeni +{DAILY_WORDS} Kelime Aç
          </button>
        </div>
      </div>
      {info && <p className="text-xs text-amber-700">{info}</p>}

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {words.map((w) => {
          const done = vocab.learned.includes(w.word);
          const d = DIFF_STYLE[w.difficulty];
          return (
            <li
              key={w.word}
              className={`rounded-xl border p-3 ${
                done
                  ? "border-emerald-300 bg-emerald-50/60"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-slate-900">{w.word}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${d.cls}`}
                >
                  {d.label}
                </span>
              </div>
              <p className="text-sm text-blue-700">{w.tr}</p>
              <p className="mt-1 text-xs text-slate-500">
                Okunuş: <span className="font-mono">{w.ipa}</span>{" "}
                <span className="text-slate-400">(ˈ = vurgulu hece)</span>
              </p>
              <p className="mt-1 text-sm italic text-slate-700">“{w.example}”</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => speak(w.word, setInfo)}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                >
                  🔊 Kelime
                </button>
                <button
                  onClick={() => speak(w.example, setInfo)}
                  className="rounded-lg bg-white px-2.5 py-1 text-xs text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                >
                  🔊 Cümle
                </button>
                <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => vocabActions.toggleLearned(w.word)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  ✓ Öğrendim
                </label>
              </div>
            </li>
          );
        })}
      </ul>

      {locked > 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-3 text-center text-sm text-slate-500">
          🔒 {locked} kelime daha kilitli.{" "}
          {vocab.paused
            ? "Günlük ilerleme duraklatıldı."
            : "Her gün 5 yeni kelime açılır."}
        </p>
      )}
    </div>
  );
}
