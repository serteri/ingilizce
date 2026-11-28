"use client";

import { useEffect, useState } from "react";
import { SoundWave, Sparks } from "@/components/anim/Effects";
import DialogueStage from "@/components/anim/DialogueStage";
import Reveal from "@/components/anim/Reveal";
import SentenceArena from "@/components/SentenceArena";
import TenseTimeline from "@/components/TenseTimeline";
import WordOrderBlocks from "@/components/WordOrderBlocks";
import {
  BATCH_SIZE,
  INITIAL_QUESTIONS,
  TOPICS,
  type GrammarTopic,
  type Question,
  type Snippet,
} from "@/data/grammar";
import { gameActions } from "@/lib/gameStore";
import { grammarActions, useGrammarState } from "@/lib/grammarStore";
import { useStagedValue } from "@/lib/motion";
import { speakLines, stopSpeech } from "@/lib/speech";

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

type Check = { ok: boolean; text: string; tries?: number };
type Item = { id: string; q: Question; repeat: boolean };

function QuestionList({ items }: { items: Item[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checks, setChecks] = useState<Record<string, Check>>({});

  function setCheck(id: string, c: Check) {
    // XP and combo are awarded only the first time a question is solved.
    if (c.ok && !checks[id]?.ok) gameActions.correct();
    if (!c.ok) gameActions.wrong();
    // tries alternates the shake class so every wrong attempt replays it.
    setChecks((cs) => ({
      ...cs,
      [id]: { ...c, tries: (cs[id]?.tries ?? 0) + 1 },
    }));
  }

  function check(id: string, q: Question) {
    const given = answers[id] ?? "";
    if (!given.trim()) return;
    setCheck(
      id,
      isCorrect(q, given)
        ? { ok: true, text: `Doğru! ✓${q.why ? ` ${q.why}` : ""}` }
        : {
            ok: false,
            text: `Tekrar dene. İpucu: “${q.answer.split(" ")[0]}…”`,
          },
    );
  }

  function reveal(id: string, q: Question) {
    setChecks((cs) => ({
      ...cs,
      [id]: { ok: true, text: `${q.answer}${q.why ? ` — ${q.why}` : ""}` },
    }));
  }

  function choose(id: string, q: Question, opt: string) {
    setAnswers((a) => ({ ...a, [id]: opt }));
    setCheck(
      id,
      opt === q.answer
        ? { ok: true, text: `Doğru! ✓ ${q.why ?? ""}` }
        : { ok: false, text: "Yanlış, başka bir seçenek dene." },
    );
  }

  return (
    <ol className="space-y-3">
      {items.map(({ id, q, repeat }, i) => {
        const c = checks[id];
        return (
          <li
            key={id}
            className="anim-item"
            style={{ ["--i" as string]: i % BATCH_SIZE }}
          >
          <div
            className={`relative rounded-xl border p-3 text-sm transition-colors duration-300 ${
              !c
                ? "border-slate-200 bg-slate-50"
                : c.ok
                  ? "anim-glow border-emerald-300 bg-emerald-50/60"
                  : `border-amber-300 bg-amber-50/60 ${
                      (c.tries ?? 0) % 2 ? "anim-shake" : "anim-shake-again"
                    }`
            }`}
          >
            {c?.ok && (
              <span className="absolute right-6 top-4">
                <Sparks />
              </span>
            )}
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
                {q.id?.startsWith("ai-") ? " · AI" : ""}
                {repeat ? " · tekrar" : ""}
              </span>
              {q.prompt}
            </p>
            {q.kind === "choice" ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {q.options?.map((o) => (
                  <button
                    key={o}
                    onClick={() => choose(id, q, o)}
                    className={`rounded-lg border px-3 py-1.5 text-left ${
                      answers[id] === o
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
            ) : (
              <div className="mt-2 flex gap-2">
                <input
                  value={answers[id] ?? ""}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [id]: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && !q.open && check(id, q)}
                  placeholder="Cevabın"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 outline-none focus:border-blue-500"
                />
                {q.open ? (
                  <button
                    onClick={() => reveal(id, q)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-slate-700 hover:bg-slate-200"
                  >
                    Örnek
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => check(id, q)}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-500"
                    >
                      Kontrol
                    </button>
                    <button
                      onClick={() => reveal(id, q)}
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
                onClick={() => reveal(id, q)}
                className="mt-2 text-xs text-slate-500 underline"
              >
                Cevabı göster
              </button>
            )}
            {c && (
              <p
                key={c.text}
                className={`anim-panel mt-2 ${c.ok ? "text-emerald-700" : "text-amber-700"}`}
              >
                {c.text}
              </p>
            )}
          </div>
          </li>
        );
      })}
    </ol>
  );
}

function Mistakes({ items }: { items: NonNullable<GrammarTopic["mistakes"]> }) {
  // Bumping a card's run number remounts it, which replays its scene.
  const [runs, setRuns] = useState<Record<string, number>>({});
  return (
    <Reveal>
      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Common Mistakes · Why is it wrong? / Yaygın Hatalar · Neden yanlış?
        </h3>
        <ul className="space-y-2">
          {items.map((m, i) => {
            const run = runs[m.wrong] ?? 0;
            // The first showing is staggered; replays start at once.
            const delay = { ["--i" as string]: run ? 0 : i };
            return (
              <li key={`${m.wrong}-${run}`}>
                <div
                  style={delay}
                  className={`${run ? "anim-open" : "rv-item"} rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-sm`}
                >
                  <p className="text-rose-700">
                    ✗{" "}
                    <span style={delay} className={run ? "line-through" : "rv-strike"}>
                      {m.wrong}
                    </span>
                  </p>
                  <p
                    style={delay}
                    className={`${run ? "anim-item" : "rv-fix"} font-medium text-emerald-700`}
                  >
                    ✓ {m.right}
                  </p>
                  <p
                    style={{ ["--i" as string]: run ? 3 : i }}
                    className={`${run ? "anim-item" : "rv-why"} mt-1 rounded-lg bg-white/80 p-2 text-slate-700`}
                  >
                    💡 {m.why}
                  </p>
                  <button
                    onClick={() => setRuns((r) => ({ ...r, [m.wrong]: run + 1 }))}
                    className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                  >
                    ↻ Neden yanlış? Tekrar göster
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </Reveal>
  );
}

function speakerOf(who?: string) {
  return who === "B" ? "B" : "A";
}

function SnippetBox({
  snippet,
  badge,
  onPractice,
}: {
  snippet: Snippet;
  badge: string;
  onPractice: () => void;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [showTr, setShowTr] = useState(false);
  const [active, setActive] = useState<number | null>(null);
  const hasTr = snippet.lines.some((l) => l.tr);

  // Stop reading when the card goes away (e.g. topic change).
  useEffect(() => stopSpeech, []);

  function read(from: number, only = false) {
    const lines = only ? [snippet.lines[from]] : snippet.lines;
    const offset = only ? from : 0;
    speakLines(lines, setMsg, {
      onLine: (i) => setActive(offset + i),
      onDone: () => setActive(null),
    });
  }

  return (
    <div className="anim-open space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-4">
      <p className="text-sm font-semibold text-indigo-800">
        💬 {snippet.title}
        <span className="ml-2 text-xs font-normal text-indigo-600">
          ({badge})
        </span>
      </p>
      <DialogueStage
        speaker={active === null ? null : speakerOf(snippet.lines[active]?.who)}
        talk="live"
        bubbleKey={String(active)}
      >
        {active === null || !snippet.lines[active] ? (
          <span className="text-slate-500">
            🔊 “Tümünü Dinle” ile konuşmayı canlandır.
          </span>
        ) : (
          <>
            <span className="font-medium">{snippet.lines[active].text}</span>
            {showTr && snippet.lines[active].tr && (
              <span className="mt-1 block text-xs text-slate-500">
                {snippet.lines[active].tr}
              </span>
            )}
          </>
        )}
      </DialogueStage>
      <ul className="space-y-1.5 text-sm">
        {snippet.lines.map((l, i) => (
          <li
            key={i}
            aria-current={active === i}
            style={{ ["--i" as string]: i + 2 }}
            className="anim-item"
          >
          <div
            className={`flex gap-2 rounded-lg border-l-4 px-2 transition-all duration-500 ${
              active === i
                ? "scale-[1.02] border-indigo-600 bg-white py-2.5 text-base shadow-lg ring-2 ring-indigo-300"
                : active === null
                  ? "border-transparent py-1"
                  : "scale-[0.98] border-transparent py-1 opacity-40"
            }`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full text-xs font-bold ${
                active === i
                  ? "anim-celebrate bg-indigo-600 text-white"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {l.who}
            </span>
            <span className="flex-1 text-slate-800">
              {l.text}
              {showTr && l.tr && (
                <span className="block text-xs text-slate-500">{l.tr}</span>
              )}
            </span>
            {active === i && <SoundWave className="self-center text-indigo-600" />}
            <button
              aria-label={`Satırı dinle: ${l.text}`}
              onClick={() => read(i, true)}
              className="shrink-0 rounded-md px-1.5 text-xs text-indigo-700 hover:bg-indigo-100"
            >
              🔊
            </button>
          </div>
          </li>
        ))}
      </ul>
      <p className="text-sm leading-relaxed text-slate-700">
        {snippet.explanation}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => read(0)}
          className="rounded-lg bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-indigo-200 hover:bg-indigo-100"
        >
          🔊 Tümünü Dinle
        </button>
        <button
          onClick={() => {
            stopSpeech();
            setMsg(null);
          }}
          className="rounded-lg bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-indigo-200 hover:bg-indigo-100"
        >
          ⏹ Durdur
        </button>
        {hasTr && (
          <button
            onClick={() => setShowTr((v) => !v)}
            className="rounded-lg bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-indigo-200 hover:bg-indigo-100"
          >
            {showTr ? "Türkçeyi gizle" : "Türkçe çeviri"}
          </button>
        )}
        <button
          onClick={() => {
            stopSpeech();
            onPractice();
          }}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
        >
          🎙 Bu Kesitle Sesli Pratik Yap
        </button>
      </div>
      {msg && <p className="text-xs text-amber-700">{msg}</p>}
    </div>
  );
}

async function generate(
  topic: GrammarTopic,
  kind: "questions" | "snippet",
): Promise<{ questions?: Question[]; snippet?: Snippet }> {
  try {
    const r = await fetch("/api/generate-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind,
        topicId: topic.id,
        title: topic.title,
        level: topic.level,
      }),
    });
    const d = await r.json();
    if (kind === "questions" && Array.isArray(d.questions) && d.questions.length) {
      const stamp = Date.now();
      return {
        questions: (d.questions as Question[]).map((q, i) => ({
          ...q,
          id: `ai-${stamp}-${i}`,
        })),
      };
    }
    if (kind === "snippet" && d.snippet?.lines?.length) {
      return { snippet: d.snippet as Snippet };
    }
    return {};
  } catch {
    return {};
  }
}

export default function GrammarSection({
  onPractice,
}: {
  onPractice?: (topicId: string) => void;
}) {
  const g = useGrammarState();
  const {
    target: selectedId,
    shown: shownId,
    leaving,
    set: setSelectedId,
  } = useStagedValue(TOPICS[0].id);
  const [readyShown, setReadyShown] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<"questions" | "snippet" | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const unlocked = (i: number) =>
    i === 0 || g.completed.includes(TOPICS[i - 1].id);
  const idx = Math.max(
    0,
    TOPICS.findIndex((t) => t.id === shownId),
  );
  const topic = TOPICS[idx];
  const done = g.completed.includes(topic.id);
  const next = TOPICS[idx + 1];

  const count =
    INITIAL_QUESTIONS + BATCH_SIZE * ((g.manual[topic.id] ?? 0) + g.days);
  const pool = topic.questions;
  const items: Item[] = [
    ...Array.from({ length: count }, (_, i) => ({
      id: `${topic.id}-b${i}`,
      q: pool[i % pool.length],
      repeat: i >= pool.length,
    })),
    ...(g.extras[topic.id] ?? []).map((q, i) => ({
      id: q.id ?? `${topic.id}-x${i}`,
      q,
      repeat: false,
    })),
  ];
  const aiSnippets = g.snippets[topic.id] ?? [];
  const showReady = readyShown[topic.id] === true;

  async function addQuestions() {
    if (busy) return;
    setBusy("questions");
    setNote(null);
    const r = await generate(topic, "questions");
    if (r.questions) {
      grammarActions.addExtras(topic.id, r.questions);
      setNote("3 taze soru yapay zekâ ile eklendi.");
    } else {
      grammarActions.addBatch(topic.id);
      setNote("Yapay zekâ içeriği alınamadı; yerel havuzdan 3 soru eklendi.");
    }
    setBusy(null);
  }

  async function explain() {
    if (busy) return;
    setBusy("snippet");
    setNote(null);
    setReadyShown((s) => ({ ...s, [topic.id]: true }));
    const r = await generate(topic, "snippet");
    if (r.snippet) {
      grammarActions.addSnippet(topic.id, r.snippet);
      setNote("Yeni kesit yapay zekâ ile üretildi.");
    } else {
      setNote("Yeni kesit üretilemedi; hazır kesit gösteriliyor.");
    }
    setBusy(null);
  }

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
                  onClick={() => {
                    setSelectedId(t.id);
                    setNote(null);
                  }}
                  style={{ ["--i" as string]: i }}
                  className={`anim-item flex w-full items-start gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${
                    t.id === selectedId
                      ? "translate-x-2 bg-blue-50 text-blue-700 shadow-sm"
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

      <article
        key={topic.id}
        className={`${card} ${leaving ? "anim-leave" : "anim-scene"} min-w-0 space-y-6 p-5`}
      >
        <header className="anim-item" style={{ ["--i" as string]: 1 }}>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {topic.level}
          </span>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">
            {topic.title}
          </h2>
          <p className="text-sm text-slate-600">{topic.summary}</p>
        </header>

        {topic.id === "sentence-structure" && (
          <Reveal>
            <WordOrderBlocks />
          </Reveal>
        )}

        <Reveal>
          <SentenceArena topicId={topic.id} />
        </Reveal>

        <Reveal>
          <TenseTimeline topicId={topic.id} />
        </Reveal>

        {topic.sections.map((s) => (
          <Reveal key={s.title}>
          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {s.title}
            </h3>
            <ul className="space-y-2 text-[15px] leading-relaxed text-slate-800">
              {s.points.map((p, i) => (
                <li
                  key={p}
                  className="rv-item flex gap-2"
                  style={{ ["--i" as string]: i }}
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </section>
          </Reveal>
        ))}

        {topic.mistakes && topic.mistakes.length > 0 && (
          <Mistakes key={topic.id} items={topic.mistakes} />
        )}

        <Reveal>
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Key Phrases / Anahtar İfadeler (EN ↔ TR)
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {topic.phrases.map((p, i) => (
              <li
                key={p.en}
                style={{ ["--i" as string]: i }}
                className="rv-item rounded-xl bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-900">{p.en}</span>
                <span className="block text-slate-500">{p.tr}</span>
              </li>
            ))}
          </ul>
        </section>
        </Reveal>

        <Reveal>
        <section>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Example Sentences / Örnek Cümleler
          </h3>
          <ul className="space-y-2">
            {topic.examples.map((e, i) => (
              <li
                key={e.en}
                style={{ ["--i" as string]: i }}
                className="rv-item rounded-xl border border-slate-200 bg-slate-50 p-3"
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
        </Reveal>

        <section className="space-y-3">
          <button
            onClick={explain}
            disabled={busy === "snippet"}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {busy === "snippet"
              ? "Kesit üretiliyor..."
              : showReady || aiSnippets.length
                ? "Başka bir kesit üret"
                : "Farklı Anlat (Doğal Konuşma Kesiti)"}
          </button>
          {busy === "snippet" && (
            <div
              className="anim-open space-y-2 rounded-xl border border-indigo-200 p-4"
              aria-hidden="true"
            >
              <div className="fx-shimmer h-4 w-1/3 rounded" />
              <div className="fx-shimmer h-4 w-5/6 rounded" />
              <div className="fx-shimmer h-4 w-2/3 rounded" />
            </div>
          )}
          {showReady && (
            <SnippetBox
              snippet={topic.snippet}
              badge="hazır kesit"
              onPractice={() => onPractice?.(topic.id)}
            />
          )}
          {aiSnippets.map((sn, i) => (
            <SnippetBox
              key={`${i}-${sn.title}`}
              snippet={sn}
              badge="yapay zekâ ile üretildi"
              onPractice={() => onPractice?.(topic.id)}
            />
          ))}
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Sorular ({items.length})
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
                onClick={addQuestions}
                disabled={busy === "questions"}
                className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {busy === "questions"
                  ? "Ekleniyor..."
                  : `Yeni Sorular Ekle (+${BATCH_SIZE})`}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Yeni sorular mevcut soruların altına eklenir, hiçbiri silinmez.
            {g.paused
              ? " Günlük otomatik ekleme duraklatıldı; yalnızca butonla eklenir."
              : ` Her yeni günde otomatik ${BATCH_SIZE} soru daha eklenir.`}{" "}
            Soru havuzu bitince sorular tekrar turu olarak yeniden gelir.
          </p>
          {note && <p className="text-xs text-indigo-700">{note}</p>}
          <QuestionList key={topic.id} items={items} />
        </section>

        <footer className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-4">
          {done ? (
            <>
              <span className="anim-celebrate relative rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                <Sparks count={16} distance={44} />
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
