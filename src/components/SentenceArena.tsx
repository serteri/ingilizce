"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import DialogueStage from "@/components/anim/DialogueStage";
import { Sparks } from "@/components/anim/Effects";
import {
  coreSentences,
  englishOf,
  localVariants,
  ROLE_INFO,
  ROLES,
  RULES,
  sentenceKey,
  type Role,
  type Sentence,
} from "@/data/sentences";
import { gameActions } from "@/lib/gameStore";
import { reducedMotion } from "@/lib/motion";
import { sentenceActions, useSentencePool } from "@/lib/sentenceStore";
import { speakLines, stopSpeech } from "@/lib/speech";

const SET_SIZE = 5;
/** A background set is requested after this many finished sentences. */
const REFILL_EVERY = 3;

const small = "rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-60";

/** Same order on server and client, never already solved. */
function shuffled(roles: Role[], seed: string) {
  let x = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 233280, 7);
  const out = [...roles];
  for (let i = out.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = x % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.every((r, i) => r === roles[i])) out.reverse();
  return out;
}

type Result = "self" | "hinted" | "shown";

function Round({
  topicId,
  sentence,
  onTouch,
  onDone,
  onNext,
}: {
  topicId: string;
  sentence: Sentence;
  onTouch: () => void;
  onDone: () => void;
  onNext: () => void;
}) {
  const roles = ROLES.filter((r) => sentence[r]);
  const bank = shuffled(roles, englishOf(sentence));
  /** slots[i] holds the block placed in the position of roles[i]. */
  const [slots, setSlots] = useState<(Role | null)[]>(() => roles.map(() => null));
  const [hinted, setHinted] = useState<Role[]>([]);
  const [misses, setMisses] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const root = useRef<HTMLDivElement>(null);
  // The board is only judged after "Kontrol Et".
  const [checked, setChecked] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const reading = useRef(false);
  // Screen positions of blocks about to move, so they can fly to the slots.
  const flights = useRef(new Map<Role, DOMRect>());

  const full = slots.every(Boolean);
  const wrong = checked && !result && slots.some((r, i) => r !== roles[i]);
  const rule = RULES[topicId] ?? RULES["sentence-structure"];

  useLayoutEffect(() => {
    const moving = [...flights.current];
    flights.current.clear();
    if (reducedMotion()) return;
    moving.forEach(([role, from], k) => {
      const el = root.current?.querySelector<HTMLElement>(`[data-block="${role}"]`);
      if (!el) return;
      const now = el.getBoundingClientRect();
      const dx = from.x - now.x;
      const dy = from.y - now.y;
      if (!dx && !dy) return;
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 30}px) scale(1.18)`, offset: 0.55 },
          { transform: "none" },
        ],
        {
          duration: 600,
          delay: k * 130,
          easing: "cubic-bezier(0.34, 1.2, 0.64, 1)",
          fill: "backwards",
        },
      );
    });
  }, [slots]);

  // Stop reading this sentence when its board leaves.
  useEffect(
    () => () => {
      if (reading.current) stopSpeech();
    },
    [],
  );

  function act() {
    reading.current = true;
    speakLines([{ who: "B", text: englishOf(sentence) }], setVoiceError, {
      onLine: () => setSpeaking(true),
      onDone: () => {
        reading.current = false;
        setSpeaking(false);
      },
    });
  }

  function remember(role: Role) {
    const el = root.current?.querySelector<HTMLElement>(`[data-block="${role}"]`);
    if (el) flights.current.set(role, el.getBoundingClientRect());
  }

  function finish(how: Result) {
    setResult(how);
    if (how === "self") gameActions.correct();
    else gameActions.assisted();
    onDone();
  }

  /** Any change to the board withdraws the last verdict. */
  function update(next: (Role | null)[]) {
    setSlots(next);
    setChecked(false);
  }

  function check() {
    if (result || checked || !full) return;
    onTouch();
    setChecked(true);
    if (slots.every((r, i) => r === roles[i])) {
      finish(hinted.length > 0 ? "hinted" : "self");
    } else {
      setMisses((m) => m + 1);
      gameActions.wrong();
    }
  }

  function place(role: Role) {
    const at = slots.indexOf(null);
    if (result || at < 0 || slots.includes(role)) return;
    onTouch();
    remember(role);
    update(slots.map((r, i) => (i === at ? role : r)));
  }

  function remove(i: number) {
    const role = slots[i];
    if (result || !role || hinted.includes(role)) return;
    remember(role);
    update(slots.map((r, k) => (k === i ? null : r)));
  }

  /** Correct blocks stay; wrong ones go back to the bank. */
  function kept() {
    return slots.map((r, i) => (r === roles[i] ? r : null));
  }

  function retry() {
    slots.forEach((r, i) => r && r !== roles[i] && remember(r));
    update(kept());
  }

  function hint() {
    const base = kept();
    const at = base.findIndex((r) => r === null);
    if (result || at < 0) return;
    onTouch();
    const role = roles[at];
    slots.forEach((r, i) => r && r !== roles[i] && remember(r));
    remember(role);
    setHinted((h) => [...h, role]);
    update(base.map((r, i) => (i === at ? role : r)));
  }

  function show() {
    roles.forEach((r, i) => slots[i] !== r && remember(r));
    setSlots(roles);
    finish("shown");
  }

  const solved = result !== null;
  const attempt = slots.map((r) => (r ? sentence[r] : "…")).join(" ");
  const started = slots.some(Boolean);
  // A asks, B (the learner) answers; A steps back in after a wrong check.
  const speaker = solved ? "B" : wrong || !started ? "A" : "B";

  return (
    <div
      ref={root}
      className={`relative space-y-4 rounded-xl border-2 p-4 transition-colors duration-500 ${
        result === "self"
          ? "anim-glow border-emerald-400 bg-emerald-50"
          : solved
            ? "border-indigo-300 bg-indigo-50"
            : wrong
              ? "border-rose-300 bg-rose-50"
              : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="anim-item" style={{ ["--i" as string]: 1 }}>
        <p data-target className="text-base font-semibold text-slate-900">
          🇹🇷 {sentence.tr}
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Hedef kalıp:{" "}
          <b>{roles.map((r) => ROLE_INFO[r].tag).join(" + ")}</b> · Blokları sırayla
          tıklayarak cümleyi kur.
        </p>
      </div>

      <DialogueStage
        speaker={speaker}
        talk={speaking ? "live" : solved || !started || wrong ? "burst" : "still"}
        bubbleKey={`${speaker}-${solved}-${wrong}-${started}`}
      >
        {solved ? (
          <span className="text-base font-semibold">“{englishOf(sentence)}”</span>
        ) : wrong ? (
          "Hmm, olmadı. Bir daha bakalım!"
        ) : started ? (
          <span className="font-medium">{attempt}</span>
        ) : (
          "Bunu İngilizce nasıl söylersin?"
        )}
      </DialogueStage>

      {/* Slots */}
      <ol
        key={`slots-${misses}`}
        className={`flex flex-wrap gap-2 ${wrong ? "anim-bad rounded-xl" : ""}`}
      >
        {roles.map((expected, i) => {
          const role = slots[i];
          const bad = wrong && role !== expected;
          return (
            <li
              key={expected}
              className="flex min-h-16 min-w-24 flex-col items-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-white p-1.5"
            >
              <span className="text-[10px] font-semibold uppercase text-slate-500">
                {ROLE_INFO[expected].tag} · {ROLE_INFO[expected].label}
              </span>
              {role && (
                <button
                  data-block={role}
                  onClick={() => remove(i)}
                  aria-label={`${sentence[role]}${bad ? " (yanlış yerde)" : ""}`}
                  className={`relative z-10 rounded-lg border-2 px-3 py-1.5 text-sm font-bold ${
                    bad ? "border-rose-600 bg-rose-500 text-white" : ROLE_INFO[role].cls
                  } ${hinted.includes(role) ? "ring-2 ring-amber-400" : ""}`}
                >
                  <span
                    style={{ ["--i" as string]: i }}
                    className={`inline-block ${
                      bad ? "anim-shake" : result === "self" ? "anim-wave" : ""
                    }`}
                  >
                    {bad ? "✗ " : ""}
                    {sentence[role]}
                  </span>
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {/* Bank */}
      {!solved && (
        <div className="flex min-h-10 flex-wrap gap-2">
          {bank
            .filter((r) => !slots.includes(r))
            .map((r) => (
              <button
                key={r}
                data-block={r}
                onClick={() => place(r)}
                disabled={full}
                className={`relative z-10 rounded-lg border-2 px-3 py-1.5 text-sm font-bold shadow-sm hover:-translate-y-0.5 hover:shadow-md ${ROLE_INFO[r].cls}`}
              >
                <span className="mr-1.5 rounded bg-white/80 px-1 text-[10px]">
                  {ROLE_INFO[r].tag}
                </span>
                {sentence[r]}
              </button>
            ))}
        </div>
      )}

      <div aria-live="polite">
        {wrong && (
          <p className="anim-open rounded-lg bg-amber-100 p-2 text-sm font-medium text-amber-900">
            <span className="block">Hatalı parça:</span>
            {slots.map((r, i) =>
              r && r !== roles[i] ? (
                <span key={r} className="block font-normal">
                  ✗ “{sentence[r]}” ({ROLE_INFO[r].label}) {i + 1}. sırada olmaz; bu yuva{" "}
                  <b>{ROLE_INFO[roles[i]].label}</b> için.
                </span>
              ) : null,
            )}
          </p>
        )}
        {solved && (
          <div className="anim-open space-y-2 rounded-lg bg-white p-3 text-sm">
            <p
              className={`font-semibold ${
                result === "self" ? "text-emerald-700" : "text-indigo-700"
              }`}
            >
              {result === "self"
                ? "✨ Harika, kendin kurdun! Tam XP + Combo"
                : result === "hinted"
                  ? "👍 İpucuyla tamamladın · +5 katılım XP"
                  : "👀 Doğru dizilim bu · +5 katılım XP"}
            </p>
            <p className="text-base font-medium text-slate-900">{englishOf(sentence)}</p>
            <p className="text-slate-700">🇬🇧 {rule.en}</p>
            <p className="text-slate-700">🇹🇷 {rule.tr}</p>
            <button onClick={act} className={`${small} bg-violet-100 text-violet-900 hover:bg-violet-200`}>
              🎭 Cümleyi Canlandır
            </button>
            {voiceError && <p className="text-xs text-amber-700">{voiceError}</p>}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {solved ? (
          <button onClick={onNext} className={`${small} bg-blue-600 text-white hover:bg-blue-500`}>
            Sonraki cümle →
          </button>
        ) : (
          <>
            <button
              onClick={check}
              disabled={!full || checked}
              className={`${small} bg-emerald-600 text-white hover:bg-emerald-500 disabled:cursor-not-allowed`}
            >
              ✔ Kontrol Et
            </button>
            {wrong && (
              <button onClick={retry} className={`${small} bg-blue-600 text-white hover:bg-blue-500`}>
                🔁 Tekrar Dene
              </button>
            )}
            <button onClick={hint} className={`${small} bg-amber-100 text-amber-900 hover:bg-amber-200`}>
              💡 İpucu (sıradaki blok)
            </button>
            {(misses > 0 || hinted.length > 0) && (
              <button
                onClick={show}
                className={`${small} bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100`}
              >
                🙋 Doğruyu Göster
              </button>
            )}
          </>
        )}
      </div>

      {result === "self" && (
        <>
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <span className="fx-sweep" />
          </span>
          <span className="pointer-events-none absolute right-10 top-8">
            <Sparks count={18} distance={60} />
          </span>
        </>
      )}
    </div>
  );
}

export default function SentenceArena({ topicId }: { topicId: string }) {
  const pool = useSentencePool();
  const done = pool.done[topicId] ?? [];
  const extra = pool.extra[topicId] ?? [];
  // Generated sentences first, then the core set, then offline variants.
  const all = [...extra, ...coreSentences(topicId), ...localVariants(topicId)];
  const byKey = new Map(all.map((x) => [sentenceKey(x), x]));
  const keys = [...byKey.keys()];
  const solved = new Set(done);
  const unsolved = keys.filter((k) => !solved.has(k));

  // The sentence being worked on stays put while the pool changes around it.
  const [pinned, setPinned] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const inFlight = useRef(false);
  const finished = useRef(0);

  // When everything has been solved, the oldest one comes back first.
  const fallback = unsolved[0] ?? done.find((k) => byKey.has(k)) ?? keys[0];
  const key = pinned && byKey.has(pinned) ? pinned : fallback;
  const sentence = byKey.get(key)!;

  /** Lets the current board leave the stage, then deals the next one. */
  function go(next: string) {
    setLeaving(true);
    setTimeout(
      () => {
        setPinned(next);
        setRound((r) => r + 1);
        setLeaving(false);
      },
      reducedMotion() ? 0 : 220,
    );
  }

  function next() {
    const candidate =
      unsolved.find((k) => k !== key) ??
      done.find((k) => k !== key && byKey.has(k)) ??
      key;
    go(candidate);
  }

  /** Adds a new set. A background refill stays silent and never moves the user. */
  async function newSet(background: boolean) {
    if (inFlight.current) return;
    inFlight.current = true;
    if (!background) {
      setBusy(true);
      setNote(null);
    }
    let items: Sentence[] = [];
    try {
      const r = await fetch("/api/generate-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "svompt_sentences",
          topicId,
          avoid: keys.filter((k) => solved.has(k) || extra.some((x) => sentenceKey(x) === k)).slice(-60),
        }),
      });
      const d = await r.json();
      if (Array.isArray(d.sentences)) {
        items = (d.sentences as Sentence[]).filter((x) => !byKey.has(sentenceKey(x)));
      }
    } catch {
      /* fall back to the local generator */
    }
    const fromAi = items.length > 0;
    if (!fromAi && !background) {
      const stored = new Set(extra.map(sentenceKey));
      items = localVariants(topicId)
        .filter((x) => {
          const k = sentenceKey(x);
          return k !== key && !solved.has(k) && !stored.has(k);
        })
        .slice(0, SET_SIZE);
    }
    if (items.length) sentenceActions.add(topicId, items);
    if (!background) {
      if (items.length) go(sentenceKey(items[0]));
      setNote(
        fromAi
          ? `${items.length} yeni cümle yapay zekâ ile üretildi.`
          : items.length
            ? `Yapay zekâ şu an kullanılamıyor; yerel üreticiden ${items.length} cümle eklendi.`
            : "Yapay zekâ şu an kullanılamıyor ve yerel yeni cümleler tükendi; çözdüklerin tekrar gelecek.",
      );
      setBusy(false);
    }
    inFlight.current = false;
  }

  function handleDone() {
    sentenceActions.markDone(topicId, key);
    finished.current += 1;
    if (finished.current % REFILL_EVERY === 0) void newSet(true);
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Sentence Scene / Cümle Dizilim Sahnesi
        </h3>
        <button
          onClick={() => void newSet(false)}
          disabled={busy}
          className={`${small} bg-indigo-600 text-white hover:bg-indigo-500`}
        >
          {busy ? "Üretiliyor..." : "✨ Yeni Cümle Seti Üret"}
        </button>
      </div>
      <p className="text-xs text-slate-500">
        Önce sen kur · çözülen: {done.length} · sırada bekleyen: {unsolved.length}
        {solved.has(key) && !unsolved.length ? " · tekrar turu" : ""}
      </p>
      {note && (
        <p role="status" className="anim-item text-xs text-indigo-700">
          {note}
        </p>
      )}
      <div className={leaving ? "anim-leave" : "anim-scene"}>
        {/* A new key deals a fresh board. */}
        <Round
          key={`${round}-${key}`}
          topicId={topicId}
          sentence={sentence}
          onTouch={() => setPinned(key)}
          onDone={handleDone}
          onNext={next}
        />
      </div>
    </section>
  );
}
