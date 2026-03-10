import { NextResponse } from "next/server";
import { parseUserQuery } from "@/lib/search/parseUserQuery";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() ?? "";

  if (!query) {
    return NextResponse.json(
      { ok: false, error: "Missing query" },
      { status: 400 },
    );
  }

  const parsed = parseUserQuery(query);
  const AI_THRESHOLD = 0.55;

  if (parsed.confidence >= AI_THRESHOLD) {
    return NextResponse.json({
      parsed,
      source: "rule-based",
    });
  }

  return NextResponse.json({
    parsed,
    source: "low-confidence",
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query: string = body?.query ?? "";

    if (!query.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const parsed = parseUserQuery(query);

    const AI_THRESHOLD = 0.55;

    if (parsed.confidence >= AI_THRESHOLD) {
      return NextResponse.json({
        parsed,
        source: "rule-based",
      });
    }

    // low confidence → will use AI later
    return NextResponse.json({
      parsed,
      source: "low-confidence",
    });
  } catch (err) {
    console.error("Interpret error:", err);
    return NextResponse.json(
      { error: "Failed to interpret query" },
      { status: 500 },
    );
  }
}
