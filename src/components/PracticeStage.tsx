"use client";

import { useState } from "react";
import DialoguePlayer from "@/components/DialoguePlayer";
import SentenceArena from "@/components/SentenceArena";

const MODES = [
  { id: "build", label: "🧩 Sen Kur (Etkileşimli)", hint: "Pratik yap: cevabı bloklardan kur." },
  { id: "watch", label: "▶ Sohbeti Oynat (Otomatik Animasyon)", hint: "İzle: A ve B karşılıklı konuşsun." },
] as const;

export default function PracticeStage({ topicId }: { topicId: string }) {
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("build");

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Sentence Scene / Konuşma Sahnesi
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            aria-pressed={mode === m.id}
            className={`rounded-xl border-2 p-3 text-left ${
              mode === m.id
                ? "border-blue-600 bg-blue-50 shadow-md"
                : "border-slate-200 bg-white hover:border-blue-300"
            }`}
          >
            <span className="block text-sm font-semibold text-slate-900">{m.label}</span>
            <span className="block text-xs text-slate-500">{m.hint}</span>
          </button>
        ))}
      </div>
      <div key={mode} className="anim-scene">
        {mode === "build" ? (
          <SentenceArena topicId={topicId} />
        ) : (
          <DialoguePlayer topicId={topicId} />
        )}
      </div>
    </section>
  );
}
