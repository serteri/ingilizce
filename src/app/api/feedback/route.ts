const MODEL = "gemini-2.5-flash";

const FEEDBACK_PROMPT = `You are a silent English tutor. The student said the sentence below in a spoken conversation (it may come from speech recognition, so ignore punctuation/capitalisation issues).
Return JSON with:
- "corrected": the sentence fixed for grammar, or the same sentence if it is already correct.
- "natural": a more natural, fluent way a native speaker might say it (may equal "corrected").
- "tip": ONE short sentence in Turkish explaining the most useful point. If the sentence is already good, give brief praise or a small natural-phrasing tip.
- "hasIssue": true if there is a grammar error or clearly unnatural phrasing, otherwise false.`;

const FEEDBACK_SCHEMA = {
  type: "OBJECT",
  properties: {
    corrected: { type: "STRING" },
    natural: { type: "STRING" },
    tip: { type: "STRING" },
    hasIssue: { type: "BOOLEAN" },
  },
  required: ["corrected", "natural", "tip", "hasIssue"],
};

const EXPLAIN_PROMPT = `You are an English tutor for a Turkish-speaking learner. Show the grammar topic below the way people really use it in everyday speech, not like a textbook.
Return JSON with:
- "title": a short Turkish title for the situation.
- "dialogue": 4 to 6 lines of a natural casual conversation between speakers "A" and "B" in English that uses the topic several times. Each line is {"who": "A" or "B", "text": "..."}.
- "explanation": 3 to 4 sentences in Turkish that explain the topic THROUGH this dialogue, in a different, friendly, conversational way (point at specific phrases from the dialogue).`;

const EXPLAIN_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    dialogue: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { who: { type: "STRING" }, text: { type: "STRING" } },
        required: ["who", "text"],
      },
    },
    explanation: { type: "STRING" },
  },
  required: ["title", "dialogue", "explanation"],
};

async function callGemini(
  apiKey: string,
  prompt: string,
  schema: object,
  temperature: number,
) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature,
          thinkingConfig: { thinkingBudget: 0 },
          responseSchema: schema,
        },
      }),
    },
  );
  if (!res.ok) return { status: res.status as number, data: null };
  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return { status: 200, data: JSON.parse(raw) };
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY ?? process.env.GEMINI_API_KEY;
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

  // mode "explain": alternative natural-conversation explanation of a topic
  if (body.mode === "explain") {
    const topic =
      typeof body.topic === "string" ? body.topic.trim().slice(0, 120) : "";
    const focus =
      typeof body.focus === "string" ? body.focus.trim().slice(0, 300) : "";
    if (!topic) {
      return Response.json({ error: "topic is required" }, { status: 400 });
    }
    try {
      const r = await callGemini(
        apiKey,
        `${EXPLAIN_PROMPT}\n\nTopic: ${topic}\nFocus: ${focus}`,
        EXPLAIN_SCHEMA,
        0.9,
      );
      if (!r.data) {
        return Response.json({
          configured: true,
          warning: `Gemini request failed (${r.status})`,
        });
      }
      return Response.json({ configured: true, ...r.data });
    } catch {
      return Response.json({
        configured: true,
        warning: "Could not generate explanation",
      });
    }
  }

  const text =
    typeof body.text === "string" ? body.text.trim().slice(0, 500) : "";
  if (!text) {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const r = await callGemini(
      apiKey,
      `${FEEDBACK_PROMPT}\n\nSentence: ${text}`,
      FEEDBACK_SCHEMA,
      0.2,
    );
    if (!r.data) {
      return Response.json({
        configured: true,
        warning: `Gemini request failed (${r.status})`,
      });
    }
    return Response.json({ configured: true, original: text, ...r.data });
  } catch {
    return Response.json({
      configured: true,
      warning: "Could not generate feedback",
    });
  }
}
