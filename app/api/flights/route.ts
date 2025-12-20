import type { Flight } from "@/app/types/flight";
import { mockResults } from "@/app/data/mockResults";


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

if (rawQuery.includes("cheap") || rawQuery.includes("cheapest") || rawQuery.includes("lowest")) {
  sortIntent = "cheapest";
} else if (rawQuery.includes("fast") || rawQuery.includes("quick") || rawQuery.includes("shortest")) {
  sortIntent = "fastest";
} else if (rawQuery.includes("direct") || rawQuery.includes("nonstop") || rawQuery.includes("non-stop")) {
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




const filtered = mockResults.filter((flight) => {
  const haystack = `${flight.airline} ${flight.from} ${flight.to}`.toLowerCase();

  // If tokens is empty (e.g., query was only stopwords like "today"), return everything
  if (tokens.length === 0) return true;

  return tokens.some((token) => haystack.includes(token));
});

const ranked = filtered
  .map((f) => ({ ...f })) // ✅ clone objects so tagging is safe
  .sort((a, b) => {

  // Intent-based ordering
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

// ✅ Add tags/notes so the UI can explain "why this result"
if (ranked.length > 0) {
  // reset notes if you want
  ranked.forEach((f) => {
    f.tag = undefined;
    // keep your original note as fallback
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

