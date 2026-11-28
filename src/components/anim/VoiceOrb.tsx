type Look = { color: string; speed: string; icon: string };

const LOOKS: Record<string, Look> = {
  listening: { color: "#2563eb", speed: "2.2s", icon: "👂" },
  thinking: { color: "#d97706", speed: "1.6s", icon: "💭" },
  speaking: { color: "#7c3aed", speed: "1.1s", icon: "🗣️" },
};

const WAITING: Look = { color: "#64748b", speed: "2.8s", icon: "⏳" };

/** Rings and a core that react to the session state and the live volume. */
export default function VoiceOrb({ state, volume }: { state: string; volume: number }) {
  const look = LOOKS[state] ?? WAITING;
  const level = Math.min(1, Math.max(0, volume) * 1.8);
  const busy = state !== "listening" && state !== "speaking";

  return (
    <div
      aria-hidden="true"
      className="relative flex h-44 w-44 items-center justify-center"
      style={{ ["--speed" as string]: look.speed }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={`${state}-${i}`}
          className="orb-ring absolute h-28 w-28 rounded-full border-4"
          style={{ borderColor: look.color, animationDelay: `calc(var(--speed) / 3 * ${i})` }}
        />
      ))}
      <span
        className="absolute h-28 w-28 rounded-full opacity-25 transition-transform duration-100"
        style={{ background: look.color, transform: `scale(${1 + level * 0.55})` }}
      />
      {busy && (
        <span
          className="orb-spin absolute h-28 w-28 rounded-full border-4 border-transparent"
          style={{ borderTopColor: look.color }}
        />
      )}
      <span
        className="orb-breathe flex h-20 w-20 items-center justify-center rounded-full text-3xl shadow-xl transition-colors duration-500"
        style={{ background: `radial-gradient(circle at 30% 30%, #fff, ${look.color})` }}
      >
        {look.icon}
      </span>
    </div>
  );
}
