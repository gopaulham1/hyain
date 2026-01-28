import type { ParsedQuery } from "./types";

function normalize(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

function detectPassengers(text: string): number | null {
  // A) Explicit numeric cases (highest priority)
  const m =
    text.match(/\bfamily\s+of\s+(\d+)\b/i) ||
    text.match(/\bfor\s+(\d+)\b/i) ||
    text.match(/\b(\d+)\s+(people|pax|passengers|travellers|travelers)\b/i) ||
    text.match(/\bx(\d+)\b/i);

  if (m) {
    const n = Number(m[1]);
    if (Number.isFinite(n) && n > 0 && n < 20) {
      return n;
    }
  }

  // B) Implicit group phrases (minimum guaranteed = 2)
  const implicitGroupPatterns = [
    /\bme\s+and\s+my\s+(wife|husband|partner)\b/i,
    /\bme\s+and\s+my\s+kids?\b/i,
    /\bwe\b/i,
    /\bfamily\b/i,
  ];

  if (implicitGroupPatterns.some((r) => r.test(text))) {
    return 2;
  }

  // C) No signal
  return null;
}

function detectBudget(text: string): {
  max: number;
  currency: "GBP";
} | null {
  const t = text.toLowerCase();

  // under / below / less than £X
  const underMatch =
    t.match(/\b(under|below|less\s+than)\s*£?\s*(\d+)\b/) ||
    t.match(/\b£\s*(\d+)\b/) ||
    t.match(/\b(\d+)\s*(pounds|quid)\b/);

  if (!underMatch) return null;

  const amount = Number(underMatch[2] ?? underMatch[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return {
    max: amount,
    currency: "GBP",
  };
}

function extractFromTo(text: string): {
  from: string | null;
  to: string | null;
} {
  let t = text.toLowerCase().trim();

  t = t.replace(
    /^(i\s*)?(want|wanna|would\s+like|looking|need|plan|trying)\s+to\s+/i,
    "",
  );
  t = t.replace(/^(go|travel|fly)\s+to\s+/i, "");
  t = t.replace(/^book\s+(a\s+)?(flight|flights)\s+(to|for)\s+/i, "");

  // I am gay....not really

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

type VibeKey = "warm" | "beach" | "skiing" | "citybreak" | "nature";

const VIBE_PATTERNS: Array<{ key: VibeKey; patterns: RegExp[] }> = [
  {
    key: "warm",
    patterns: [
      /\b(warm|hot|sunny|heat)\b/i,
      /\b(somewhere|anywhere)\s+(warm|hot|sunny)\b/i,
      /\b(to|with|for)\s+(somewhere|anywhere)\s+(warm|hot|sunny)\b/i,
    ],
  },
  {
    key: "beach",
    patterns: [
      /\b(beach|seaside|coast)\b/i,
      /\b(with|for)\s+(a\s+)?(beach|seaside|coast)\b/i,
      /\b(anywhere|somewhere)\s+(that\s+)?(has|with)\s+(a\s+)?(beach|seaside|coast)\b/i,
    ],
  },
  {
    key: "skiing",
    patterns: [
      /\b(ski|skiing|snow)\b/i,
      /\b(good\s+for|for)\s+ski(ing)?\b/i,
      /\b(somewhere|anywhere)\s+to\s+ski\b/i,
    ],
  },
  {
    key: "citybreak",
    patterns: [
      /\bcity\s*break\b/i,
      /\b(weekend|short)\s*break\b/i,
      /\bfor\s+(a\s+)?(city\s*break|weekend\s*break|short\s*break)\b/i,
    ],
  },
  {
    key: "nature",
    patterns: [
      /\b(nature|mountains?|hiking|lakes?|forest)\b/i,
      /\b(with|for)\s+nature\b/i,
      /\b(anywhere|somewhere)\s+(that\s+)?(has|with)\s+nature\b/i,
    ],
  },
];

function detectVibes(text: string): VibeKey[] {
  const hits: VibeKey[] = [];
  for (const vibe of VIBE_PATTERNS) {
    if (vibe.patterns.some((r) => r.test(text))) {
      hits.push(vibe.key);
    }
  }
  // keep it simple: max 2 vibes
  return hits.slice(0, 2);
}

export function parseUserQuery(input: string): ParsedQuery {
  const raw = input;
  const normalized = normalize(input);
  const { from, to } = extractFromTo(normalized);
  const passengers = detectPassengers(normalized);
  const budget = detectBudget(normalized);
  const vibes = detectVibes(normalized);

  const tripType =
    normalized.toLowerCase().includes("return") ||
    normalized.toLowerCase().includes("round trip") ||
    normalized.toLowerCase().includes("roundtrip")
      ? "return"
      : "oneway";

  const dateIntent = null;
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
    vibes,
    dateIntent,
    departDateISO,
    returnDateISO,
    tripType,
    passengers,
    budget,
    cabin: null,
    confidence: Math.min(1, confidence),
  };
}
