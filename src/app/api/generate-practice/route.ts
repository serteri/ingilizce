import { TOPICS, type Question } from "@/data/grammar";
import {
  englishOf,
  ROLES,
  RULES,
  sentenceKey,
  type Sentence,
} from "@/data/sentences";
import { callGemini, geminiKey } from "@/lib/gemini";

const QUESTIONS_SCHEMA = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          kind: { type: "STRING" },
          prompt: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
          answer: { type: "STRING" },
          why: { type: "STRING" },
        },
        required: ["kind", "prompt", "answer", "why"],
      },
    },
  },
  required: ["questions"],
};

const SNIPPET_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    dialogue: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          who: { type: "STRING" },
          text: { type: "STRING" },
          tr: { type: "STRING" },
        },
        required: ["who", "text", "tr"],
      },
    },
    explanation: { type: "STRING" },
  },
  required: ["title", "dialogue", "explanation"],
};

const SENTENCES_SCHEMA = {
  type: "OBJECT",
  properties: {
    sentences: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          s: { type: "STRING" },
          v: { type: "STRING" },
          o: { type: "STRING" },
          m: { type: "STRING" },
          p: { type: "STRING" },
          t: { type: "STRING" },
          tr: { type: "STRING" },
        },
        required: ["s", "v", "o", "m", "p", "t", "tr"],
      },
    },
  },
  required: ["sentences"],
};

function str(v: unknown, max = 400) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function cleanQuestions(raw: unknown): Question[] {
  if (!raw || typeof raw !== "object") return [];
  const list = (raw as { questions?: unknown }).questions;
  if (!Array.isArray(list)) return [];
  const out: Question[] = [];
  for (const item of list) {
    const o = item as Record<string, unknown>;
    const kind = str(o.kind, 10);
    const prompt = str(o.prompt);
    const answer = str(o.answer, 200);
    const why = str(o.why, 400);
    if (!prompt || !answer) continue;
    if (kind === "choice") {
      const options = Array.isArray(o.options)
        ? o.options.map((x) => str(x, 120)).filter(Boolean)
        : [];
      if (options.length < 2 || !options.includes(answer)) continue;
      out.push({ kind: "choice", prompt, options, answer, why });
    } else if (kind === "fix") {
      out.push({
        kind: "fix",
        prompt: `Hatayı bul ve doğru cümleyi yaz: “${prompt}”`,
        answer,
        why,
      });
    } else if (kind === "fill") {
      if (!prompt.includes("___")) continue;
      out.push({ prompt, answer, why });
    }
  }
  return out.slice(0, 3);
}

/** Keeps complete, unseen sentences with at least three blocks. */
function cleanSentences(raw: unknown, avoid: string[]): Sentence[] {
  const list = (raw as { sentences?: unknown } | null)?.sentences;
  if (!Array.isArray(list)) return [];
  const seen = new Set(avoid.map((x) => x.toLowerCase()));
  const out: Sentence[] = [];
  for (const item of list) {
    const o = (item ?? {}) as Record<string, unknown>;
    const part = (k: string) => str(o[k], 60).replace(/[.!?]+$/, "");
    const x: Sentence = {
      s: part("s"),
      v: part("v"),
      o: part("o"),
      m: part("m"),
      p: part("p"),
      t: part("t"),
      tr: str(o.tr, 200),
    };
    if (!x.s || !x.v || !x.tr) continue;
    if (ROLES.filter((r) => x[r]).length < 3 || englishOf(x).includes("?")) continue;
    const key = sentenceKey(x);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(x);
  }
  return out.slice(0, 5);
}

