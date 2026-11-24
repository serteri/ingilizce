"use client";

import { useState } from "react";
import VoiceSession, { type VoiceStatus } from "@/components/VoiceSession";
import { LESSONS, type Stage } from "@/data/lessons";

const FREE = "free";

const STAGE_OPTIONS: { stage: Stage; label: string; hint: string }[] = [
  { stage: "examples", label: "Örnekler", hint: "Örnek cümlelerle çalış" },
  { stage: "vocab_practice", label: "Kelimeler", hint: "Yeni kelimeleri kullan" },
  { stage: "end_conversation", label: "Serbest konuşma", hint: "Konuyu konuşarak pekiştir" },
];

export default function VoiceSection({
  onStatus,
  onLeave,
}: {
  onStatus: (s: VoiceStatus) => void;
  onLeave: () => void;
}) {
  const [lessonId, setLessonId] = useState<string>(LESSONS[0].id);
  const [stage, setStage] = useState<Stage>("end_conversation");
  const [active, setActive] = useState<{ lessonId?: string; stage: Stage } | null>(
    null,
  );

  const free = lessonId === FREE;

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {active ? (
        <div className="flex flex-col items-center gap-3">
          <VoiceSession
            lessonId={active.lessonId}
            stage={active.stage}
            onStatus={onStatus}
            onLeave={() => {
              setActive(null);
              onLeave();
            }}
          />
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Sesli Konuşma
            </h2>
            <p className="text-sm text-slate-600">
              Öğretmenle konuş. Dersin bitmesini beklemen gerekmez; istediğin
              zaman başlayabilirsin.
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Konu
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                ...LESSONS.map((l) => ({ id: l.id, title: l.title })),
                { id: FREE, title: "Serbest sohbet" },
              ].map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLessonId(l.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${
                    lessonId === l.id
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {l.title}
                </button>
              ))}
            </div>
          </div>

          {!free && (
            <div className="grid gap-2 sm:grid-cols-3">
              {STAGE_OPTIONS.map((o) => (
                <button
                  key={o.stage}
                  onClick={() => setStage(o.stage)}
                  className={`rounded-xl border p-3 text-left transition ${
                    stage === o.stage
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-400"
                  }`}
                >
                  <div className="text-sm font-medium text-slate-900">
                    {o.label}
                  </div>
                  <div className="text-xs text-slate-500">{o.hint}</div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={() =>
              setActive({ lessonId: free ? undefined : lessonId, stage })
            }
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500"
          >
            Sesli Konuşmayı Başlat
          </button>
        </div>
      )}
    </div>
  );
}
