"use client";

import { useState } from "react";
import type { Example } from "@/data/grammar";
import { gameActions } from "@/lib/gameStore";

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
        className={`space-y-3 rounded-xl border p-4 transition-colors duration-300 ${
          status === "ok"
            ? "anim-glow border-emerald-400 bg-emerald-50"
            : status === "bad"
              ? "anim-shake border-amber-300 bg-amber-50"
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
          className={`flex min-h-12 flex-wrap items-center gap-2 rounded-lg border-2 border-dashed bg-white p-2 transition-colors duration-300 ${
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
                onClick={() => unpick(k)}
                className={`anim-pop rounded-lg px-3 py-1 text-sm font-medium text-white ${
                  status === "ok" ? "bg-emerald-600" : wrong ? "bg-rose-500" : "bg-blue-600"
                }`}
              >
                {/* Inner span shakes so the entry animation is not replayed. */}
                <span className={`inline-block ${wrong ? "anim-shake" : ""}`}>
                  {words[i]}
                </span>
              </button>
            );
          })}
          {status === "ok" && (
            <span className="anim-pop ml-auto text-2xl" aria-hidden="true">
              ✅
            </span>
          )}
        </div>

        {/* Used words stay as faded placeholders so the bank does not jump. */}
        <div className="flex flex-wrap gap-2">
          {order.map((i) => {
            const used = picked.includes(i);
            return (
              <button
                key={`${n}-${i}`}
                disabled={used}
                aria-hidden={used}
                onClick={() => pick(i)}
                className={`rounded-lg px-3 py-1 text-sm ring-1 duration-300 ${
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
              <p className="rounded-lg bg-amber-100 p-2 text-sm text-amber-900">
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
