"use client";

import { useState } from "react";

const AXIS_Y = 100;
const NOW_X = 320;

/** `span` is the active time range the marker travels across. */
type Scene = { caption: string; span: [number, number]; body: React.ReactNode };

const lbl = "fill-slate-500 text-[11px]";

function Dot({ x, color = "#2563eb", delay = 0, r = 6 }: { x: number; color?: string; delay?: number; r?: number }) {
  return (
    <circle
      className="tl-pop"
      style={{ animationDelay: `${delay}s` }}
      cx={x}
      cy={AXIS_Y}
      r={r}
      fill={color}
    />
  );
}

function scene(id: string): Scene | null {
  switch (id) {
    case "be-have-do":
      return {
        caption:
          "be / have / do zamana göre şekil değiştirir: geçmişte was-were, had, did; şimdi am-is-are, have, do; gelecekte will + yalın fiil.",
        span: [80, 570],
        body: (
          <>
            {(
              [
                [110, "was/were · had · did", "#7c3aed"],
                [NOW_X, "am/is/are · have · do", "#2563eb"],
                [530, "will be · will have", "#059669"],
              ] as const
            ).map(([x, label, color], i) => (
              <g key={x}>
                <Dot x={x} color={color} delay={i * 0.5} r={8} />
                <text x={x} y={62} textAnchor="middle" className={lbl}>
                  {label}
                </text>
              </g>
            ))}
          </>
        ),
      };
    case "present-simple":
      return {
        caption: "Tekrar eden alışkanlıklar: geçmişten geleceğe uzanan düzenli noktalar (her gün, genellikle).",
        span: [80, 570],
        body: (
          <>
            {[80, 150, 220, 290, 360, 430, 500, 570].map((x, i) => (
              <Dot key={x} x={x} delay={i * 0.15} />
            ))}
            <text x={320} y={70} textAnchor="middle" className={lbl}>
              I drink tea every morning.
            </text>
          </>
        ),
      };
    case "present-continuous":
      return {
        caption: "Tam şu an süren (ya da bu sıralar geçici olan) eylem: Now noktasında dalga gibi atar.",
        span: [280, 360],
        body: (
          <>
            <circle className="tl-ring" cx={NOW_X} cy={AXIS_Y} r={8} fill="none" stroke="#2563eb" strokeWidth={3} />
            <Dot x={NOW_X} r={8} />
            <text x={NOW_X} y={62} textAnchor="middle" className={lbl}>
              I am reading now.
            </text>
          </>
        ),
      };
    case "past-simple":
      return {
        caption: "Geçmişte belli bir anda olup BİTMİŞ olay: Now'dan kopuk tek nokta.",
        span: [80, 150],
        body: (
          <>
            <Dot x={150} color="#7c3aed" />
            <text x={150} y={72} textAnchor="middle" className={lbl}>
              I visited Izmir.
            </text>
            <text x={150} y={134} textAnchor="middle" className={lbl}>
              last year (bitti)
            </text>
          </>
        ),
      };
    case "past-continuous":
      return {
        caption: "Geçmişte SÜREN arka plan eylemi (çubuk) ve araya giren kısa olay (yıldız).",
        span: [100, 300],
        body: (
          <>
            <line
              className="tl-draw"
              style={{ ["--len" as string]: 200 }}
              x1={100}
              y1={AXIS_Y}
              x2={300}
              y2={AXIS_Y}
              stroke="#7c3aed"
              strokeWidth={10}
              strokeLinecap="round"
              opacity={0.55}
            />
            <Dot x={220} color="#e11d48" delay={1.2} r={8} />
            <text x={200} y={72} textAnchor="middle" className={lbl}>
              I was cooking...
            </text>
            <text x={220} y={132} textAnchor="middle" className={lbl}>
              ...when the phone rang.
            </text>
          </>
        ),
      };
    case "future-going-to-will":
      return {
        caption: "Gelecek: going to = önceden planlanan; will = anlık karar/tahmin; Present Continuous = ayarlanmış randevu.",
        span: [NOW_X, 580],
        body: (
          <>
            <Dot x={440} color="#059669" />
            <Dot x={520} color="#d97706" delay={0.3} />
            <Dot x={580} color="#2563eb" delay={0.6} />
            <text x={440} y={72} textAnchor="middle" className={lbl}>
              going to
            </text>
            <text x={520} y={132} textAnchor="middle" className={lbl}>
              will
            </text>
            <text x={580} y={72} textAnchor="middle" className={lbl}>
              V-ing (randevu)
            </text>
          </>
        ),
      };
    case "present-perfect":
      return {
        caption: "Geçmişten bugüne köprü: olay geçmişte oldu ama sonucu/bağlantısı şu an hâlâ var.",
        span: [150, NOW_X],
        body: (
          <>
            <Dot x={150} color="#7c3aed" />
            <path
              className="tl-draw"
              style={{ ["--len" as string]: 320 }}
              d={`M150 ${AXIS_Y} Q235 20 ${NOW_X} ${AXIS_Y}`}
              fill="none"
              stroke="#2563eb"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <Dot x={NOW_X} delay={1.4} r={8} />
            <text x={235} y={44} textAnchor="middle" className={lbl}>
              I have lost my keys.
            </text>
          </>
        ),
      };
    case "perfect-continuous-modals-if":
      return {
        caption: "Present Perfect Continuous: geçmişte başlayıp Now'a kadar kesintisiz süren eylem (for / since).",
        span: [120, NOW_X],
        body: (
          <>
            <line
              className="tl-draw"
              style={{ ["--len" as string]: 200 }}
              x1={120}
              y1={AXIS_Y}
              x2={NOW_X}
              y2={AXIS_Y}
              stroke="#2563eb"
              strokeWidth={10}
              strokeLinecap="round"
              opacity={0.6}
            />
            <Dot x={NOW_X} delay={1.4} r={8} />
            <text x={220} y={72} textAnchor="middle" className={lbl}>
              I have been waiting for an hour.
            </text>
          </>
        ),
      };
    default:
      return null;
  }
}

