"use client";

import { useCallback, useState } from "react";
import GrammarSection from "@/components/GrammarSection";
import VocabSection from "@/components/VocabSection";
import VoiceSection from "@/components/VoiceSection";
import type { VoiceStatus } from "@/components/VoiceSession";
import { TOPICS } from "@/data/grammar";
import { LESSONS } from "@/data/lessons";
import { useGameState } from "@/lib/gameStore";
import { useGrammarState } from "@/lib/grammarStore";
import { useVocabState } from "@/lib/vocabStore";

type Section = "grammar" | "vocab" | "voice";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "grammar", label: "Gramer" },
  { id: "vocab", label: "Kelimeler" },
  { id: "voice", label: "Sesli Konuşma" },
];

function StatusChip({ status }: { status: VoiceStatus | null }) {
  let label = "Hazır";
  let tone = "bg-slate-100 text-slate-600";
  if (status) {
    if (/hata/i.test(status.conn)) {
      label = status.conn;
      tone = "bg-red-50 text-red-700";
    } else if (status.agent) {
      label = "Öğretmen bağlı";
      tone = "bg-emerald-50 text-emerald-700";
    } else if (status.conn === "Bağlandı") {
      label = "Bağlandı · öğretmen bekleniyor";
      tone = "bg-amber-50 text-amber-700";
    } else {
      label = "Bağlanıyor...";
      tone = "bg-amber-50 text-amber-700";
    }
  }
  return (
    <span
      className={`inline-flex max-w-[60vw] items-center gap-2 truncate rounded-full px-3 py-1 text-xs ${tone}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      <span className="truncate">{label}</span>
    </span>
  );
}

export default function Home() {
  const [section, setSection] = useState<Section>("grammar");
  const [status, setStatus] = useState<VoiceStatus | null>(null);
  const vocab = useVocabState();
  const grammar = useGrammarState();

  const handleStatus = useCallback((s: VoiceStatus) => setStatus(s), []);
  const handleLeave = useCallback(() => setStatus(null), []);
  const [preset, setPreset] = useState<{ lessonId: string; nonce: number } | null>(
    null,
  );
  const game = useGameState();

  // Grammar topics that match a voice lesson use it; others fall back to free chat.
  const handlePractice = useCallback((topicId: string) => {
    setPreset({
      lessonId: LESSONS.some((l) => l.id === topicId) ? topicId : "free",
      nonce: Date.now(),
    });
    setSection("voice");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Speak<span className="text-blue-600">Up</span> English
            </h1>
            <p className="text-xs text-slate-500">
              {SECTIONS.find((s) => s.id === section)?.label}
              {" · "}
              Gramer {grammar.ready ? grammar.completed.length : 0}/
              {TOPICS.length}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              key={`xp-${game.xp}`}
              title="Toplam XP ve seviye"
              className={`rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ${game.xp > 0 ? "anim-bounce" : ""}`}
            >
              ⭐ {game.ready ? game.xp : 0} XP · Sv. {game.ready ? game.level : 1}
            </span>
            <span
              key={`streak-${game.streak}`}
              title="Üst üste aktif gün"
              className={`rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 ${game.streak > 0 ? "anim-bounce" : ""}`}
            >
              🔥 {game.ready ? game.streak : 0} gün
            </span>
            <span
              key={`combo-${game.combo}`}
              title="Üst üste doğru cevap"
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                game.combo > 0 ? "anim-bounce" : ""
              } ${
                game.ready && game.combo >= 3
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              ⚡ Combo ×{game.ready ? game.combo : 0}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              ✓ {vocab.ready ? vocab.learned.length : 0} kelime öğrenildi
            </span>
            <StatusChip status={status} />
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 pb-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`rounded-lg px-4 py-1.5 text-sm transition ${
                section === s.id
                  ? "bg-blue-600 font-medium text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className={section === "grammar" ? "anim-panel block" : "hidden"}>
          <GrammarSection onPractice={handlePractice} />
        </div>
        <div className={section === "vocab" ? "anim-panel block" : "hidden"}>
          <VocabSection />
        </div>
        {/* Kept mounted so a running voice session survives tab switches. */}
        <div className={section === "voice" ? "anim-panel block" : "hidden"}>
          <VoiceSection
            onStatus={handleStatus}
            onLeave={handleLeave}
            preset={preset}
          />
        </div>
      </main>
    </div>
  );
}
