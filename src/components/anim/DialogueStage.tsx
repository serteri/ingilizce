export type Speaker = "A" | "B";
/** "live" loops while audio plays, "burst" gestures a few times, "still" only highlights. */
export type Talk = "live" | "burst" | "still";

const TONE: Record<Speaker, { stroke: string; ring: string; bg: string }> = {
  A: { stroke: "#2563eb", ring: "border-blue-400", bg: "bg-blue-50" },
  B: { stroke: "#7c3aed", ring: "border-violet-400", bg: "bg-violet-50" },
};

function Figure({ who, active, talk }: { who: Speaker; active: boolean; talk: Talk }) {
  const motion = active && talk !== "still" ? `fig-${talk}` : "";
  return (
    <div
      className={`flex shrink-0 flex-col items-center transition-all duration-500 ${
        active ? "scale-110" : "scale-95 opacity-45"
      }`}
    >
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
      <span
        className="mt-1 rounded-full px-2 text-xs font-bold text-white"
        style={{ background: TONE[who].stroke }}
      >
        {who}
      </span>
    </div>
  );
}

/** Two line characters and the speech bubble of whoever has the floor. */
export default function DialogueStage({
  speaker,
  talk = "still",
  bubbleKey,
  children,
}: {
  speaker: Speaker | null;
  talk?: Talk;
  /** Changing it makes the bubble appear again. */
  bubbleKey: string;
  children: React.ReactNode;
}) {
  const tone = speaker ? TONE[speaker] : null;
  return (
    <div className="flex items-end gap-2 rounded-xl bg-gradient-to-b from-sky-50 to-white p-3 sm:gap-4">
      <Figure who="A" active={speaker === "A"} talk={talk} />
      <div className="flex min-w-0 flex-1 self-center">
        <div
          key={bubbleKey}
          aria-live="polite"
          className={`bubble relative w-full rounded-2xl border-2 p-3 text-center text-sm text-slate-900 shadow-sm ${
            tone ? `${tone.ring} ${tone.bg}` : "border-slate-200 bg-white"
          } ${speaker === "B" ? "bubble-right" : speaker === "A" ? "bubble-left" : ""}`}
        >
          {children}
        </div>
      </div>
      <Figure who="B" active={speaker === "B"} talk={talk} />
    </div>
  );
}
