/** Thin wrapper around the browser speech synthesis (en-US). */
function supported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Ends the highlight of whoever is currently reading.
let release: (() => void) | null = null;
// Keeps utterances referenced; some browsers drop events of collected ones.
let queue: SpeechSynthesisUtterance[] = [];

export function stopSpeech() {
  release?.();
  if (supported()) window.speechSynthesis.cancel();
}

export function speakLines(
  lines: { who: string; text: string }[],
  onError: (msg: string) => void,
  events?: { onLine: (index: number) => void; onDone: () => void },
) {
  if (!supported()) {
    onError("Bu tarayıcı sesli okumayı desteklemiyor.");
    return;
  }
  try {
    stopSpeech();
    let live = true;
    const finish = () => {
      if (!live) return;
      live = false;
      release = null;
      events?.onDone();
    };
    release = finish;
    events?.onLine(0);
    queue = lines.map((l, i) => {
      const u = new SpeechSynthesisUtterance(l.text);
      u.lang = "en-US";
      u.rate = 0.92;
      // A and B get slightly different pitch so the dialogue is easy to follow.
      u.pitch = l.who === "B" ? 1.25 : 0.95;
      u.onstart = () => {
        if (live) events?.onLine(i);
      };
      u.onerror = finish;
      if (i === lines.length - 1) u.onend = finish;
      return u;
    });
    queue.forEach((u) => window.speechSynthesis.speak(u));
  } catch {
    release?.();
    onError("Sesli okuma başlatılamadı.");
  }
}
