import { AccessToken } from "livekit-server-sdk";
import { STAGE_VALUES, getLesson, type Stage } from "@/data/lessons";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get("room");
  const username = searchParams.get("username");
  const scenario = searchParams.get("scenario");
  const lessonId = searchParams.get("lessonId");
  const stageParam = searchParams.get("stage");

  if (!room || !username) {
    return Response.json(
      { error: "room and username are required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    return Response.json(
      { error: "LiveKit credentials are not configured" },
      { status: 500 },
    );
  }

  // Lesson metadata is built server-side from the trusted lesson data.
  let metadata: Record<string, unknown> = { scenario };
  if (lessonId) {
    const lesson = getLesson(lessonId);
    if (!lesson) {
      return Response.json({ error: "Unknown lessonId" }, { status: 400 });
    }
    const stage: Stage = STAGE_VALUES.includes(stageParam as Stage)
      ? (stageParam as Stage)
      : "end_conversation";
    metadata = {
      lessonId: lesson.id,
      tenseTopic: lesson.tenseTopic,
      grammarFocus: lesson.grammarFocus,
      targetWords: lesson.words.map((w) => w.word),
      examples: lesson.examples.map((e) => e.en),
      stage,
    };
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: username,
    name: username,
    metadata: JSON.stringify(metadata),
  });
  at.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return Response.json({ token: await at.toJwt() });
}
