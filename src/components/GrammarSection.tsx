"use client";

import { useState } from "react";
import {
  BATCH_SIZE,
  INITIAL_QUESTIONS,
  TOPICS,
  type GrammarTopic,
  type Question,
  type Snippet,
} from "@/data/grammar";
import { grammarActions, useGrammarState } from "@/lib/grammarStore";

const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/^'/, "")
    .replace(/won't/g, "will not")
    .replace(/can't|cannot/g, "can not")
    .replace(/n't/g, " not")
    .replace(/'ll/g, " will")
    .replace(/'m/g, " am")
    .replace(/'re/g, " are")
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isCorrect(q: Question, given: string) {
  const g = normalize(given);
  if (!g) return false;
  return [q.answer, ...(q.alts ?? [])].some((a) => normalize(a) === g);
}

type Check = { ok: boolean; text: string };

function QuestionList({
  topic,
  count,
}: {
  topic: GrammarTopic;
  count: number;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checks, setChecks] = useState<Record<number, Check>>({});
  const pool = topic.questions;
  // Past the end of the pool, questions come back around as "tekrar" rounds.
  const shown = Array.from({ length: count }, (_, i) => pool[i % pool.length]);

  function check(i: number, q: Question) {
    if (!(answers[i] ?? "").trim()) return;
    setChecks((c) => ({
      ...c,
      [i]: isCorrect(q, answers[i])
        ? { ok: true, text: `Doğru! ✓${q.why ? ` ${q.why}` : ""}` }
        : {
            ok: false,
            text: `Tekrar dene. İpucu: “${q.answer.split(" ")[0]}…”`,
          },
    }));
  }

  function reveal(i: number, q: Question) {
    setChecks((cs) => ({
      ...cs,
      [i]: { ok: true, text: `${q.answer}${q.why ? ` — ${q.why}` : ""}` },
    }));
  }

  function choose(i: number, q: Question, opt: string) {
    setAnswers((a) => ({ ...a, [i]: opt }));
    setChecks((c) => ({
      ...c,
      [i]:
        opt === q.answer
          ? { ok: true, text: `Doğru! ✓ ${q.why ?? ""}` }
          : { ok: false, text: "Yanlış, başka bir seçenek dene." },
    }));
  }

  return (
    <ol className="space-y-3">
      {shown.map((q, i) => {
        const c = checks[i];
        return (
          <li
            key={i}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
          >
            <p className="text-slate-800">
              <span className="mr-2 font-semibold text-slate-500">{i + 1}.</span>
              <span className="mr-2 rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">
                {q.kind === "choice"
                  ? "Seçim"
                  : q.kind === "fix"
                    ? "Hata düzelt"
                    : q.open
                      ? "Yazma"
                      : "Boşluk"}
                {i >= pool.length ? " · tekrar" : ""}
              </span>
              {q.prompt}
            </p>
            {q.kind === "choice" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {q.options?.map((o) => (
                  <button
                    key={o}
                    onClick={() => choose(i, q, o)}
                    className={`rounded-lg border px-3 py-1.5 text-left ${
                      answers[i] === o
                        ? c?.ok
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-amber-400 bg-amber-50 text-amber-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-400"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
            {q.kind !== "choice" && (
            <div className="mt-2 flex gap-2">
              <input
                value={answers[i] ?? ""}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [i]: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && !q.open && check(i, q)}
                placeholder="Cevabın"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 outline-none focus:border-blue-500"
              />
              {q.open ? (
                <button
                  onClick={() => reveal(i, q)}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200"
                >
                  Örnek
                </button>
              ) : (
                <>
                  <button
                    onClick={() => check(i, q)}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-500"
                  >
                    Kontrol
                  </button>
                  <button
                    onClick={() => reveal(i, q)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200"
                  >
                    Cevap
                  </button>
                </>
              )}
            </div>
            )}
            {q.kind === "choice" && !c?.ok && (
              <button
                onClick={() => reveal(i, q)}
                className="mt-2 text-xs text-slate-500 underline"
              >
                Cevabı göster
              </button>
            )}
            {c && (
              <p
                className={`mt-2 ${c.ok ? "text-emerald-700" : "text-amber-700"}`}
              >
                {c.text}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

type Alt = {
  snippet: Snippet;
  loading: boolean;
  source: "ready" | "ai";
  note: string | null;
};

function SnippetBox({ alt }: { alt: Alt }) {
  return (
    <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
      <p className="text-sm font-semibold text-indigo-800">
        💬 {alt.snippet.title}
        <span className="ml-2 text-xs font-normal text-indigo-600">
          {alt.source === "ai" ? "(yapay zekâ ile üretildi)" : "(hazır kesit)"}
        </span>
      </p>
      <ul className="space-y-1.5 text-sm">
        {alt.snippet.lines.map((l, i) => (
          <li key={i} className="flex gap-2">
            <span className="w-5 shrink-0 font-semibold text-indigo-700">
              {l.who}:
            </span>
            <span className="text-slate-800">{l.text}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm leading-relaxed text-slate-700">
        {alt.snippet.explanation}
      </p>
      {alt.loading && (
        <p className="text-xs text-slate-500">Yeni kesit üretiliyor...</p>
      )}
      {alt.note && <p className="text-xs text-amber-700">{alt.note}</p>}
    </div>
  );
}

export default function GrammarSection() {
  const g = useGrammarState();
  const [selectedId, setSelectedId] = useState(TOPICS[0].id);
  const [alts, setAlts] = useState<Record<string, Alt>>({});

  const unlocked = (i: number) =>
    i === 0 || g.completed.includes(TOPICS[i - 1].id);
  const idx = Math.max(
    0,
    TOPICS.findIndex((t) => t.id === selectedId),
  );
  const topic = TOPICS[idx];
  const done = g.completed.includes(topic.id);
  const next = TOPICS[idx + 1];

  const count =
    INITIAL_QUESTIONS + BATCH_SIZE * ((g.manual[topic.id] ?? 0) + g.days);

  async function explain(t: GrammarTopic) {
    const existing = alts[t.id];
    if (existing?.loading) return;
    setAlts((a) => ({
      ...a,
      [t.id]: {
        snippet: existing?.snippet ?? t.snippet,
        source: existing?.source ?? "ready",
        loading: true,
        note: null,
      },
    }));
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "explain", topic: t.title, focus: t.focus }),
      });
      const d = await r.json();
      if (d?.dialogue?.length && d.explanation) {
        setAlts((a) => ({
          ...a,
          [t.id]: {
            snippet: {
              title: d.title || "Doğal konuşma kesiti",
              lines: d.dialogue,
              explanation: d.explanation,
            },
            source: "ai",
            loading: false,
            note: null,
          },
        }));
        return;
      }
      throw new Error(d?.warning ?? "no result");
    } catch (e) {
      const noKey = e instanceof Error && /GOOGLE_API_KEY/.test(e.message);
      setAlts((a) => ({
        ...a,
        [t.id]: {
          snippet: a[t.id]?.snippet ?? t.snippet,
          source: a[t.id]?.source ?? "ready",
          loading: false,
          note: noKey
            ? "Yapay zekâ anahtarı yok; hazır kesit gösteriliyor."
            : "Yeni kesit üretilemedi; mevcut kesit gösteriliyor.",
        },
      }));
    }
  }

  const alt = alts[topic.id];

  return (
    <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className={`${card} h-fit p-3`}>
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Konular · {g.completed.length}/{TOPICS.length} tamamlandı
        </p>
        <ol className="space-y-1">
          {TOPICS.map((t, i) => {
            const open = unlocked(i);
            const finished = g.completed.includes(t.id);
            return (
              <li key={t.id}>
                <button
                  disabled={!open}
                  onClick={() => setSelectedId(t.id)}
                  className={`flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                    t.id === topic.id
                      ? "bg-blue-50 text-blue-700"
                      : open
                        ? "text-slate-700 hover:bg-slate-100"
                        : "cursor-not-allowed text-slate-400"
                  }`}
                >
                  <span className="mt-0.5 w-4 shrink-0">
                    {finished ? "✓" : open ? "•" : "🔒"}
                  </span>
                  <span>
                    <span className="block font-medium">{t.title}</span>
                    <span className="block text-xs text-slate-500">
                      {t.level}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      <article className={`${card} space-y-6 p-5`}>
        <header>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {topic.level}
          </span>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            {topic.title}
          </h2>
          <p className="text-sm text-slate-600">{topic.summary}</p>
        </header>

        {topic.sections.map((s) => (
          <section key={s.title}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {s.title}
            </h3>
            <ul className="space-y-2 text-[15px] leading-relaxed text-slate-800">
              {s.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {topic.mistakes && topic.mistakes.length > 0 && (
          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Sık yapılan hatalar · Neden yanlış?
            </h3>
            <ul className="space-y-2">
              {topic.mistakes.map((m) => (
                <li
                  key={m.wrong}
                  className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-sm"
                >
                  <p className="text-rose-700 line-through">✗ {m.wrong}</p>
                  <p className="font-medium text-emerald-700">✓ {m.right}</p>
                  <p className="mt-1 text-slate-600">{m.why}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Anahtar ifadeler (EN ↔ TR)
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {topic.phrases.map((p) => (
              <li
                key={p.en}
                className="rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-900">{p.en}</span>
                <span className="block text-slate-500">{p.tr}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Örnek cümleler
          </h3>
          <ul className="space-y-2">
            {topic.examples.map((e) => (
              <li
                key={e.en}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="font-medium text-slate-900">{e.en}</p>
                <p className="text-sm text-slate-600">{e.tr}</p>
                {e.note && (
                  <p className="mt-1 text-xs text-indigo-700">↔ {e.note}</p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <button
            onClick={() => explain(topic)}
            disabled={alt?.loading}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {alt ? "Başka bir kesit üret" : "Farklı Anlat (Doğal Konuşma Kesiti)"}
          </button>
          {alt && <SnippetBox alt={alt} />}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Sorular ({count})
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => grammarActions.setPaused(!g.paused)}
                aria-pressed={!g.paused}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  g.paused
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {g.paused ? "⏸ Duraklatıldı (Paused)" : "▶ Günlük Sorular Aktif"}
              </button>
              <button
                onClick={() => grammarActions.addBatch(topic.id)}
                className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500"
              >
                Yeni Sorular Ekle (+{BATCH_SIZE})
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Yeni sorular mevcut soruların altına eklenir, hiçbiri silinmez.
            {g.paused
              ? " Günlük otomatik ekleme duraklatıldı; yalnızca butonla eklenir."
              : ` Her yeni günde otomatik ${BATCH_SIZE} soru daha eklenir.`}
            {" "}Soru havuzu bitince sorular tekrar turu olarak yeniden gelir.
          </p>
          <QuestionList key={topic.id} topic={topic} count={count} />
        </section>

        <footer className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
          {done ? (
            <>
              <span className="text-sm font-medium text-emerald-700">
                ✓ Konu tamamlandı
              </span>
              {next && (
                <button
                  onClick={() => setSelectedId(next.id)}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                  Sonraki konuya geç →
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => grammarActions.complete(topic.id)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              {idx === 0
                ? "Anladım, Gramer Konularına Geç"
                : next
                  ? "Konuyu Tamamla ve Sonrakini Aç"
                  : "Konuyu Tamamla"}
            </button>
          )}
        </footer>
      </article>
    </div>
  );
}
