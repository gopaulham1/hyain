import type { ParsedQuery, DateIntent } from "./types";

function normalize(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

function detectPassengers(text: string): number | null {
  // "for 2", "2 people", "x2"
  const m =
    text.match(/\bfor\s+(\d+)\b/i) ||
    text.match(/\b(\d+)\s+(people|pax|passengers|travellers|travelers)\b/i) ||
    text.match(/\bx(\d+)\b/i);

  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 && n < 20 ? n : null;
}

function detectDateIntent(text: string): DateIntent {
  const t = text.toLowerCase();

  if (t.includes("flexible") || t.includes("anytime")) return "flexible";
  if (t.includes("next week")) return "next_week";
  if (t.includes("next month")) return "next_month";
  if (t.includes("this weekend") || t.includes("weekend")) return "this_weekend";

  return null;
}

function extractFromTo(text: string): { from: string | null; to: string | null } {
  // handles: "london to paris", "from london to paris", "london -> paris"
  const t = text.toLowerCase();

  const arrow = t.match(/\b(.+?)\s*(?:->|→)\s*(.+?)\b/);
  if (arrow) return { from: arrow[1].trim(), to: arrow[2].trim() };

  const fromTo = t.match(/\bfrom\s+(.+?)\s+to\s+(.+?)\b/);
  if (fromTo) return { from: fromTo[1].trim(), to: fromTo[2].trim() };

  const simpleTo = t.match(/\b(.+?)\s+to\s+(.+?)\b/);
  if (simpleTo) return { from: simpleTo[1].trim(), to: simpleTo[2].trim() };

  return { from: null, to: null };
}

export function parseUserQuery(input: string): ParsedQuery {
  const raw = input;
  const normalized = normalize(input);

  const { from, to } = extractFromTo(normalized);

  const passengers = detectPassengers(normalized);
  const dateIntent = detectDateIntent(normalized);

  const tripType =
    normalized.toLowerCase().includes("return") ||
    normalized.toLowerCase().includes("round trip") ||
    normalized.toLowerCase().includes("roundtrip")
      ? "return"
      : "oneway";

  // v1: we’re not resolving exact dates yet; just intent
  const departDateISO = null;
  const returnDateISO = null;

  // confidence heuristic (v1)
  let confidence = 0.2;
  if (from) confidence += 0.3;
  if (to) confidence += 0.3;
  if (dateIntent) confidence += 0.1;
  if (passengers) confidence += 0.1;

  return {
    raw,
    from,
    to,
    dateIntent,
    departDateISO,
    returnDateISO,
    tripType,
    passengers,
    cabin: null,
    confidence: Math.min(1, confidence),
  };
}