export default function TenseTimeline({ topicId }: { topicId: string }) {
  const sc = scene(topicId);
  const [run, setRun] = useState(0);
  const [paused, setPaused] = useState(false);
  if (!sc) return null;
  const [from, to] = sc.span;
  const small =
    "rounded-lg bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100";
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Timeline · Past — Now — Future / Zaman Çizelgesi
      </h3>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <svg
          key={`${topicId}-${run}`}
          viewBox="0 0 640 160"
          role="img"
          aria-label="Past, Now, Future zaman çizelgesi"
          className={`h-auto w-full ${paused ? "tl-paused" : ""}`}
        >
          <rect
            className="tl-band"
            x={from - 10}
            y={AXIS_Y - 16}
            width={to - from + 20}
            height={32}
            rx={16}
            fill="#bfdbfe"
          />
          <line x1={30} y1={AXIS_Y} x2={610} y2={AXIS_Y} stroke="#94a3b8" strokeWidth={2} />
          <polygon points="610,95 622,100 610,105" fill="#94a3b8" />
          <line x1={NOW_X} y1={AXIS_Y - 14} x2={NOW_X} y2={AXIS_Y + 14} stroke="#0f172a" strokeWidth={2} />
          <text x={80} y={AXIS_Y + 34} textAnchor="middle" className="fill-slate-600 text-xs font-semibold">
            Past · Geçmiş
          </text>
          <text x={NOW_X} y={AXIS_Y + 34} textAnchor="middle" className="fill-slate-900 text-xs font-semibold">
            Now · Şimdi
          </text>
          <text x={570} y={AXIS_Y + 34} textAnchor="middle" className="fill-slate-600 text-xs font-semibold">
            Future · Gelecek
          </text>
          {sc.body}
          {/* Marker glides over the active range. */}
          <g
            className="tl-travel"
            style={{ ["--a" as string]: `${from}px`, ["--b" as string]: `${to}px` }}
          >
            <polygon points="-9,76 9,76 0,90" fill="#f59e0b" />
            <circle cx={0} cy={AXIS_Y} r={11} fill="none" stroke="#f59e0b" strokeWidth={3} />
          </g>
        </svg>
        <p className="mt-1 text-sm text-slate-600">{sc.caption}</p>
        <div className="mt-2 flex gap-2">
          <button onClick={() => setPaused((p) => !p)} className={small}>
            {paused ? "▶ Oynat" : "⏸ Durdur"}
          </button>
          <button
            onClick={() => {
              setPaused(false);
              setRun((r) => r + 1);
            }}
            className={small}
          >
            ↻ Baştan
          </button>
        </div>
      </div>
    </section>
  );
}
