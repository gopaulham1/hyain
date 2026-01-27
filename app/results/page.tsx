"use client";

import type { Flight } from "../types/flight";
import FlightCard from "../components/FlightCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BuildQueryCard from "../components/BuildQueryCard";
import ResultsSidebar from "../components/results/ResultsSidebar";
import Navbar from "../components/Navbar";
import { parseUserQuery } from "../lib/search/parseUserQuery";
import { buildResultsUrl } from "../lib/search/buildQueryString";

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function getDateRangeFromQuery(q: string): { start: Date; end: Date } | null {
  const query = q.toLowerCase();

  // ✅ A) Relative single-day
  const hasToday = /\btoday\b/.test(query);
  const hasTomorrow = /\btomorrow\b/.test(query);

  const hasThisWeekend = /\bthis\s+weekend\b/.test(query);
  const hasNextWeekend = /\bnext\s+weekend\b/.test(query);

  const hasThisWeek = /\bthis\s+week\b/.test(query);

  // You can expand these phrases later
  const hasNextWeek = /\bnext\s+week\b/.test(query);
  const hasNextMonth = /\bnext\s+month\b/.test(query);

  // Month name (e.g., "march", "april")
  const monthName = Object.keys(MONTHS).find((m) =>
    new RegExp(`\\b${m}\\b`).test(query),
  );

  const now = new Date();

  // Helpers (midnight boundaries)
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

  // 0) today = today 00:00 -> tomorrow 00:00
  if (hasToday) {
    const start = startOfDay(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  // 0b) tomorrow = tomorrow 00:00 -> day after 00:00
  if (hasTomorrow) {
    const start = startOfDay(now);
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  // B) this weekend = upcoming Sat 00:00 -> Mon 00:00
  if (hasThisWeekend) {
    const start = startOfDay(now);
    const day = start.getDay(); // Sun=0, Sat=6
    const daysUntilSat = (6 - day + 7) % 7;
    start.setDate(start.getDate() + daysUntilSat);

    const end = new Date(start);
    end.setDate(end.getDate() + 2); // Monday
    return { start, end };
  }

  // B) next weekend = following Sat 00:00 -> Mon 00:00
  if (hasNextWeekend) {
    const start = startOfDay(now);
    const day = start.getDay();
    const daysUntilNextSat = ((6 - day + 7) % 7) + 7;
    start.setDate(start.getDate() + daysUntilNextSat);

    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    return { start, end };
  }

  // C) this week = today 00:00 -> next Monday 00:00
  if (hasThisWeek) {
    const start = startOfDay(now);

    const end = new Date(start);
    const day = end.getDay(); // Sun=0
    const daysUntilNextMonday = (8 - day) % 7 || 7;
    end.setDate(end.getDate() + daysUntilNextMonday);

    return { start, end };
  }

  // C) next week = next Monday 00:00 -> Monday after that 00:00
  if (hasNextWeek) {
    const start = startOfDay(now);
    const day = start.getDay(); // Sun=0
    const daysUntilNextMonday = (8 - day) % 7 || 7;
    start.setDate(start.getDate() + daysUntilNextMonday);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return { start, end };
  }

  // 2) next month = next calendar month (e.g., Jan -> Feb)
  if (hasNextMonth) {
    const start = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0,
    );
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 1, 0, 0, 0, 0);
    return { start, end };
  }

  // 3) named month = that calendar month (by default: this year)
  if (monthName) {
    const monthIndex = MONTHS[monthName];

    // If user also typed a year like "2026", respect it
    const yearMatch = query.match(/\b(20\d{2})\b/);
    const year = yearMatch ? Number(yearMatch[1]) : now.getFullYear();

    const start = new Date(year, monthIndex, 1, 0, 0, 0, 0);
    const end = new Date(year, monthIndex + 1, 1, 0, 0, 0, 0);
    return { start, end };
  }

  return null;
}

function getDateRangeFromIntent(
  intent: ReturnType<typeof parseUserQuery>["dateIntent"],
): { start: Date; end: Date } | null {
  const now = new Date();

  if (intent === "next_week") {
    const start = new Date(now);
    const end = new Date(now);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }

  if (intent === "next_month") {
    const start = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      0,
      0,
      0,
      0,
    );
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 1, 0, 0, 0, 0);
    return { start, end };
  }

  if (intent === "this_weekend") {
    // Next Saturday 00:00 -> Monday 00:00
    const start = new Date(now);
    const day = start.getDay(); // Sun=0
    const daysUntilSat = (6 - day + 7) % 7;
    start.setDate(start.getDate() + daysUntilSat);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    return { start, end };
  }

  return null;
}

