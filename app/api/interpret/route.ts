import { NextResponse } from "next/server";
import OpenAI from "openai";
import { parseUserQuery } from "@/lib/search/parseUserQuery";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_THRESHOLD = 0.55;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return NextResponse.json(
      { ok: false, error: "Missing query" },
      { status: 400 },
    );
  }

  console.log("🔎 USER QUERY:", query);

  const parsed = parseUserQuery(query);

  if (parsed.confidence >= AI_THRESHOLD) {
    console.log("🧠 RULE PARSER USED");
    console.log(parsed);

    return NextResponse.json({
      parsed,
      source: "rule-based",
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      parsed,
      source: "low-confidence",
      warning: "OPENAI_API_KEY is missing",
    });
  }

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
You extract travel search intent from user text.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanation text.

Use exactly this shape:
{
  "from": string | null,
  "to": string | null,
  "vibes": string[],
  "dateIntent": "today" | "tomorrow" | "this_week" | "next_week" | "this_weekend" | "next_weekend" | "this_month" | "next_month" | "flexible" | "month" | "range" | "date" | null,
  "departDateISO": string | null,
  "returnDateISO": string | null,
  "tripType": "oneway" | "return" | null,
  "passengers": number | null,
  "budget": { "max": number, "currency": "GBP" } | null,
  "cabin": "economy" | "premium" | "business" | "first" | null,
  "confidence": number
}

Rules:
- confidence must be between 0 and 1
- use null when unknown
- use [] when no vibes
- keep budget currency as GBP
- do not invent a destination if the user did not give one
- "somewhere warm" should usually mean vibes = ["warm"], to = null
- if user implies a return trip, set tripType = "return"
- if unclear, prefer conservative null values
          `.trim(),
        },
        {
          role: "user",
          content: query,
        },
      ],
    });

    const text = response.output_text.trim();
    const aiParsed = JSON.parse(text);

    console.log("🤖 AI PARSER USED");
    console.log(aiParsed);

    return NextResponse.json({
      parsed: {
        raw: query,
        from: aiParsed.from ?? null,
        to: aiParsed.to ?? null,
        vibes: Array.isArray(aiParsed.vibes) ? aiParsed.vibes : [],
        dateIntent: aiParsed.dateIntent ?? null,
        departDateISO: aiParsed.departDateISO ?? null,
        returnDateISO: aiParsed.returnDateISO ?? null,
        tripType: aiParsed.tripType ?? "oneway",
        passengers:
          typeof aiParsed.passengers === "number" ? aiParsed.passengers : null,
        budget:
          aiParsed.budget &&
          typeof aiParsed.budget.max === "number" &&
          aiParsed.budget.currency === "GBP"
            ? aiParsed.budget
            : null,
        cabin: aiParsed.cabin ?? null,
        confidence:
          typeof aiParsed.confidence === "number"
            ? Math.max(0, Math.min(1, aiParsed.confidence))
            : 0.4,
      },
      source: "ai",
    });
  } catch (err) {
    console.error("Interpret AI fallback error:", err);

    return NextResponse.json({
      parsed,
      source: "low-confidence",
      warning: "AI fallback failed",
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query: string = body?.query ?? "";

    if (!query.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const parsed = parseUserQuery(query);

    if (parsed.confidence >= AI_THRESHOLD) {
      console.log("🧠 RULE PARSER USED");
      console.log(parsed);

      return NextResponse.json({
        parsed,
        source: "rule-based",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        parsed,
        source: "low-confidence",
        warning: "OPENAI_API_KEY is missing",
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
You extract travel search intent from user text.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanation text.

Use exactly this shape:
{
  "from": string | null,
  "to": string | null,
  "vibes": string[],
  "dateIntent": "today" | "tomorrow" | "this_week" | "next_week" | "this_weekend" | "next_weekend" | "this_month" | "next_month" | "flexible" | "month" | "range" | "date" | null,
  "departDateISO": string | null,
  "returnDateISO": string | null,
  "tripType": "oneway" | "return" | null,
  "passengers": number | null,
  "budget": { "max": number, "currency": "GBP" } | null,
  "cabin": "economy" | "premium" | "business" | "first" | null,
  "confidence": number
}

Rules:
- confidence must be between 0 and 1
- use null when unknown
- use [] when no vibes
- keep budget currency as GBP
- do not invent a destination if the user did not give one
- "somewhere warm" should usually mean vibes = ["warm"], to = null
- if user implies a return trip, set tripType = "return"
- if unclear, prefer conservative null values
          `.trim(),
        },
        {
          role: "user",
          content: query,
        },
      ],
    });

    const text = response.output_text.trim();
    const aiParsed = JSON.parse(text);

    console.log("🤖 AI PARSER USED");
    console.log(aiParsed);

    return NextResponse.json({
      parsed: {
        raw: query,
        from: aiParsed.from ?? null,
        to: aiParsed.to ?? null,
        vibes: Array.isArray(aiParsed.vibes) ? aiParsed.vibes : [],
        dateIntent: aiParsed.dateIntent ?? null,
        departDateISO: aiParsed.departDateISO ?? null,
        returnDateISO: aiParsed.returnDateISO ?? null,
        tripType: aiParsed.tripType ?? "oneway",
        passengers:
          typeof aiParsed.passengers === "number" ? aiParsed.passengers : null,
        budget:
          aiParsed.budget &&
          typeof aiParsed.budget.max === "number" &&
          aiParsed.budget.currency === "GBP"
            ? aiParsed.budget
            : null,
        cabin: aiParsed.cabin ?? null,
        confidence:
          typeof aiParsed.confidence === "number"
            ? Math.max(0, Math.min(1, aiParsed.confidence))
            : 0.4,
      },
      source: "ai",
    });
  } catch (err) {
    console.error("Interpret error:", err);
    return NextResponse.json(
      { error: "Failed to interpret query" },
      { status: 500 },
    );
  }
}
