"use client";

import { useEffect, useRef, useState } from "react";
import { RoomEvent, Track, type LocalAudioTrack } from "livekit-client";
import {
  BarVisualizer,
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  VoiceAssistantControlBar,
  useLocalParticipant,
  useRoomContext,
  useTrackVolume,
  useTranscriptions,
  useVoiceAssistant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import VoiceOrb from "@/components/anim/VoiceOrb";

const STATE_LABELS: Record<string, string> = {
  disconnected: "Bağlanıyor...",
  connecting: "Bağlanıyor...",
  initializing: "Öğretmen hazırlanıyor...",
  listening: "Dinliyor",
  thinking: "Düşünüyor",
  speaking: "Konuşuyor",
};

function Diagnostics({
  onAgent,
}: {
  onAgent?: (joined: boolean) => void;
}) {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const [agentJoined, setAgentJoined] = useState(false);
  const [agentAudio, setAgentAudio] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Explicitly enable the microphone and report the result.
  useEffect(() => {
    let cancelled = false;
    localParticipant
      .setMicrophoneEnabled(true)
      .then(() => {
        if (!cancelled) console.log("[voice] local mic enabled");
      })
      .catch((e) => {
        console.error("[voice] error: mic could not be enabled", e);
        if (!cancelled) setMicError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [localParticipant]);

  const micLabel = localParticipant.getTrackPublication(Track.Source.Microphone)
    ?.track?.mediaStreamTrack?.label;
  const micDevice = micLabel || (isMicrophoneEnabled ? "varsayılan cihaz" : "-");

  useEffect(() => {
    const sync = () => {
      const agents = Array.from(room.remoteParticipants.values());
      setAgentJoined(agents.length > 0);
      setAgentAudio(
        agents.some((p) =>
          p.getTrackPublications().some(
            (t) => t.kind === Track.Kind.Audio && t.isSubscribed,
          ),
        ),
      );
    };
    const onJoin = (p: { identity: string }) => {
      console.log("[voice] remote participant joined:", p.identity);
      sync();
    };
    const onSub = (track: { kind: string }) => {
      console.log("[voice] remote track subscribed:", track.kind);
      sync();
    };
    const onErr = (e: Error) => console.error("[voice] error:", e);
    room.on(RoomEvent.ParticipantConnected, onJoin);
    room.on(RoomEvent.ParticipantDisconnected, sync);
    room.on(RoomEvent.TrackSubscribed, onSub);
    room.on(RoomEvent.TrackUnsubscribed, sync);
    room.on(RoomEvent.MediaDevicesError, onErr);
    sync();
    return () => {
      room.off(RoomEvent.ParticipantConnected, onJoin);
      room.off(RoomEvent.ParticipantDisconnected, sync);
      room.off(RoomEvent.TrackSubscribed, onSub);
      room.off(RoomEvent.TrackUnsubscribed, sync);
      room.off(RoomEvent.MediaDevicesError, onErr);
    };
  }, [room]);

  useEffect(() => {
    onAgent?.(agentJoined);
  }, [agentJoined, onAgent]);

  const rows: [string, boolean | null, string][] = [
    ["Oda bağlantısı", true, "Bağlı"],
    [
      "Mikrofon",
      micError ? false : isMicrophoneEnabled,
      micError ?? (isMicrophoneEnabled ? `Açık (${micDevice})` : "Kapalı"),
    ],
    ["Öğretmen", agentJoined, agentJoined ? "Öğretmen odada" : "Bekleniyor..."],
    ["Ses hattı", agentAudio, agentAudio ? "Ses hattı aktif" : "Bekleniyor..."],
  ];

  return (
    <ul className="w-full max-w-md space-y-1 rounded-xl border border-slate-200 bg-white p-4 text-sm">
      {rows.map(([label, ok, text]) => (
        <li key={label} className="flex justify-between gap-4">
          <span className="text-slate-500">{label}</span>
          <span className={ok ? "text-emerald-700" : "text-amber-700"}>
            {text}
          </span>
        </li>
      ))}
    </ul>
  );
}

type Card = {
  original: string;
  corrected: string;
  natural: string;
  tip: string;
  hasIssue: boolean;
};

function Conversation() {
  const { localParticipant } = useLocalParticipant();
  const transcriptions = useTranscriptions();
  const requested = useRef(new Set<string>());
  const [cards, setCards] = useState<Record<string, Card>>({});

  const messages = transcriptions.map((t) => ({
    id: t.streamInfo.id,
    mine: t.participantInfo.identity === localParticipant.identity,
    text: t.text,
    final: t.streamInfo.attributes?.["lk.transcription_final"] === "true",
  }));

  // Fire a lightweight background request for each finished student sentence.
  useEffect(() => {
    messages.forEach((m, i) => {
      const done = m.final || i < messages.length - 1;
      if (!m.mine || !done || requested.current.has(m.id)) return;
      const text = m.text.trim();
      if (text.split(/\s+/).length < 2) return;
      requested.current.add(m.id);
      fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d?.corrected) setCards((c) => ({ ...c, [m.id]: d as Card }));
          else if (d?.warning) console.warn("[feedback]", d.warning);
        })
        .catch((e) => console.warn("[feedback] failed", e));
    });
  });

  const recent = messages.slice(-4);
  const latestCards = messages
    .filter((m) => cards[m.id])
    .slice(-2)
    .reverse();

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="space-y-2 text-sm">
        {recent.length === 0 && (
          <p className="text-center text-slate-500">Konuşma burada görünecek…</p>
        )}
        {recent.map((m, i) => (
          <p
            key={m.id}
            className={`anim-item rounded-lg px-3 py-2 transition-all duration-500 ${
              m.mine
                ? "ml-8 bg-blue-50 text-slate-900"
                : "mr-8 border border-slate-200 bg-white text-slate-700"
            } ${
              i === recent.length - 1
                ? `scale-[1.03] shadow-lg ring-2 ${m.mine ? "ring-blue-300" : "ring-violet-300"}`
                : "opacity-60"
            }`}
          >
            <span className="mr-2 text-xs text-slate-500">
              {m.mine ? "Sen" : "Öğretmen"}
            </span>
            {m.text}
          </p>
        ))}
      </div>
      {latestCards.map((m) => {
        const c = cards[m.id];
        return (
          <div
            key={m.id}
            className="anim-open rounded-lg border border-slate-200 bg-white p-3 text-sm"
          >
            <p className="text-slate-500">“{c.original}”</p>
            {c.hasIssue && (
              <p className="mt-1 text-emerald-700">✓ {c.corrected}</p>
            )}
            {c.natural && c.natural !== c.corrected && (
              <p className="mt-1 text-blue-700">
                <span className="text-xs text-slate-500">Natural phrasing </span>
                {c.natural}
              </p>
            )}
            <p className="mt-1 text-slate-700">💡 {c.tip}</p>
          </div>
        );
      })}
    </div>
  );
}

