import type { Flight } from "@/types/flight";
import { mockResults } from "@/data/mockResults";

type PlaceConstraint =
  | { kind: "any" }
  | { kind: "text"; text: string }
  | { kind: "set"; set: string[] };

const ANYWHERE_TERMS = new Set([
  "anywhere",
  "somewhere",
  "any place",
  "anyplace",
  "any city",
  "any country",
  "wherever",
]);

const GROUPS: Record<string, string[]> = {
  europe: ["london", "paris", "milan", "barcelona"],
  asia: ["tokyo", "dubai", "india", "china"],
  usa: ["new york", "los angeles", "miami", "chicago"],

  // countries
  france: ["paris", "nice", "lyon", "marseille"],
  spain: ["barcelona", "madrid", "valencia"],
};

function cleanPlace(raw: string) {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents/diacritics
    .replace(/[.,!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePlaceConstraint(raw?: string): PlaceConstraint {
  if (!raw) return { kind: "any" };

  const v = cleanPlace(raw);

  if (ANYWHERE_TERMS.has(v)) return { kind: "any" };

  // "anywhere in X"
  const m = v.match(
    /^(?:anywhere|somewhere|any place|any city|any country)\s+(?:in|within)\s+(.+)$/,
  );
  if (m) {
    const key = cleanPlace(m[1]);
    if (GROUPS[key]) return { kind: "set", set: GROUPS[key] };
    return { kind: "text", text: key };
  }

  if (GROUPS[v]) return { kind: "set", set: GROUPS[v] };

  return { kind: "text", text: v };
}

function matchesConstraint(field: string, c: PlaceConstraint) {
  const f = cleanPlace(field);
  if (c.kind === "any") return true;
  if (c.kind === "text") return f.includes(c.text);
  return c.set.some((x) => f.includes(x));
}

function parsePrice(price: string): number {
  // "£79" → 79
  return Number(price.replace("£", "").trim());
}

function parseStops(stops: string): number {
  // "Direct" → 0
  // "1 stop" → 1
  // "2 stops" → 2
  const s = stops.toLowerCase().trim();
  if (s.includes("direct")) return 0;

  const match = s.match(/\d+/);
  return match ? Number(match[0]) : 99; // unknown = worst
}

function parseDuration(duration: string): number {
  // "2h 15m", "2h", "45m"
  const d = duration.toLowerCase().trim();

  const h = d.match(/(\d+)\s*h/);
  const m = d.match(/(\d+)\s*m/);

  const hours = h ? Number(h[1]) : 0;
  const mins = m ? Number(m[1]) : 0;

  return hours * 60 + mins;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get("query") || "").trim().toLowerCase();
  let dateIntent: "today" | "tomorrow" | "next_week" | "weekend" | null = null;

  let sortIntent: "cheapest" | "fastest" | "direct" | "balanced" = "balanced";

  if (
    rawQuery.includes("cheap") ||
    rawQuery.includes("cheapest") ||
    rawQuery.includes("lowest")
  ) {
    sortIntent = "cheapest";
  } else if (
    rawQuery.includes("fast") ||
    rawQuery.includes("quick") ||
    rawQuery.includes("shortest")
  ) {
    sortIntent = "fastest";
  } else if (
    rawQuery.includes("direct") ||
    rawQuery.includes("nonstop") ||
    rawQuery.includes("non-stop")
  ) {
    sortIntent = "direct";
  }

  const stopWords = new Set([
    "today",
    "tomorrow",
    "next",
    "week",
    "this",
    "weekend",
    "from",
    "to",
    "flights",
    "flight",
  ]);

  const tokens = rawQuery
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const norm = (s: string) => s.trim().toLowerCase();

  const fieldContains = (field: string, wanted: string) =>
    norm(field).includes(norm(wanted));

  // Extract "from X to Y" OR fallback "X to Y"
  function parseFromTo(q: string): { from?: string; to?: string } | null {
    // "from X to Y"
    const both = q.match(/\bfrom\s+(.+?)\s+to\s+(.+?)\b/i);
    if (both) return { from: both[1].trim(), to: both[2].trim() };

    // "from X"
    const onlyFrom = q.match(/\bfrom\s+(.+?)\b/i);
    if (onlyFrom) return { from: onlyFrom[1].trim() };

    // "X to Y"
    const short = q.match(/\b(.+?)\s+to\s+(.+?)\b/i);
    if (short) return { from: short[1].trim(), to: short[2].trim() };

    // "to Y"
    const onlyTo = q.match(/\bto\s+(.+?)\b/i);
    if (onlyTo) return { to: onlyTo[1].trim() };

    return null;
  }

  if (rawQuery.includes("today")) dateIntent = "today";
  else if (rawQuery.includes("tomorrow")) dateIntent = "tomorrow";
  else if (rawQuery.includes("next week")) dateIntent = "next_week";
  else if (rawQuery.includes("this weekend")) dateIntent = "weekend";

  // if no query, return everything
  if (!rawQuery) {
    const cloned = mockResults.map((f) => ({ ...f }));

    if (cloned.length > 0) {
      cloned[0].tag = "BEST";
      cloned[0].note = "Best overall option";
    }

    return Response.json(cloned);
  }

  // Use rawQuery for intent (cheap/fast... but remove filler for route parsing
  const routeQuery = rawQuery
    .replace(/\bcheap\s+flights?\b/g, "")
    .replace(/\bcheapest\b/g, "")
    .replace(/\bcheapest\s+flights?\b/g, "")
    .replace(/\blowest\b/g, "")
    .replace(/\bflights?\b/g, "")
    .replace(/\bflight\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const route = parseFromTo(routeQuery);

  const filtered = mockResults.filter((flight) => {
    // No route intent → fallback to fuzzy search
    if (!route) {
      const haystack =
        `${flight.airline} ${flight.from} ${flight.to}`.toLowerCase();
      if (tokens.length === 0) return true;
      return tokens.some((token) => haystack.includes(token));
    }

    // Treat missing from/to as "Anywhere"
    const wantsFrom = typeof route.from === "string";
    const wantsTo = typeof route.to === "string";

    const fromConstraint = parsePlaceConstraint(route.from);
    const toConstraint = parsePlaceConstraint(route.to);

    const fromOk = matchesConstraint(flight.from, fromConstraint);
    const toOk = matchesConstraint(flight.to, toConstraint);

    return fromOk && toOk;
  });

  const ranked = filtered
    .map((f) => ({ ...f }))
    .sort((a, b) => {
      if (sortIntent === "fastest") {
        const durDiff = parseDuration(a.duration) - parseDuration(b.duration);
        if (durDiff !== 0) return durDiff;

        const stopsDiff = parseStops(a.stops) - parseStops(b.stops);
        if (stopsDiff !== 0) return stopsDiff;

        return parsePrice(a.price) - parsePrice(b.price);
      }

      if (sortIntent === "direct") {
        const stopsDiff = parseStops(a.stops) - parseStops(b.stops);
        if (stopsDiff !== 0) return stopsDiff;

        const durDiff = parseDuration(a.duration) - parseDuration(b.duration);
        if (durDiff !== 0) return durDiff;

        return parsePrice(a.price) - parsePrice(b.price);
      }

      if (sortIntent === "cheapest") {
        const priceDiff = parsePrice(a.price) - parsePrice(b.price);
        if (priceDiff !== 0) return priceDiff;

        const stopsDiff = parseStops(a.stops) - parseStops(b.stops);
        if (stopsDiff !== 0) return stopsDiff;

        return parseDuration(a.duration) - parseDuration(b.duration);
      }

      // balanced (your original)
      const priceDiff = parsePrice(a.price) - parsePrice(b.price);
      if (priceDiff !== 0) return priceDiff;

      const stopsDiff = parseStops(a.stops) - parseStops(b.stops);
      if (stopsDiff !== 0) return stopsDiff;

      return parseDuration(a.duration) - parseDuration(b.duration);
    });

  if (ranked.length > 0) {
    ranked.forEach((f) => {
      f.tag = undefined;
    });

    // choose “winner” based on intent
    const best = ranked[0];

    if (sortIntent === "cheapest") {
      best.tag = "CHEAPEST";
      best.note = "Cheapest option for your search";
    } else if (sortIntent === "fastest") {
      best.tag = "FASTEST";
      best.note = "Fastest option for your search";
    } else if (sortIntent === "direct") {
      best.tag = "DIRECT";
      best.note = "Best direct option for your search";
    } else {
      best.tag = "BEST";
      best.note = "Best overall balance (price + time + convenience)";
    }
  }

  // (optional) log it for debugging
  console.log({ dateIntent, sortIntent });

  console.log(dateIntent);

  return Response.json(ranked);
}
