import json
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import google

load_dotenv(Path(__file__).resolve().parent / ".env.local", override=True)

logger = logging.getLogger("english-teacher")


def log_env_status() -> None:
    env_path = Path(__file__).resolve().parent / ".env.local"
    logger.info("env file: %s (exists=%s)", env_path, env_path.exists())
    url = os.getenv("LIVEKIT_URL", "")
    logger.info("LIVEKIT_URL set=%s value=%s", bool(url), url or "-")
    for name in ("LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "GOOGLE_API_KEY"):
        val = os.getenv(name, "")
        if val:
            logger.info("%s set=True prefix=%s... len=%d", name, val[:4], len(val))
        else:
            logger.error("%s is MISSING or empty in .env.local", name)

DEFAULT_SCENARIO = "Daily casual conversation"

INSTRUCTIONS_TEMPLATE = """You are a warm, patient, native English-speaking conversation partner helping a student practice spoken English.

Scenario for this session: {scenario}
Play the role that fits this scenario naturally and stay in character.

Rules:
- Keep every reply short: 1 to 3 sentences.
- Always end with a natural follow-up question so the student does most of the talking.
- Do not interrupt the student for small grammar mistakes. Only if a mistake changes the meaning, gently work the correct form into your own sentence.
- Never use markdown, lists, or long grammar explanations. Use plain spoken language only.
- Speak only in English, at a clear, natural pace."""


def parse_scenario(metadata: str | None) -> str:
    if not metadata:
        return DEFAULT_SCENARIO
    try:
        data = json.loads(metadata)
        scenario = data.get("scenario") if isinstance(data, dict) else None
        if isinstance(scenario, str) and scenario.strip():
            return scenario.strip()
    except (json.JSONDecodeError, TypeError):
        logger.warning("Participant metadata is not valid JSON")
    return DEFAULT_SCENARIO


STAGE_GUIDES = {
    "examples": (
        "Stage: example practice. Do NOT lecture about grammar. Use the example sentences as models. "
        "Say one short model sentence or ask one short question that makes the student produce a "
        "similar sentence with the target grammar, then react briefly and move to the next one."
    ),
    "vocab_practice": (
        "Stage: vocabulary practice. Pick one target word at a time. Ask a short, concrete question "
        "(daily life, social, work or travel) that makes the student use that word in a full sentence "
        "with the target grammar. Praise briefly, recast mistakes inside your own sentence, then move "
        "to another target word."
    ),
    "end_conversation": (
        "Stage: end-of-lesson conversation. Hold a natural conversation on an everyday topic and steer "
        "it so the student naturally uses the lesson's grammar structure and as many target words as "
        "possible. Ask open follow-up questions."
    ),
}


def parse_metadata(metadata: str | None) -> dict:
    if not metadata:
        return {}
    try:
        data = json.loads(metadata)
        return data if isinstance(data, dict) else {}
    except (json.JSONDecodeError, TypeError):
        logger.warning("Participant metadata is not valid JSON")
        return {}


def build_instructions(meta: dict) -> tuple[str, str]:
    """Return (system instructions, greeting instructions)."""
    lesson_id = meta.get("lessonId")
    if not lesson_id:
        scenario = parse_scenario(json.dumps(meta))
        return (
            INSTRUCTIONS_TEMPLATE.format(scenario=scenario),
            "Greet the student warmly in exactly 2 short sentences, "
            "then start the scenario with your first in-character line or question.",
        )

    stage = meta.get("stage") if meta.get("stage") in STAGE_GUIDES else "end_conversation"
    words = ", ".join(str(w) for w in meta.get("targetWords", []))
    examples = " | ".join(str(e) for e in meta.get("examples", []))
    instructions = f"""You are a warm, patient, native English-speaking tutor doing a short spoken practice with a Turkish-speaking student.

Lesson: {meta.get("tenseTopic", "")}
Grammar focus: {meta.get("grammarFocus", "")}
Target words: {words}
Example sentences: {examples}

{STAGE_GUIDES[stage]}

Rules:
- Keep every reply short: 1 to 3 sentences.
- Always end with a short, clear question or prompt so the student does most of the talking.
- Do not interrupt for small grammar mistakes. If a mistake changes the meaning or breaks the target grammar, gently use the correct form inside your own sentence.
- Never give a long grammar explanation, never use markdown or lists. Plain spoken English only."""
    greeting = (
        "Greet the student warmly in 2 short sentences, mention in a few words what you will practice, "
        "and ask your first short question."
    )
    return instructions, greeting


async def entrypoint(ctx: JobContext):
    log_env_status()
    await ctx.connect()
    logger.info("room connected: %s", ctx.room.name)

    # Wait for the student and read the scenario from their token metadata.
    participant = await ctx.wait_for_participant()
    meta = parse_metadata(participant.metadata)
    scenario = parse_scenario(participant.metadata)
    instructions, greeting = build_instructions(meta)
    logger.info(
        "lesson=%s stage=%s", meta.get("lessonId", "-"), meta.get("stage", "-")
    )
    logger.info(
        "student joined: %s (scenario: %s)", participant.identity, scenario
    )

    @ctx.room.on("track_subscribed")
    def _on_track(track, publication, p):
        logger.info("user audio track subscribed: %s from %s", track.kind, p.identity)

    try:
        session = AgentSession(
            llm=google.realtime.RealtimeModel(voice="Aoede"),
        )
    except Exception:
        logger.exception(
            "Could not create Gemini Live model (is GOOGLE_API_KEY set and valid?)"
        )
        return

    @session.on("user_state_changed")
    def _on_user_state(ev):
        logger.info("user state: %s -> %s", ev.old_state, ev.new_state)

    @session.on("user_input_transcribed")
    def _on_transcript(ev):
        logger.info("user said (final=%s): %s", ev.is_final, ev.transcript)

    @session.on("agent_state_changed")
    def _on_agent_state(ev):
        logger.info("agent state: %s -> %s", ev.old_state, ev.new_state)

    @session.on("error")
    def _on_error(ev):
        logger.error("session error: %r", getattr(ev, "error", ev))

    try:
        await session.start(
            room=ctx.room,
            agent=Agent(instructions=instructions),
        )
        logger.info("session started, sending greeting")
    except Exception:
        logger.exception(
            "session.start failed (invalid/missing GOOGLE_API_KEY, quota, "
            "or Gemini Live connection error)"
        )
        return

    try:
        await session.generate_reply(instructions=greeting)
    except Exception:
        logger.exception(
            "generate_reply failed (quota exceeded or Gemini Live connection error)"
        )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
