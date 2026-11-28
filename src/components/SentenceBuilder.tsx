"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Sparks } from "@/components/anim/Effects";
import type { Example } from "@/data/grammar";
import { gameActions } from "@/lib/gameStore";
import { reducedMotion } from "@/lib/motion";

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Deterministic shuffle (same on server and client); never equals the input. */
function scramble(words: string[], seed: number) {
  const idx = words.map((_, i) => i);
  let x = seed * 9301 + 49297;
  for (let i = idx.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = x % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  if (idx.every((v, i) => v === i) && idx.length > 1) idx.reverse();
  return idx;
}

type Status = "idle" | "ok" | "bad";

export default function SentenceBuilder({ items }: { items: Example[] }) {
  const usable = items.filter((e) => e.en.split(" ").length >= 3);
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [hint, setHint] = useState("");
  const root = useRef<HTMLDivElement>(null);
  // Where the tapped word was, so it can fly to its new place.
  const flight = useRef<{ to: string; from: DOMRect } | null>(null);

  useLayoutEffect(() => {
    const f = flight.current;
    flight.current = null;
    if (!f || reducedMotion()) return;
    const el = root.current?.querySelector<HTMLElement>(`[data-fly="${f.to}"]`);
    if (!el) return;
    const now = el.getBoundingClientRect();
    const dx = f.from.x - now.x;
    const dy = f.from.y - now.y;
    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        {
          transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 26}px) scale(1.25) rotate(-4deg)`,
          offset: 0.55,
        },
        { transform: "none" },
      ],
      { duration: 520, easing: "cubic-bezier(0.34, 1.3, 0.64, 1)" },
    );
  }, [picked]);

  function launch(to: string, el: HTMLElement) {
    flight.current = { to, from: el.getBoundingClientRect() };
  }

  if (usable.length === 0) return null;
  const ex = usable[n % usable.length];
  const words = ex.en.split(" ");
  const order = scramble(words, n + words.length * 7);

  function pick(i: number) {
    if (status === "ok") return;
    const next = [...picked, i];
    setPicked(next);
    setStatus("idle");
    setHint("");
    if (next.length === words.length) {
      const built = next.map((k) => words[k]).join(" ");
      if (norm(built) === norm(ex.en)) {
        setStatus("ok");
        gameActions.correct();
      } else {
        setStatus("bad");
        gameActions.wrong();
        const firstOk = norm(words[next[0]]) === norm(words[0]);
        setHint(
          `${firstOk ? "" : "İpucu / Hint: cümle genelde özneyle başlar (Subject first). "}${
            ex.note ? ex.note : ""
          }`.trim() || "Tekrar dene: fiil özneden hemen sonra gelir (Verb right after the subject).",
        );
      }
    }
  }

  function unpick(k: number) {
    if (status === "ok") return;
    setPicked(picked.filter((_, p) => p !== k));
    setStatus("idle");
    setHint("");
  }

  function reset() {
    setPicked([]);
    setStatus("idle");
    setHint("");
  }

  function nextSentence() {
    setN((v) => v + 1);
    setPicked([]);
    setStatus("idle");
    setHint("");
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Cümle Kur · Sentence Builder
      </h3>
      <div
        ref={root}
        className={`space-y-3 rounded-xl border-2 p-4 transition-colors duration-300 ${
          status === "ok"
            ? "anim-glow border-emerald-400 bg-emerald-50"
            : status === "bad"
              ? "anim-bad border-rose-300 bg-rose-50"
              : "border-slate-200 bg-slate-50"
        }`}
      >
        <p className="text-sm text-slate-700">
          Kelimelere tıklayarak doğru sıraya diz (Özne + Fiil + Nesne + Yer + Zaman):
        </p>
        <p key={n} className="anim-panel font-medium text-slate-900">
          🇹🇷 {ex.tr}
        </p>

        <div
          aria-label="Kurduğun cümle"
          className={`relative flex min-h-14 flex-wrap items-center gap-2 rounded-lg border-2 border-dashed bg-white p-2 transition-colors duration-300 ${
            status === "ok" ? "border-emerald-400" : "border-slate-300"
          }`}
        >
          {picked.length === 0 && (
            <span className="text-sm text-slate-400">Buraya dizilecek...</span>
          )}
          {picked.map((i, k) => {
            const wrong = status === "bad" && norm(words[i]) !== norm(words[k]);
            return (
              <button
                key={`${n}-${i}`}
                data-fly={`chip-${i}`}
                onClick={(e) => {
                  if (status !== "ok") launch(`bank-${i}`, e.currentTarget);
                  unpick(k);
                }}
                className={`relative z-10 rounded-lg px-3 py-1 text-sm font-medium text-white ${
                  status === "ok" ? "bg-emerald-600" : wrong ? "bg-rose-500" : "bg-blue-600"
                }`}
              >
                {/* Inner span shakes so the entry animation is not replayed. */}
                <span
                  style={{ ["--i" as string]: k }}
                  className={`inline-block ${
                    wrong ? "anim-shake" : status === "ok" ? "anim-wave" : ""
                  }`}
                >
                  {words[i]}
                </span>
              </button>
            );
          })}
          {status === "ok" && (
            <>
              <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
                <span className="fx-sweep" />
              </span>
              <span className="relative ml-auto" aria-hidden="true">
                <Sparks count={18} distance={60} />
                <svg viewBox="0 0 32 32" className="fx-check anim-pop h-10 w-10">
                  <circle cx={16} cy={16} r={15} fill="#10b981" />
                  <path
                    d="M8 17l6 6 11-13"
                    fill="none"
                    stroke="#fff"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </>
          )}
        </div>

        {/* Used words stay as faded placeholders so the bank does not jump. */}
        <div className="flex flex-wrap gap-2">
          {order.map((i) => {
            const used = picked.includes(i);
            return (
              <button
                key={`${n}-${i}`}
                data-fly={`bank-${i}`}
                disabled={used}
                aria-hidden={used}
                onClick={(e) => {
                  if (status === "ok") return;
                  launch(`chip-${i}`, e.currentTarget);
                  pick(i);
                }}
                style={{ ["--i" as string]: order.indexOf(i) }}
                className={`anim-item rounded-lg px-3 py-1 text-sm ring-1 duration-300 ${
                  used
                    ? "scale-90 bg-slate-100 text-transparent ring-slate-200"
                    : "bg-white text-slate-800 shadow-sm ring-slate-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
                }`}
              >
                {words[i]}
              </button>
            );
          })}
        </div>

        {status === "ok" && (
          <p className="anim-panel text-sm font-medium text-emerald-700">
            ✨ Harika! +XP · {ex.en}
            {ex.note ? <span className="block text-xs font-normal">↔ {ex.note}</span> : null}
          </p>
        )}
        {/* The hint unfolds via a 0fr to 1fr grid row. */}
        <div
          aria-live="polite"
          className={`grid transition-all duration-500 ${
            status === "bad" ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            {hint && (
              <p className="anim-open rounded-lg bg-amber-100 p-2 text-sm font-medium text-amber-900">
                💡 {hint}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={reset}
            className="rounded-lg bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
          >
            Sıfırla
          </button>
          <button
            onClick={nextSentence}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500"
          >
            {status === "ok" ? "Sonraki cümle →" : "Atla →"}
          </button>
        </div>
      </div>
    </section>
  );
}
