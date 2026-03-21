"use client";

import type { Flight } from "../types/flight";
import FlightCard from "../components/FlightCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BuildQueryCard from "../components/BuildQueryCard";
import ResultsSidebar from "../components/results/ResultsSidebar";
import Navbar from "../components/Navbar";
import { parseUserQuery } from "../lib/search/parseUserQuery";
import { buildResultsUrl } from "../lib/search/buildQueryString";
import {
  getMonthLabelFromQuery,
  getEndOfMonthLabelFromQuery,
  getDateRangeFromQuery,
  getRelativeDateLabelFromQuery,
} from "../lib/results/dateQuery";

const VIBE_SUGGESTIONS: Record<
  "warm" | "beach" | "skiing" | "citybreak" | "nature" | "romantic",
  string[]
> = {
  warm: ["Marrakech", "Tenerife", "Dubai", "Athens", "Malta", "Lisbon"],
  beach: ["Palma", "Tenerife", "Nice", "Split", "Algarve", "Ibiza"],
  skiing: ["Geneva", "Innsbruck", "Milan", "Sofia", "Salzburg", "Zurich"],
  citybreak: ["Paris", "Rome", "Barcelona", "Prague", "Amsterdam", "Vienna"],
  nature: [
    "Reykjavik",
    "Bergen",
    "Madeira",
    "Edinburgh",
    "Ljubljana",
    "Tbilisi",
  ],
  romantic: [
    "Paris",
    "Florence",
    "Venice",
    "Rome",
    "Santorini",
    "Prague",
    "Vienna",
    "Bruges",
  ],
};

function vibeToQueryPhrase(v: string) {
  switch (v) {
    case "warm":
      return "warm";
    case "romantic":
      return "romantic";
    case "beach":
      return "with a beach";
    case "skiing":
      return "for skiing";
    case "citybreak":
      return "for a city break";
    case "nature":
      return "with nature";
    default:
      return v;
  }
}

function buildSuggestedQuery(
  base: { from: string | null },
  destination: string,
  vibe?: string,
) {
  const fromPart = base.from
    ? `${base.from} to ${destination}`
    : `to ${destination}`;
  const vibePart = vibe ? ` ${vibeToQueryPhrase(vibe)}` : "";
  return `${fromPart}${vibePart}`.replace(/\s+/g, " ").trim();
}

