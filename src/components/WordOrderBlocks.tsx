"use client";

import { useState } from "react";

type Role = "S" | "V" | "O" | "M" | "P" | "T";

const ROLES: Record<Role, { en: string; tr: string; cls: string }> = {
  S: { en: "Subject", tr: "Özne", cls: "border-blue-300 bg-blue-100 text-blue-900" },
  V: { en: "Verb", tr: "Fiil", cls: "border-rose-300 bg-rose-100 text-rose-900" },
  O: { en: "Object", tr: "Nesne", cls: "border-emerald-300 bg-emerald-100 text-emerald-900" },
  M: { en: "Manner", tr: "Tarz", cls: "border-amber-300 bg-amber-100 text-amber-900" },
  P: { en: "Place", tr: "Yer", cls: "border-violet-300 bg-violet-100 text-violet-900" },
  T: { en: "Time", tr: "Zaman", cls: "border-cyan-300 bg-cyan-100 text-cyan-900" },
};

const EN_ORDER: Role[] = ["S", "V", "O", "M", "P", "T"];
const TR_ORDER: Role[] = ["S", "T", "P", "M", "O", "V"];

type Sample = {
  parts: Record<Role, { en: string; tr: string }>;
  enSentence: string;
  trSentence: string;
};

const SAMPLES: Sample[] = [
  {
    parts: {
      S: { en: "I", tr: "Ben" },
      V: { en: "eat", tr: "ederim" },
      O: { en: "breakfast", tr: "kahvaltı" },
      M: { en: "quickly", tr: "hızlıca" },
      P: { en: "at home", tr: "evde" },
      T: { en: "every day", tr: "her gün" },
    },
    enSentence: "I eat breakfast quickly at home every day.",
    trSentence: "Ben her gün evde hızlıca kahvaltı ederim.",
  },
  {
    parts: {
      S: { en: "She", tr: "O" },
      V: { en: "reads", tr: "okur" },
      O: { en: "a book", tr: "bir kitap" },
      M: { en: "carefully", tr: "dikkatle" },
      P: { en: "in the library", tr: "kütüphanede" },
      T: { en: "on Sundays", tr: "pazar günleri" },
    },
    enSentence: "She reads a book carefully in the library on Sundays.",
    trSentence: "O pazar günleri kütüphanede dikkatle bir kitap okur.",
  },
  {
    parts: {
      S: { en: "We", tr: "Biz" },
      V: { en: "played", tr: "oynadık" },
      O: { en: "football", tr: "futbol" },
      M: { en: "happily", tr: "neşeyle" },
      P: { en: "in the park", tr: "parkta" },
      T: { en: "yesterday", tr: "dün" },
    },
    enSentence: "We played football happily in the park yesterday.",
    trSentence: "Biz dün parkta neşeyle futbol oynadık.",
  },
];

export default function WordOrderBlocks() {
  const [sample, setSample] = useState(0);
  const [turkish, setTurkish] = useState(false);
  const s = SAMPLES[sample];
  const order = turkish ? TR_ORDER : EN_ORDER;

  const tab = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-medium ${
      active ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
    }`;

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Moving Blocks / Hareketli Cümle Blokları
      </h3>
      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button aria-pressed={!turkish} onClick={() => setTurkish(false)} className={tab(!turkish)}>
              🇬🇧 İngilizce Sıra
            </button>
            <button aria-pressed={turkish} onClick={() => setTurkish(true)} className={tab(turkish)}>
              🇹🇷 Türkçe Sıra
            </button>
          </div>
          <div className="flex gap-2">
            {SAMPLES.map((_, i) => (
              <button key={i} aria-pressed={i === sample} onClick={() => setSample(i)} className={tab(i === sample)}>
                Örnek {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Cards stay in the DOM and slide to their new slot: a column on phones, a row from sm up. */}
        <div className="relative h-[21rem] sm:h-28" aria-hidden="true">
          {EN_ORDER.map((role) => {
            const pos = order.indexOf(role);
            const part = s.parts[role];
            return (
              <div
                key={role}
                style={{ ["--i" as string]: pos }}
                className="absolute left-0 top-[calc(var(--i)*3.5rem)] h-14 w-full p-1 transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] sm:left-[calc(var(--i)*100%/6)] sm:top-0 sm:h-28 sm:w-[calc(100%/6)]"
              >
                <div
                  key={`${sample}-${turkish}`}
                  className={`anim-glow flex h-full items-center justify-between gap-1 rounded-xl border-2 px-3 text-center sm:flex-col sm:justify-center sm:px-1 ${ROLES[role].cls}`}
                >
                  <span className="text-[10px] font-semibold uppercase">
                    {ROLES[role].en}
                    <span className="block font-normal normal-case">{ROLES[role].tr}</span>
                  </span>
                  <span className="text-sm font-bold leading-tight">{turkish ? part.tr : part.en}</span>
                  <span className="text-[11px] opacity-70">{turkish ? part.en : part.tr}</span>
                </div>
              </div>
            );
          })}
        </div>

        <p key={`${sample}-${turkish}`} aria-live="polite" className="anim-panel text-center text-sm font-medium text-slate-800">
          {turkish ? s.trSentence : s.enSentence}
        </p>
        <p className="text-center text-xs text-slate-500">
          {turkish
            ? "Türkçede fiil (kırmızı) en sona kayar."
            : "İngilizcede fiil (kırmızı) özneden hemen sonra gelir; yer, zamandan öncedir."}
        </p>
      </div>
    </section>
  );
}
