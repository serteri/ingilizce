"use client";

import { useEffect, useRef, useState } from "react";
import DialogueStage, { speakerOf, type Bubble } from "@/components/anim/DialogueStage";
import { DIALOGUES } from "@/data/dialogues";
import { TOPICS, type Snippet } from "@/data/grammar";
import { grammarActions, useGrammarState } from "@/lib/grammarStore";
import { speakLines, stopSpeech } from "@/lib/speech";

/** Breath between two turns. */
const PAUSE = 600;

type Line = Snippet["lines"][number];

/** Plays a conversation turn by turn; keeps going silently if audio fails. */
function usePlayer(lines: Line[]) {
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const run = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function halt() {
    run.current += 1;
    clearTimeout(timer.current);
  }

  useEffect(
    () => () => {
      if (run.current) {
        run.current += 1;
        clearTimeout(timer.current);
        stopSpeech();
      }
    },
    [],
  );

  function stop() {
    halt();
    stopSpeech();
    setPlaying(false);
  }

  function step(i: number, id: number) {
    if (id !== run.current) return;
    if (i >= lines.length) {
      setPlaying(false);
      return;
    }
    setIndex(i);
    const reading = 1200 + lines[i].text.length * 70;
    let moved = false;
    const advance = (after: number) => {
      if (moved || id !== run.current) return;
      moved = true;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => step(i + 1, id), after);
    };
    // Safety net for browsers that never report the end of speech.
    clearTimeout(timer.current);
    timer.current = setTimeout(() => advance(0), reading * 2 + 3000);
    const silent = () => {
      if (moved || id !== run.current) return;
      setMessage("Ses çalınamadı; sohbet sessiz oynatılıyor.");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => advance(0), reading);
    };
    speakLines([lines[i]], silent, {
      onLine: () => {},
      onDone: (reason) => {
        if (reason === "end") advance(PAUSE);
        else if (reason === "error") silent();
        // Something else took over the speaker: stop here.
        else if (!moved && id === run.current) {
          halt();
          setPlaying(false);
        }
      },
    });
  }

  function play() {
    stop();
    setMessage(null);
    setPlaying(true);
    step(0, run.current);
  }

  return { index, playing, message, play, stop };
}

function Player({ dialogue }: { dialogue: Snippet }) {
  const [showTr, setShowTr] = useState(true);
  const { index, playing, message, play, stop } = usePlayer(dialogue.lines);
  const spoken = dialogue.lines.slice(0, index + 1);
  const current = dialogue.lines[index];

  function bubble(who: "A" | "B"): Bubble | null {
    // Each character keeps showing the latest thing it said.
    const at = spoken.findLastIndex((l) => speakerOf(l.who) === who);
    if (at < 0) return null;
    const l = spoken[at];
    return {
      id: `${at}`,
      body: (
        <>
          <span className="block font-medium">{l.text}</span>
          {showTr && l.tr && <span className="mt-1 block text-xs text-slate-500">{l.tr}</span>}
        </>
      ),
    };
  }

  const small = "rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-50";
  const plain = `${small} bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-100`;

  return (
    <div className="space-y-3">
      <DialogueStage
        speaker={current ? speakerOf(current.who) : null}
        talk={playing ? "live" : "still"}
        a={bubble("A")}
        b={bubble("B")}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={play} className={`${small} bg-blue-600 text-white hover:bg-blue-500`}>
          {index < 0 ? "▶ Oynat" : "↻ Tekrar Oynat"}
        </button>
        <button onClick={stop} disabled={!playing} className={plain}>
          ⏹ Durdur
        </button>
        <button onClick={() => setShowTr((v) => !v)} className={plain}>
          {showTr ? "Türkçeyi gizle" : "Türkçe çeviri"}
        </button>
        <span className="text-xs text-slate-500">
          {index + 1} / {dialogue.lines.length}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${((index + 1) / dialogue.lines.length) * 100}%` }}
        />
      </div>
      {message && <p className="text-xs text-amber-700">{message}</p>}
      <p className="text-sm text-slate-600">💡 {dialogue.explanation}</p>
    </div>
  );
}

export default function DialoguePlayer({ topicId }: { topicId: string }) {
  const topic = TOPICS.find((t) => t.id === topicId) ?? TOPICS[0];
  const generated = useGrammarState().snippets[topic.id] ?? [];
  const list = [...(DIALOGUES[topic.id] ?? []), topic.snippet, ...generated];
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const at = Math.min(selected, list.length - 1);

  async function fresh() {
    if (busy) return;
    setBusy(true);
    setNote(null);
    try {
      const r = await fetch("/api/generate-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "snippet", topicId: topic.id }),
      });
      const d = await r.json();
      if (!d.snippet?.lines?.length) throw new Error("no snippet");
      grammarActions.addSnippet(topic.id, d.snippet as Snippet);
      // The store keeps only the newest few, so the new one is last.
      setSelected(Number.MAX_SAFE_INTEGER);
      setNote("Yeni diyalog yapay zekâ ile üretildi.");
    } catch {
      setSelected((at + 1) % list.length);
      setNote("Yapay zekâ şu an kullanılamıyor; sıradaki hazır diyalog açıldı.");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {list.map((d, i) => (
          <button
            key={`${i}-${d.title}`}
            onClick={() => setSelected(i)}
            aria-pressed={i === at}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              i === at
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {d.title}
          </button>
        ))}
        <button
          onClick={fresh}
          disabled={busy}
          className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 hover:bg-indigo-200 disabled:opacity-60"
        >
          {busy ? "Üretiliyor..." : "✨ Yeni Diyalog Üret"}
        </button>
      </div>
      {note && (
        <p role="status" className="text-xs text-indigo-700">
          {note}
        </p>
      )}
      {/* A new key stops the old playback and resets the scene. */}
      <Player key={`${at}-${list[at].title}`} dialogue={list[at]} />
    </div>
  );
}