function stripPassengers(text: string) {
  return text
    .replace(
      /\b\d+\s*(traveler|travellers|travelers|people|pax|passengers)\b/gi,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function vibeLabel(v: string) {
  switch (v) {
    case "warm":
      return "Warm";
    case "Romantic":
      return "Romantic";
    case "beach":
      return "Beach";
    case "skiing":
      return "Skiing";
    case "citybreak":
      return "City break";
    case "nature":
      return "Nature";
    default:
      return v;
  }
}

function vibePill(text: string) {
  return (
    <span className="rounded-full bg-white/50 border border-black/10 px-2.5 py-1 text-gray-800">
      {text}
    </span>
  );
}

function titleCasePlace(name: string) {
  if (!name) return name;
  if (name.toLowerCase() === "anywhere") return "Anywhere";

  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getDateRangeFromIntent(
  intent: ReturnType<typeof parseUserQuery>["dateIntent"],
): { start: Date; end: Date } | null {
  const now = new Date();

  if (!intent) return null;

  if (intent === "month" || intent === "range" || intent === "date")
    return null;

  if (intent === "today") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (intent === "tomorrow") {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    t.setHours(0, 0, 0, 0);
    const end = new Date(t);
    end.setHours(23, 59, 59, 999);
    return { start: t, end };
  }

  const addDays = (d: Date, days: number) => {
    const x = new Date(d);
    x.setDate(x.getDate() + days);
    return x;
  };

  if (intent === "this_week") {
    const start = new Date(now);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day; // monday
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    const end = addDays(start, 7);
    return { start, end };
  }

  if (intent === "next_week") {
    const base = addDays(now, 7);
    const start = new Date(base);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);

    const end = addDays(start, 7);
    return { start, end };
  }

  if (intent === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
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

  if (intent === "this_weekend" || intent === "next_weekend") {
    const base = intent === "next_weekend" ? addDays(now, 7) : now;

    const start = new Date(base);
    const day = start.getDay();
    const daysUntilSat = (6 - day + 7) % 7;
    start.setDate(start.getDate() + daysUntilSat);
    start.setHours(0, 0, 0, 0);

    const end = addDays(start, 2);
    return { start, end };
  }

  return null;
}

function flightInRange(
  departureTimeISO: string,
  range: { start: Date; end: Date },
) {
  const dep = new Date(departureTimeISO);
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

type DayFilter = "weekend" | "weekday";

function getDayFilterFromQuery(q: string): DayFilter | null {
  const s = q.toLowerCase();

  const explicitlyOnly =
    /\bonly\s+weekends?\b/.test(s) || /\bweekends?\s+only\b/.test(s);

  if (/\b(this|next)\s+weekend\b/.test(s) && !explicitlyOnly) {
    return null;
  }

  // Weekend only phrases
  const wantsWeekend =
    /\bonly\s+weekends?\b/.test(s) ||
    /\bweekends?\s+only\b/.test(s) ||
    /\bonly\s+weekend\b/.test(s);

  // Weekday only phrases
  const wantsWeekday =
    /\bonly\s+weekdays?\b/.test(s) ||
    /\bweekdays?\s+only\b/.test(s) ||
    /\bonly\s+weekday\b/.test(s);

  if (wantsWeekend) return "weekend";
  if (wantsWeekday) return "weekday";

  return null;
}

function isWeekendISO(departureTimeISO: string) {
  const d = new Date(departureTimeISO);
  const day = d.getDay(); // Sun=0 ... Sat=6
  return day === 0 || day === 6;
}

type SortTab = "best" | "cheapest" | "fastest";

export default function ResultsPageClient() {
  const searchParams = useSearchParams();

  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const whenParam = searchParams.get("when");
  const paxParam = searchParams.get("pax");
  const tripParam = searchParams.get("trip");
  const cabinParam = searchParams.get("cabin");

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

    return (fallback || built).trim();
  }, [
    fromParam,
    toParam,
    whenParam,
    paxParam,
    tripParam,
    cabinParam,
    searchParams,
  ]);

  const displayQueryInput = useMemo(() => {
    const q = (query ?? "").trim();

    if (/^to\s+\S+/i.test(q) && !/\bfrom\b/i.test(q)) {
      return `Anywhere ${q}`.replace(/\s+/g, " ").trim();
    }

    return q;
  }, [query]);

  const parsed = useMemo(() => parseUserQuery(query), [query]);

  const hasAnyVibe = (parsed.vibes ?? []).length > 0;

  const hasDestination =
    !!parsed.to && parsed.to.trim().toLowerCase() !== "anywhere";

  const needsDestinationPick = hasAnyVibe && !hasDestination;

  const suggestions = useMemo(() => {
    const vibe = parsed.vibes?.[0] as
      | "warm"
      | "beach"
      | "skiing"
      | "citybreak"
      | "nature"
      | "romantic"
      | undefined;

    if (!vibe) return [];

    const toIsAnywhere =
      !parsed.to || parsed.to.trim().toLowerCase() === "anywhere";

    if (!toIsAnywhere) return [];

    return VIBE_SUGGESTIONS[vibe] ?? [];
  }, [parsed.to, parsed.vibes]);

  const monthLabel = useMemo(() => getMonthLabelFromQuery(query), [query]);
  const relativeDateLabel = useMemo(
    () => getRelativeDateLabelFromQuery(query),
    [query],
  );

  const endOfMonthLabel = useMemo(
    () => getEndOfMonthLabelFromQuery(query),
    [query],
  );

  const dayFilter = useMemo(() => getDayFilterFromQuery(query), [query]);

  const dateLabel = useMemo(() => {
    if (relativeDateLabel) {
      return relativeDateLabel
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }

    if (parsed.dateIntent) {
      return parsed.dateIntent
        .replace(/_/g, " ")
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }

    if (endOfMonthLabel) {
      return endOfMonthLabel;
    }

    if (monthLabel) {
      return monthLabel; // ✅ no "in"
    }

    return null;
  }, [relativeDateLabel, parsed.dateIntent, endOfMonthLabel, monthLabel]);

  const displayRoute = useMemo(() => {
    const rawFrom = parsed.from ?? "Anywhere";
    const rawTo = parsed.to ?? "Anywhere";

    const cleanPlace = (s: string) => {
      return (
        s
          // remove day filters
          .replace(/\b(only\s+)?weekends?\b/gi, "")
          .replace(/\b(only\s+)?weekdays?\b/gi, "")
          .replace(/\bweekend\s+only\b/gi, "")
          .replace(/\bweekday\s+only\b/gi, "")

          // remove common time words
          .replace(/\b(today|tomorrow)\b/gi, "")
          .replace(/\b(this|next)\s+week(end)?\b/gi, "")
          .replace(/\bnext\s+month\b/gi, "")

          // remove month names (March, April, etc.)
          .replace(
            /\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(tember)?|oct(ober)?|nov(ember)?|dec(ember)?)\b/gi,
            "",
          )
          // remove vibe words/phrases so destination doesn't become "Dubai warm"
          .replace(/\bwarm\b/gi, "")
          .replace(/\bromantic\b/gi, "")
          .replace(/\bwith\s+a\s+beach\b/gi, "")
          .replace(/\bfor\s+ski(ing)?\b/gi, "")
          .replace(/\bski(ing)?\b/gi, "")
          .replace(/\bfor\s+a\s+city\s+break\b/gi, "")
          .replace(/\bcity\s+break\b/gi, "")
          .replace(/\bwith\s+nature\b/gi, "")

          // remove budget bits
          .replace(/\bunder\s*£?\s*\d+\b/gi, "")
          .replace(/\bunder\s+\d+\s*(quid|pounds?)\b/gi, "")

          // remove pax bits
          .replace(/\bfor\s+\d+\b/gi, "")
          .replace(
            /\b\d+\s*(people|pax|passengers?|travellers?|travelers?)\b/gi,
            "",
          )

          // remove "for me / for me and my wife" style pax phrases
          .replace(/\bfor\s+me\b/gi, "")
          .replace(
            /\bfor\s+me\s+(and|&)\s+(my\s+)?(wife|husband|partner)\b/gi,
            "",
          )
          .replace(/\b(and|&)\s+(my\s+)?(wife|husband|partner)\b/gi, "")

          // remove lonely leftovers
          .replace(/\bonly\b/gi, "")
          .replace(/\b(pounds?|quid)\b/gi, "")

          // tidy
          .replace(/\s+/g, " ")
          .replace(/\bto\s+to\b/gi, "to")
          .trim()
      );
    };

    const from = cleanPlace(rawFrom) || "Anywhere";
    const to = cleanPlace(rawTo) || "Anywhere";

    return {
      from: titleCasePlace(from),
      to: titleCasePlace(to),
    };
  }, [parsed.from, parsed.to]);

  const router = useRouter();

  const [queryInput, setQueryInput] = useState<string>(query);

  useEffect(() => {
    setQueryInput(displayQueryInput);
  }, [displayQueryInput]);

  useEffect(() => {
    setFrom(displayRoute.from);
    setTo(displayRoute.to);

    if (dateLabel) setWhen(dateLabel);
    else setWhen("Any time");

    const pax = parsed.passengers ?? 1;
    setWho(`${pax} traveler${pax === 1 ? "" : "s"}`);
  }, [displayRoute, dateLabel, parsed.passengers]);

  const [from, setFrom] = useState("London");
  const [to, setTo] = useState("Anywhere");
  const [when, setWhen] = useState("Any time");
  const [who, setWho] = useState("1 traveler");

  function buildQuery(
    next?: Partial<{ from: string; to: string; when: string; who: string }>,
  ) {
    const fRaw = next?.from ?? from;
    const tRaw = next?.to ?? to;
    const w = next?.when ?? when;
    const p = next?.who ?? who;

    const f = stripPassengers(fRaw);
    const t = stripPassengers(tRaw);

    const currentParsed = parseUserQuery(queryInput);
    const budgetTail =
      currentParsed.budget?.max != null
        ? ` under £${currentParsed.budget.max}`
        : "";

    const currentDayFilter = getDayFilterFromQuery(queryInput);
    const dayTail =
      currentDayFilter === "weekend"
        ? " only weekends"
        : currentDayFilter === "weekday"
          ? " only weekdays"
          : "";

    const routePart =
      f && f !== "Anywhere" ? `${f} to ${t}` : `Anywhere to ${t}`;

    const whenPart = w && w !== "Any time" ? ` ${w}` : "";
    const whoPart = p ? ` ${p}` : "";

    return `${routePart}${whenPart}${budgetTail}${dayTail}${whoPart}`
      .replace(/\s+/g, " ")
      .trim();
  }

  async function submitSearch() {
    if (!queryInput.trim()) return;

    try {
      const res = await fetch(
        `/api/interpret?query=${encodeURIComponent(queryInput)}`,
      );

      if (!res.ok) {
        throw new Error("Failed to interpret query");
      }

      const data = await res.json();

      console.log("🧭 INTERPRET RESPONSE (RESULTS PAGE):", data);

      router.push(buildResultsUrl(data.parsed));
    } catch (err) {
      console.error("Interpret failed on results page:", err);

      const fallbackParsed = parseUserQuery(queryInput);
      router.push(buildResultsUrl(fallbackParsed));
    }
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allResults, setAllResults] = useState<Flight[]>([]);
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [tab, setTab] = useState<SortTab>("best");

  useEffect(() => {
    if (needsDestinationPick) {
      setAllResults([]);
      setError(null);
      setLoading(false);
      return;
    }

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
  }, [query, needsDestinationPick]);

  const results = useMemo(() => {
    let cloned = [...allResults];

    const range =
      getDateRangeFromIntent(parsed.dateIntent) ?? getDateRangeFromQuery(query);
    if (range) {
      cloned = cloned.filter((f) => flightInRange(f.departureTime, range));
    }

    const dayFilter = getDayFilterFromQuery(query);
    if (dayFilter) {
      cloned = cloned.filter((f) => {
        const weekend = isWeekendISO(f.departureTime);
        return dayFilter === "weekend" ? weekend : !weekend;
      });
    }

    if (parsed.budget?.max != null) {
      cloned = cloned.filter((f) => {
        const priceNum = parsePrice(f.price);
        return Number.isFinite(priceNum) && priceNum <= parsed.budget!.max;
      });
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
                  <div className="mt-3">
                    <div className="inline-flex flex-wrap items-center gap-2 rounded-xl bg-white/60 px-3 py-2 text-sm backdrop-blur">
                      <span className="text-gray-600">Interpreted as:</span>

                      <span className="font-semibold text-gray-900">
                        {displayRoute.from} → {displayRoute.to}
                      </span>

                      {parsed.vibes?.length > 0 && (
                        <>
                          <span className="text-gray-800">·</span>
                          <span className="text-gray-700">Vibe:</span>
                          {parsed.vibes.map((v) => (
                            <span key={v}>{vibePill(vibeLabel(v))}</span>
                          ))}
                        </>
                      )}

                      {dateLabel && (
                        <span className="text-gray-800">· {dateLabel}</span>
                      )}

                      {dayFilter === "weekend" && (
                        <span className="text-gray-800">· weekends only</span>
                      )}
                      {dayFilter === "weekday" && (
                        <span className="text-gray-800">· weekdays only</span>
                      )}

                      {parsed.budget?.max != null && (
                        <span className="text-gray-800">
                          · under £{parsed.budget.max}
                        </span>
                      )}

                      {parsed.passengers != null && (
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

                  {suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                      <span className="text-gray-600">Try:</span>

                      {suggestions.slice(0, 6).map((dest) => {
                        const vibe = parsed.vibes?.[0];
                        const q = buildSuggestedQuery(
                          { from: parsed.from },
                          dest,
                          vibe ?? undefined,
                        );

                        return (
                          <button
                            key={dest}
                            onClick={() => {
                              const cleanFrom = displayRoute.from;
                              const hasRealFrom =
                                cleanFrom && cleanFrom !== "Anywhere";

                              const max = parsed.budget?.max;
                              const budgetTail =
                                max != null ? ` under £${max}` : "";

                              const whenTail = dateLabel ? ` ${dateLabel}` : "";

                              const dayTail =
                                dayFilter === "weekend"
                                  ? " only weekends"
                                  : dayFilter === "weekday"
                                    ? " only weekdays"
                                    : "";

                              const base = hasRealFrom
                                ? `${cleanFrom} to ${dest}`
                                : `to ${dest}`;

                              const paxTail =
                                parsed.passengers != null
                                  ? ` for ${parsed.passengers} traveler${parsed.passengers === 1 ? "" : "s"}`
                                  : "";

                              const tripTail =
                                parsed.tripType === "return" ? " return" : "";

                              const nextQuery =
                                `${base}${budgetTail}${whenTail}${dayTail}${paxTail}${tripTail}`
                                  .replace(/\s+/g, " ")
                                  .trim();

                              setQueryInput(nextQuery);
                              if (hasRealFrom) setFrom(cleanFrom);
                              setTo(dest);

                              router.push(
                                buildResultsUrl(parseUserQuery(nextQuery)),
                              );
                            }}
                            className="rounded-full bg-white/50 border border-black/10 px-3 py-1.5 text-gray-900 hover:bg-white/70 transition"
                          >
                            {dest}
                          </button>
                        );
                      })}
                    </div>
                  )}
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

                {needsDestinationPick && (
                  <div className="mt-6 rounded-2xl border border-black/10 bg-white/40 px-5 py-4 backdrop-blur">
                    <div className="font-semibold text-gray-900">
                      Pick a destination 👇
                    </div>
                    <div className="text-gray-700 mt-1">
                      Choose one of the suggestions above (or type a destination
                      like “to Dubai”).
                    </div>
                  </div>
                )}

                {error && (
                  <p className="mt-6 text-red-600 font-semibold">{error}</p>
                )}

                {!needsDestinationPick &&
                  !loading &&
                  !error &&
                  results.length === 0 && (
                    <p className="mt-6 text-gray-700">
                      No flights found. Try different dates or airports.
                    </p>
                  )}

                {/* Flight list */}
                {!needsDestinationPick && (
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
                )}

                {!needsDestinationPick && !loading && results.length > 0 && (
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
              <ResultsSidebar
                fromCity={displayRoute.from}
                toCity={displayRoute.to}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
