/**
 * Beat Coach API — powered by Kimi (Moonshot AI)
 *
 * POST /api/beat-coach
 * Body: { context: string; question: string; wrongAnswers?: string[] }
 *
 * Returns: { reply: string }
 *
 * The coach gives targeted, brief explanations (≤3 sentences) after wrong answers.
 * It never gives away quiz answers directly — it teaches the concept instead.
 *
 * Env vars required:
 *   KIMI_API_KEY — Moonshot AI API key (platform.moonshot.cn)
 */
import { NextRequest, NextResponse } from "next/server";

const KIMI_API_URL = "https://api.moonshot.cn/v1/chat/completions";
const KIMI_MODEL   = "moonshot-v1-8k";

const SYSTEM_PROMPT = `You are Beat Coach, a friendly music tutor for CCD.SCHOOL — a Duolingo-style app for learning music production and DJing.

Your role: give SHORT, targeted explanations (2-3 sentences MAX) when a student gets a quiz question wrong.

Rules:
- Never give away the correct answer directly — teach the concept instead
- Use plain English, no jargon unless it was already used in the question
- Be encouraging: start with a positive "Here's what's happening..." tone
- Relate to practical music-making whenever possible
- If asked about something unrelated to music, politely redirect: "I'm Beat Coach — let's keep it musical!"
- Keep responses under 80 words`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.KIMI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: "Beat Coach is unavailable right now — keep practicing and check back soon!" },
      { status: 200 },
    );
  }

  let body: { context?: string; question?: string; wrongAnswers?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { context = "", question = "", wrongAnswers = [] } = body;

  const userMessage = [
    context && `Lesson context: ${context}`,
    `Quiz question: ${question}`,
    wrongAnswers.length > 0 && `The student answered: "${wrongAnswers.join('", "')}" — which was wrong.`,
    "Please explain why this is tricky and what concept they should focus on.",
  ].filter(Boolean).join("\n");

  try {
    const res = await fetch(KIMI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: KIMI_MODEL,
        messages: [
          { role: "system",    content: SYSTEM_PROMPT },
          { role: "user",      content: userMessage },
        ],
        max_tokens: 150,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!res.ok) {
      throw new Error(`Kimi API error: ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim()
      ?? "Here's a tip: re-read the concept section and try again — you've got this!";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[beat-coach]", err);
    return NextResponse.json({
      reply: "Take another look at the concept — the key is in the definition. You're close!",
    });
  }
}
