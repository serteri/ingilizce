import { SoundWave } from "@/components/anim/Effects";

export type Speaker = "A" | "B";
/** "live" loops while audio plays, "burst" gestures a few times, "still" only highlights. */
export type Talk = "live" | "burst" | "still";

export type Bubble = {
  /** Changing it makes the bubble open again. */
  id: string;
  body: React.ReactNode;
};

export function speakerOf(who?: string): Speaker {
  return who === "B" ? "B" : "A";
}

const TONE: Record<Speaker, { stroke: string; ring: string; bg: string; wave: string }> = {
  A: { stroke: "#2563eb", ring: "border-blue-400", bg: "bg-blue-50", wave: "text-blue-600" },
  B: { stroke: "#7c3aed", ring: "border-violet-400", bg: "bg-violet-50", wave: "text-violet-600" },
};

function Figure({ who, active, talk }: { who: Speaker; active: boolean; talk: Talk }) {
  const motion = active && talk !== "still" ? `fig-${talk}` : "";
  return (
    <svg
      viewBox="0 0 80 110"
      aria-hidden="true"
      // B is mirrored so the two face each other.
      className={`h-24 w-16 sm:h-28 sm:w-20 ${who === "B" ? "-scale-x-100" : ""} ${motion}`}
      fill="none"
      stroke={TONE[who].stroke}
      strokeWidth={4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx={40} cy={106} rx={22} ry={3} fill="#cbd5e1" stroke="none" />
      <g className="fig-body">
        <circle cx={40} cy={26} r={18} fill="#fff" />
        {who === "A" ? (
          <path d="M28 12 Q38 2 52 10" />
        ) : (
          <path d="M23 22 Q22 4 42 6 Q60 8 57 30" />
        )}
        <circle cx={36} cy={23} r={2.4} fill={TONE[who].stroke} stroke="none" />
        <circle cx={49} cy={23} r={2.4} fill={TONE[who].stroke} stroke="none" />
        <ellipse
          className="fig-mouth"
          cx={43}
          cy={34}
          rx={5}
          ry={active ? 3 : 1}
          fill={TONE[who].stroke}
          stroke="none"
        />
        <path d="M40 44 V74" />
        <path d="M40 74 L29 103 M40 74 L52 103" />
        <path d="M40 52 L25 68" />
        {/* The arm toward the partner gestures from the shoulder. */}
        <path
          className="fig-arm"
          d={active ? "M40 52 L56 56 L66 41" : "M40 52 L54 70"}
        />
      </g>
    </svg>
  );
}

/** Two line characters, each with an own speech bubble. */
export default function DialogueStage({
  speaker,
  talk = "still",
  a,
  b,
}: {
  speaker: Speaker | null;
  talk?: Talk;
  a: Bubble | null;
  b: Bubble | null;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl bg-gradient-to-b from-sky-50 to-white p-3 sm:gap-8 sm:px-6">
      {(["A", "B"] as const).map((who) => {
        const bubble = who === "A" ? a : b;
        const active = speaker === who;
        const tone = TONE[who];
        const side = who === "A" ? "items-start" : "items-end";
        return (
          <div key={who} data-speaker={who} className={`flex min-w-0 flex-col ${side}`}>
            {/* Fixed minimum height keeps the figures from jumping. */}
            <div className="flex min-h-28 w-full flex-1 flex-col justify-end pb-3">
              {bubble && (
                <div
                  key={bubble.id}
                  aria-live="polite"
                  className={`bubble relative rounded-2xl border-2 p-3 text-sm text-slate-900 transition-all duration-500 ${
                    who === "A" ? "bubble-a" : "bubble-b"
                  } ${tone.ring} ${
                    active ? `${tone.bg} scale-[1.03] shadow-lg` : "bg-white opacity-55"
                  }`}
                >
                  {bubble.body}
                  {active && talk === "live" && (
                    <span className="mt-1 flex justify-center">
                      <SoundWave className={tone.wave} />
                    </span>
                  )}
                </div>
              )}
            </div>
            <div
              className={`flex flex-col items-center transition-all duration-500 ${
                active ? "scale-110" : "scale-95 opacity-45"
              }`}
            >
              <Figure who={who} active={active} talk={talk} />
              <span
                className="mt-1 rounded-full px-2 text-xs font-bold text-white"
                style={{ background: tone.stroke }}
              >
                {who}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