function flightInRange(
  departureTimeISO: string,
  range: { start: Date; end: Date },
) {
  const dep = new Date(departureTimeISO);
  // Keep flights that depart in [start, end)
  return dep >= range.start && dep < range.end;
}

function parsePrice(price: string): number {
  return Number(price.replace("£", "").trim());
}

function parseStops(stops: string): number {
  const s = stops.toLowerCase().trim();
  if (s.includes("direct")) return 0;
  const match = s.match(/\d+/);
  return match ? Number(match[0]) : 99;
}

function parseDuration(duration: string): number {
  const d = duration.toLowerCase().trim();
  const h = d.match(/(\d+)\s*h/);
  const m = d.match(/(\d+)\s*m/);
  const hours = h ? Number(h[1]) : 0;
  const mins = m ? Number(m[1]) : 0;
  return hours * 60 + mins;
}

type SortTab = "best" | "cheapest" | "fastest";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  // Prefer structured params, but keep `query` for backwards compatibility.
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const whenParam = searchParams.get("when");
  const paxParam = searchParams.get("pax");
  const tripParam = searchParams.get("trip");
  const cabinParam = searchParams.get("cabin");

  // Build a readable query string for display + API (until API supports structured params)
  const query = useMemo(() => {
    const fallback = searchParams.get("query") ?? "";
    const parts: string[] = [];

    if (fromParam && toParam) parts.push(`${fromParam} to ${toParam}`);
    else if (fromParam) parts.push(`from ${fromParam}`);
    else if (toParam) parts.push(`to ${toParam}`);

    if (whenParam) parts.push(whenParam.replace(/_/g, " "));
    if (paxParam) parts.push(`for ${paxParam}`);
    if (tripParam === "return") parts.push("return");
    if (cabinParam) parts.push(cabinParam);

    const built = parts.join(" ").trim();

    // ✅ ALWAYS prefer the raw query from the URL if it exists
    return (fallback.trim() ? fallback : built) ?? "";
  }, [
    fromParam,
    toParam,
    whenParam,
    paxParam,
    tripParam,
    cabinParam,
    searchParams,
  ]);

  const parsed = useMemo(() => parseUserQuery(query), [query]);

  // temporary debug
  console.log("PARSED QUERY (results):", parsed);

  const router = useRouter();
  function extractFromTo(q: string): { from?: string; to?: string } {
    const lower = q.toLowerCase();

    // "flights from X to Y" OR "from X to Y"
    const m1 = lower.match(/\bfrom\s+(.+?)\s+to\s+(.+?)(?:\s|$)/i);
    if (m1) return { from: m1[1].trim(), to: m1[2].trim() };

    // "X to Y"
    const m2 = lower.match(/\b(.+?)\s+to\s+(.+?)(?:\s|$)/i);
    if (m2) return { from: m2[1].trim(), to: m2[2].trim() };

    // only "to Y"
    const m3 = lower.match(/\bto\s+(.+?)(?:\s|$)/i);
    if (m3) return { to: m3[1].trim() };

    return {};
  }
  const route = useMemo(() => extractFromTo(query), [query]);

  // This is what the input shows (so user can edit + search again)
  const [queryInput, setQueryInput] = useState<string>("");

  // Keep input in sync when URL query changes (e.g. back/forward)
  // useEffect(() => {
  //   setQueryInput(query);
  // }, [query]);

  // Builder state (same as home)
  const [from, setFrom] = useState("London");
  const [to, setTo] = useState("Anywhere");
  const [when, setWhen] = useState("Any time");
  const [who, setWho] = useState("1 traveler");

  function buildQuery(
    next?: Partial<{ from: string; to: string; when: string; who: string }>,
  ) {
    const f = next?.from ?? from;
    const t = next?.to ?? to;
    const w = next?.when ?? when;
    const p = next?.who ?? who;

    return `Flights from ${f} to ${t} ${w} ${p}`.replace(/\s+/g, " ").trim();
  }

  function submitSearch() {
    if (!queryInput.trim()) return;
    const nextParsed = parseUserQuery(queryInput);
    router.push(buildResultsUrl(nextParsed));
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allResults, setAllResults] = useState<Flight[]>([]);
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [tab, setTab] = useState<SortTab>("best");

  useEffect(() => {
    async function fetchFlights() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/flights?query=${encodeURIComponent(query)}`,
        );
        if (!res.ok) throw new Error("Failed to fetch flights");

        const data = (await res.json()) as Flight[];
        setAllResults(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Could not load flights right now.");
        setLoading(false);
      }
    }

    fetchFlights();
  }, [query]);

  const results = useMemo(() => {
    let cloned = [...allResults];

    // ✅ DATE FILTER (next week / next month / March etc.)
    const range =
      getDateRangeFromIntent(parsed.dateIntent) ?? getDateRangeFromQuery(query);
    if (range) {
      cloned = cloned.filter((f) => flightInRange(f.departureTime, range));
    }

    if (tab === "cheapest") {
      cloned.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
      return cloned;
    }

    if (tab === "fastest") {
      cloned.sort(
        (a, b) => parseDuration(a.duration) - parseDuration(b.duration),
      );
      return cloned;
    }

    // "best" (balanced feel)
    cloned.sort((a, b) => {
      const priceDiff = parsePrice(a.price) - parsePrice(b.price);
      if (priceDiff !== 0) return priceDiff;

      const stopsDiff = parseStops(a.stops) - parseStops(b.stops);
      if (stopsDiff !== 0) return stopsDiff;

      return parseDuration(a.duration) - parseDuration(b.duration);
    });

    return cloned;
  }, [allResults, tab, query]);

  const pillClass = (active: boolean) =>
    [
      "rounded-full px-6 py-3 text-base font-medium transition cursor-pointer select-none",
      "border",
      "active:scale-[0.97]",
      active
        ? "bg-white/90 text-gray-900 border-black/20 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_10px_25px_rgba(0,0,0,0.12)]"
        : "bg-white/40 text-gray-800 border-black/10 hover:bg-white/70 hover:border-black/20",
    ].join(" ");

  return (
    <main className="min-h-screen relative">
      {/* Background image (same approach as home page) */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/0" />

      <div className="w-full px-2 md:px-4 py-8">
        <div className="mx-auto w-[min(1800px,98.5vw)]">
          <Navbar />
          {/* Big glass container */}
          <section className="mt-8 rounded-[28px] p-8 md:p-10 hyain-glass-light-strong">
            {/* HERO SEARCH (same vibe as home, but inside results) */}
            <div className="rounded-[28px] p-8 hyain-glass-light-soft-solid mb-14">
              <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                {/* LEFT SIDE — text + search */}
                <div>
                  <h1 className="hyain-serif text-3xl md:text-5xl font-medium tracking-tight mb-3 text-gray-900">
                    Discover Your Next Journey
                  </h1>

                  <p className="text-base md:text-lg text-gray-700 mb-5">
                    Search flights the easy way
                  </p>

                  {/* Search bar */}
                  <div className="flex flex-col gap-3 w-full">
                    <div className="flex w-full items-center gap-3 rounded-full bg-white/45 border border-black/10 shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl px-3 py-2 md:py-3 transition hover:border-black/20 focus-within:border-black/30 focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_10px_30px_rgba(0,0,0,0.08),0_0_0_3px_rgba(0,0,0,0.10)]">
                      <input
                        type="text"
                        placeholder="e.g. London to Istanbul next weekend"
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            submitSearch();
                          }
                        }}
                        className="flex-1 min-w-0 bg-transparent px-5 py-3 md:py-3 text-base md:text-lg text-gray-900 placeholder-gray-500 focus:outline-none"
                      />

                      <button
                        onClick={submitSearch}
                        className="shrink-0 rounded-full bg-white px-6 py-2.5 md:py-3 text-black font-semibold hover:bg-white/90 transition"
                      >
                        Search
                      </button>
                    </div>
                  </div>
                  {/* Interpreted as (under search bar, above pills) */}
                  <div className="mt-3">
                    <div className="inline-flex flex-wrap items-center gap-2 rounded-xl bg-white/60 px-3 py-2 text-sm backdrop-blur">
                      <span className="text-gray-600">Interpreted as:</span>

                      <span className="font-semibold text-gray-900">
                        {(parsed.from || "Anywhere") +
                          " → " +
                          (parsed.to || "Anywhere")}
                      </span>

                      {parsed.dateIntent && (
                        <span className="text-gray-800">
                          · {parsed.dateIntent.replace(/_/g, " ")}
                        </span>
                      )}

                      {parsed.passengers && (
                        <span className="text-gray-800">
                          · {parsed.passengers} traveler
                          {parsed.passengers === 1 ? "" : "s"}
                        </span>
                      )}

                      {parsed.tripType === "return" && (
                        <span className="text-gray-800">· return</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE — compact search builder */}
                <BuildQueryCard
                  from={from}
                  to={to}
                  when={when}
                  who={who}
                  setFrom={setFrom}
                  setTo={setTo}
                  setWhen={setWhen}
                  setWho={setWho}
                  setQuery={setQueryInput}
                  buildQuery={buildQuery}
                />
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-12">
              {/* LEFT: results */}
              <div className="lg:col-span-7 lg:pr-6">
                {/* Pills */}
                <div className="mt-0 flex flex-wrap gap-3">
                  <button
                    className={pillClass(tab === "best")}
                    onClick={() => setTab("best")}
                  >
                    Best match
                  </button>
                  <button
                    className={pillClass(tab === "cheapest")}
                    onClick={() => setTab("cheapest")}
                  >
                    Cheapest
                  </button>
                  <button
                    className={pillClass(tab === "fastest")}
                    onClick={() => setTab("fastest")}
                  >
                    Fastest
                  </button>
                </div>

                {/* States */}
                {loading && (
                  <p className="mt-6 text-gray-700 animate-pulse">
                    Fetching flights for your search...
                  </p>
                )}

                {error && (
                  <p className="mt-6 text-red-600 font-semibold">{error}</p>
                )}

                {!loading && !error && results.length === 0 && (
                  <p className="mt-6 text-gray-700">
                    No flights found. Try different dates or airports.
                  </p>
                )}

                {/* Flight list */}
                <div className="mt-6 space-y-4 max-h-[62vh] overflow-auto pr-2">
                  {results.map((flight, index) => (
                    <FlightCard
                      key={`${flight.airline}-${flight.from}-${flight.to}-${index}`}
                      flight={flight}
                      selected={selectedAirline === flight.airline}
                      onClick={() => setSelectedAirline(flight.airline)}
                    />
                  ))}
                </div>

                {/* Footer pill like your mock */}
                {!loading && results.length > 0 && (
                  <div className="mt-6 flex justify-center">
                    <div className="rounded-full bg-white/35 border border-black/10 px-5 py-2 text-sm md:text-base text-gray-700 backdrop-blur">
                      {results.length} matches · from{" "}
                      <span className="font-semibold text-gray-900">
                        £{Math.min(...results.map((r) => parsePrice(r.price)))}
                      </span>{" "}
                      ·{" "}
                      <span className="font-semibold text-gray-900">
                        {Math.min(
                          ...results.map((r) => parseDuration(r.duration)),
                        )}
                        m
                      </span>{" "}
                      min · 1 stop max →
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: sidebar */}
              <ResultsSidebar />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