export async function POST(request: Request) {
  const apiKey = geminiKey();
  if (!apiKey) {
    return Response.json({
      configured: false,
      warning: "GOOGLE_API_KEY (or GEMINI_API_KEY) is not set",
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const kind = body.kind;
  if (kind !== "questions" && kind !== "snippet" && kind !== "svompt_sentences") {
    return Response.json(
      { error: "kind must be questions, snippet or svompt_sentences" },
      { status: 400 },
    );
  }
  const known = TOPICS.find((t) => t.id === body.topicId);
  const title = known?.title ?? str(body.title, 120);
  if (!title) {
    return Response.json({ error: "topicId or title is required" }, { status: 400 });
  }
  const level = known?.level ?? str(body.level, 40);
  const focus = known?.focus ?? "";

  const context = `Grammar topic: ${title}\nLevel: ${level}\nFocus: ${focus}`;

  try {
    if (kind === "svompt_sentences") {
      const avoid = Array.isArray(body.avoid)
        ? body.avoid.slice(-60).map((x) => str(x, 200)).filter(Boolean)
        : [];
      const rule = known ? RULES[known.id]?.en : "";
      const r = await callGemini(
        apiKey,
        `You write word-order practice for a Turkish-speaking English learner. ${context}
Rule being practised: ${rule}
Write exactly 5 NEW, natural, everyday English STATEMENTS (no questions) that use this grammar. Split each into blocks that read correctly in the fixed order s, v, o, m, p, t:
"s" subject, "v" the whole verb phrase including auxiliaries and negation, "o" object or complement, "m" manner, "p" place, "t" time expression or time clause. Use "" for a missing block, fill at least 3 blocks, and add no final punctuation. Joining the non-empty blocks with spaces must give a correct sentence with no other natural order needed. "tr": natural Turkish translation. Vary subjects, verbs and situations. Do not repeat: ${avoid.join(" | ")}`,
        SENTENCES_SCHEMA,
        1,
      );
      const sentences = cleanSentences(r.data, avoid);
      if (!sentences.length) {
        return Response.json({
          configured: true,
          warning: `No usable sentences (status ${r.status})`,
        });
      }
      return Response.json({ configured: true, sentences });
    }

    if (kind === "questions") {
      const avoid = (known?.questions ?? [])
        .slice(0, 8)
        .map((q) => q.prompt)
        .join(" | ");
      const r = await callGemini(
        apiKey,
        `You write practice exercises for a Turkish-speaking English learner. ${context}
Create exactly 3 NEW exercises, one of each kind:
- "fill": "prompt" is an English sentence with ___ and the verb in brackets, e.g. "She ___ (work) here." "answer" is the missing words only.
- "choice": "prompt" is a sentence with ___ where the learner must pick the right tense/form; "options" has 3 choices; "answer" is EXACTLY one of the options.
- "fix": "prompt" is ONLY one English sentence that contains a grammar mistake from this topic; "answer" is the corrected full sentence.
Every item needs "why": one short explanation, first in English then in Turkish, separated by " / ". Use everyday situations. Do not repeat these existing prompts: ${avoid}`,
        QUESTIONS_SCHEMA,
        0.9,
      );
      const questions = cleanQuestions(r.data);
      if (!questions.length) {
        return Response.json({
          configured: true,
          warning: `No usable questions (status ${r.status})`,
        });
      }
      return Response.json({ configured: true, questions });
    }

    const r = await callGemini(
      apiKey,
      `You are an English tutor for a Turkish-speaking learner. ${context}
Write a natural, casual 4 to 6 line conversation between "A" and "B" about an everyday situation (not a textbook dialogue) that uses this grammar several times. Each line: "who" ("A" or "B"), "text" (English), "tr" (natural Turkish translation). "title": a short Turkish title. "explanation": 3 to 4 Turkish sentences explaining the topic through specific phrases of this dialogue.`,
      SNIPPET_SCHEMA,
      0.9,
    );
    const d = r.data as {
      title?: unknown;
      dialogue?: unknown;
      explanation?: unknown;
    } | null;
    const lines = Array.isArray(d?.dialogue)
      ? (d.dialogue as Record<string, unknown>[])
          .map((l) => ({
            who: str(l.who, 2) || "A",
            text: str(l.text),
            tr: str(l.tr) || undefined,
          }))
          .filter((l) => l.text)
          .slice(0, 8)
      : [];
    const explanation = str(d?.explanation, 1200);
    if (!lines.length || !explanation) {
      return Response.json({
        configured: true,
        warning: `No usable snippet (status ${r.status})`,
      });
    }
    return Response.json({
      configured: true,
      snippet: { title: str(d?.title, 120) || "Doğal konuşma kesiti", lines, explanation },
    });
  } catch {
    return Response.json({
      configured: true,
      warning: "Could not generate practice content",
    });
  }
}
