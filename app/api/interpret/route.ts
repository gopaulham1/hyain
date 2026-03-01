import { NextResponse } from "next/server";
import { parseUserQuery } from "@/lib/search/parseUserQuery";

export function GET() {
  return NextResponse.json({
    ok: true,
    message: "Use POST with { query: string }",
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

    return NextResponse.json({
      parsed,
      source: "rule-based", // 🔥 important for tomorrow
    });
  } catch (err) {
    console.error("Interpret error:", err);
    return NextResponse.json(
      { error: "Failed to interpret query" },
      { status: 500 },
    );
  }
}
