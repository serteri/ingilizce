"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Example } from "@/data/grammar";
import { useReducedMotion } from "@/lib/motion";

const TONES = [
  "bg-blue-100 text-blue-900 border-blue-300",
  "bg-rose-100 text-rose-900 border-rose-300",
  "bg-emerald-100 text-emerald-900 border-emerald-300",
  "bg-amber-100 text-amber-900 border-amber-300",
  "bg-violet-100 text-violet-900 border-violet-300",
  "bg-cyan-100 text-cyan-900 border-cyan-300",
];

/** Mixed-up starting order: odd positions first, reversed. */
function mix(n: number) {
  const all = Array.from({ length: n }, (_, i) => i);
  return [
    ...all.filter((i) => i % 2 === 1),
    ...all.filter((i) => i % 2 === 0).reverse(),
  ];
}

/** Words of an example sentence travel from a jumble into their places. */
export default function SentenceScene({ items }: { items: Example[] }) {
  // step 0, 2, 4...: jumbled; odd steps: in order.
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const box = useRef<HTMLDivElement>(null);
  const spots = useRef(new Map<string, { x: number; y: number }>());
  const reduced = useReducedMotion();

  const n = Math.floor(step / 2) % Math.max(items.length, 1);
  const ex = items[n];
  // Reduced motion users always get the finished sentence.
  const solved = reduced || step % 2 === 1;
  const words = ex ? ex.en.split(" ") : [];
  const order = solved ? words.map((_, i) => i) : mix(words.length);

  useEffect(() => {
    if (!playing || reduced) return;
    const timer = setTimeout(() => setStep((s) => s + 1), solved ? 3200 : 1500);
    return () => clearTimeout(timer);
  }, [step, playing, solved, reduced]);

  // FLIP: animate each word from where it was to where it is now.
  useLayoutEffect(() => {
    const root = box.current;
    if (!root) return;
    const next = new Map<string, { x: number; y: number }>();
    root.querySelectorAll<HTMLElement>("[data-word]").forEach((el, k) => {
      // Nothing to measure while the tab is hidden.
      if (!el.offsetParent) return;
      const id = el.dataset.word!;
      // Layout offsets ignore running transforms.
      const now = { x: el.offsetLeft, y: el.offsetTop };
      next.set(id, now);
      const old = spots.current.get(id);
      if (!old || reduced) return;
      const dx = old.x - now.x;
      const dy = old.y - now.y;
      if (!dx && !dy) return;
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: `translate(${dx / 2}px, ${dy / 2 - 28}px) scale(1.15)`, offset: 0.5 },
          { transform: "none" },
        ],
        { duration: 800, delay: k * 45, easing: "ease-in-out", fill: "backwards" },
      );
    });
    spots.current = next;
  }, [step, reduced]);

  if (!ex) return null;
  const small =
    "rounded-lg bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100";

  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Sentence Scene / Cümle Dizilim Sahnesi
      </h3>
      <div
        className={`space-y-3 rounded-xl border-2 p-4 transition-colors duration-700 ${
          solved ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div
          key={n}
          ref={box}
          aria-label={ex.en}
          className="relative flex min-h-24 flex-wrap content-center items-center justify-center gap-2"
        >
          {order.map((i) => (
            <span
              key={`${n}-${i}`}
              data-word={`${n}-${i}`}
              aria-hidden="true"
              className={`anim-pop inline-block rounded-xl border-2 px-3 py-2 text-base font-bold shadow-sm ${TONES[i % TONES.length]}`}
            >
              {words[i]}
            </span>
          ))}
        </div>
        <p key={`tr-${n}-${solved}`} className="anim-item text-center text-sm text-slate-700">
          {solved ? `✓ ${ex.tr}` : "Kelimeler yerlerini arıyor..."}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {!reduced && (
            <button onClick={() => setPlaying((p) => !p)} className={small}>
              {playing ? "⏸ Sahneyi durdur" : "▶ Oynat"}
            </button>
          )}
          <button
            onClick={() => {
              setPlaying(false);
              setStep((s) => s + (reduced ? 2 : 1));
            }}
            className={small}
          >
            {solved ? "Sonraki cümle →" : "Yerine diz ✨"}
          </button>
        </div>
      </div>
    </section>
  );
}
