import type { ParsedQuery } from "./types";
import { parseWhen } from "./parseWhen";
import { parseAvailability } from "./parseAvailability";

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

function extractFromTo(text: string): {
  from: string | null;
  to: string | null;
} {
  // Goal:
  // - avoid parsing "i want to go" as "i want -> go"
  // - prefer "from X" even if destination is vague ("somewhere", "anywhere")
  // - keep parsing simple + deterministic

  let t = text.toLowerCase().trim();

  // Remove common filler prefixes that include "to"
  // so the first "to" isn't treated as route delimiter.
  t = t.replace(
    /^(i\s*)?(want|wanna|would\s+like|looking|need|plan|trying)\s+to\s+/i,
    "",
  );
  t = t.replace(/^(go|travel|fly)\s+to\s+/i, "");
  t = t.replace(/^book\s+(a\s+)?(flight|flights)\s+(to|for)\s+/i, "");

  // Helper: clean "place-like" strings
  const cleanPlace = (s: string) => {
    const x = s
      .trim()
      // cut trailing punctuation
      .replace(/[.,!?]+$/g, "")
      // collapse spaces
      .replace(/\s+/g, " ")
      .trim();

    if (!x) return null;

    // treat vague destinations as "Anywhere"
    const lowered = x.toLowerCase();

    // keep "anywhere in france / europe"
    if (
      lowered.startsWith("anywhere in ") ||
      lowered.startsWith("somewhere in ") ||
      lowered.startsWith("any place in ")
    ) {
      return x;
    }

    // pure vague → means no constraint
    if (["anywhere", "somewhere", "any place", "anyplace"].includes(lowered)) {
      return null;
    }

    // don't allow single filler words as places
    if (["go", "travel", "fly"].includes(x)) return null;

    return x;
  };

  // 1) Arrow form: "london -> paris"
  const arrow = t.match(/\b(.+?)\s*(?:->|→)\s*(.+?)(?=$|\s)/);
  if (arrow) return { from: cleanPlace(arrow[1]), to: cleanPlace(arrow[2]) };

  // 2) Strong form: "from london to paris"
  const fromTo = t.match(/\bfrom\s+(.+?)\s+to\s+(.+?)(?=$|\s)/);
  if (fromTo) return { from: cleanPlace(fromTo[1]), to: cleanPlace(fromTo[2]) };

  // 3) "from X" alone (very common): "… from london"
  // 3) Simple form first: "london to paris"
  // Stop destination capture before time/constraint words ("next", "month", etc.)
  const simpleTo = t.match(
    /\b(.+?)\s+to\s+(.+?)(?=\s+\b(from|next|this|in|on|at|tomorrow|today|week|month|flexible|anytime|return|round|cheapest|fastest|best|direct)\b|$)/,
  );

  if (simpleTo) {
    const left = cleanPlace(simpleTo[1]);
    const right = cleanPlace(simpleTo[2]);

    // Guard: block bad left phrases
    const badLeft = [
      "i want",
      "want",
      "wanna",
      "would like",
      "looking",
      "need",
    ];
    if (left && badLeft.some((p) => left.startsWith(p))) {
      return { from: null, to: right };
    }

    // If left looks like a real origin, prefer it
    if (left || right) return { from: left, to: right };
  }

  // 4) "from X" alone
  const fromOnly = t.match(
    /\bfrom\s+(.+?)(?=\s+\b(next|this|in|on|at|tomorrow|today|week|month|flexible|anytime|return|round|cheapest|fastest|best|direct)\b|$)/,
  );

  // 5) "to Y" alone
  // Only treat as destination-only if the phrase starts with "to ..."
  // This prevents "london to paris" being treated as just "to paris".
  const toOnly = t.trim().startsWith("to ")
    ? t.match(
        /\bto\s+(.+?)(?=\s+\b(from|next|this|in|on|at|tomorrow|today|week|month|flexible|anytime|return|round|cheapest|fastest|best|direct)\b|$)/,
      )
    : null;

  const from = fromOnly ? cleanPlace(fromOnly[1]) : null;
  const to = toOnly ? cleanPlace(toOnly[1]) : null;

  if (from || to) return { from, to };

  return { from: null, to: null };
}

export function parseUserQuery(input: string): ParsedQuery {
  const raw = input;
  const normalized = normalize(input);

  const { from, to } = extractFromTo(normalized);

  const passengers = detectPassengers(normalized);

  const tripType =
    normalized.toLowerCase().includes("return") ||
    normalized.toLowerCase().includes("round trip") ||
    normalized.toLowerCase().includes("roundtrip")
      ? "return"
      : "oneway";

  const whenParsed = parseWhen(normalized);
  const dateIntent = whenParsed?.dateIntent ?? null;
  const departDateISO = whenParsed?.departDateISO ?? null;
  const returnDateISO = whenParsed?.returnDateISO ?? null;
  const whenText = whenParsed?.rawMatch ?? null;
  const availability = parseAvailability(normalized);

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
    availability,
    confidence: Math.min(1, confidence),
  };
}