function Teacher({ onAgent }: { onAgent?: (joined: boolean) => void }) {
  const { state, audioTrack } = useVoiceAssistant();
  const { microphoneTrack } = useLocalParticipant();
  const teacherVolume = useTrackVolume(audioTrack);
  const micVolume = useTrackVolume(
    microphoneTrack?.track as LocalAudioTrack | undefined,
  );
  return (
    <div className="flex w-full flex-col items-center gap-8">
      <VoiceOrb
        state={state}
        volume={state === "speaking" ? teacherVolume : micVolume}
      />
      <p key={state} className="anim-item text-xl font-medium text-slate-900">
        {STATE_LABELS[state] ?? state}
      </p>
      <div className="h-32 w-full max-w-md rounded-2xl bg-slate-900 p-4">
        <BarVisualizer
          state={state}
          barCount={7}
          trackRef={audioTrack}
          className="h-full w-full"
        />
      </div>
      <Conversation />
      <Diagnostics onAgent={onAgent} />
      <StartAudio
        label="Sesi etkinleştir (tarayıcı sesi engelledi)"
        className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white"
      />
      <div className="rounded-2xl bg-slate-900 p-2">
        <VoiceAssistantControlBar controls={{ leave: true }} />
      </div>
    </div>
  );
}


export type VoiceStatus = { conn: string; agent: boolean };

export default function VoiceSession({
  lessonId,
  stage,
  onLeave,
  onStatus,
}: {
  lessonId?: string;
  stage: string;
  onLeave: () => void;
  onStatus?: (s: VoiceStatus) => void;
}) {
  const [agentIn, setAgentIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connState, setConnState] = useState("Bağlanıyor...");

  useEffect(() => {
    let cancelled = false;
    const id = Math.random().toString(36).slice(2, 8);
    const params = new URLSearchParams({
      room: `lesson-${id}`,
      username: `student-${id}`,
      ...(lessonId
        ? { lessonId, stage }
        : { scenario: "Daily casual conversation" }),
    });
    fetch(`/api/token?${params}`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (cancelled) return;
        if (!ok || !d.token) setError(d.error ?? "Token alınamadı");
        else setToken(d.token);
      })
      .catch((e) => !cancelled && setError(String(e)));
    return () => {
      cancelled = true;
    };
  }, [lessonId, stage]);

  useEffect(() => {
    onStatus?.({ conn: error ? `Hata: ${error}` : connState, agent: agentIn });
  }, [connState, agentIn, error, onStatus]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-red-600">{error}</p>
        <button onClick={onLeave} className="rounded-lg bg-slate-100 px-4 py-2 text-slate-700">
          Geri dön
        </button>
      </div>
    );
  }
  if (!token)
    return (
      <div className="flex flex-col items-center gap-2">
        <VoiceOrb state="connecting" volume={0} />
        <p className="text-slate-500">Hazırlanıyor...</p>
      </div>
    );

  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      audio={true}
      video={false}
      data-lk-theme="default"
      onConnected={() => {
        console.log("[voice] room connected");
        setConnState("Bağlandı");
      }}
      onDisconnected={(reason) => {
        console.log("[voice] room disconnected", reason);
        onLeave();
      }}
      onError={(e) => {
        console.error("[voice] error:", e);
        setConnState(`Hata: ${e.message}`);
      }}
      onMediaDeviceFailure={(failure) => {
        console.error("[voice] error: media device failure", failure);
        setConnState(`Mikrofon hatası: ${failure ?? "bilinmiyor"}`);
      }}
      className="flex w-full flex-col items-center"
    >
      <p
        className={`mb-4 text-sm ${
          connState.startsWith("Bağlandı")
            ? "text-emerald-700"
            : /hata/i.test(connState)
              ? "text-red-600"
              : "text-slate-500"
        }`}
      >
        Bağlantı: {connState}
      </p>
      <Teacher onAgent={setAgentIn} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
