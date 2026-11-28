const MODEL = "gemini-2.5-flash";

export function geminiKey() {
  return process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || "";
}

/** Calls Gemini generateContent with a JSON schema. Throws on bad JSON. */
export async function callGemini(
  apiKey: string,
  prompt: string,
  schema: object,
  temperature: number,
): Promise<{ status: number; data: unknown }> {
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
  if (!res.ok) return { status: res.status, data: null };
  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return { status: 200, data: JSON.parse(raw) };
}
