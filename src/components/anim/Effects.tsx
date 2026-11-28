const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#f43f5e", "#06b6d4"];

/** One-shot particle burst, centred on the nearest positioned parent. */
export function Sparks({ count = 12, distance = 34 }: { count?: number; distance?: number }) {
  return (
    <span aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="fx-spark"
          style={{
            ["--a" as string]: `${(360 / count) * i}deg`,
            ["--d" as string]: `${distance + (i % 3) * 8}px`,
            background: COLORS[i % COLORS.length],
          }}
        />
      ))}
    </span>
  );
}

/** Equalizer bars shown while something is being read aloud. */
export function SoundWave({ className = "text-indigo-600" }: { className?: string }) {
  return (
    <span className={`anim-pop flex h-4 shrink-0 items-end gap-0.5 ${className}`} aria-hidden="true">
      {[0, 0.25, 0.45, 0.1, 0.35].map((d) => (
        <span
          key={d}
          className="anim-eq h-full w-1 rounded-full bg-current"
          style={{ animationDelay: `${d}s` }}
        />
      ))}
    </span>
  );
}
