"use client";

import type { Flight } from "../types/flight";
import FlightCard from "../components/FlightCard";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BuildQueryCard from "../components/BuildQueryCard";

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

function SideRow({
  title,
  subtitle,
  meta,
  icon,
  onClick,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left",
        "rounded-2xl px-4 py-3",
        "transition",
        "hover:bg-white/40 active:bg-white/55",
        "flex items-start justify-between gap-4",
      ].join(" ")}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {icon ? <span className="shrink-0">{icon}</span> : null}
          <p className="font-semibold text-gray-900 truncate">{title}</p>
        </div>

        {meta ? <p className="mt-0.5 text-xs text-gray-600">{meta}</p> : null}

        {subtitle ? (
          <p className="mt-1 text-sm text-gray-700">{subtitle}</p>
        ) : null}
      </div>

      {/* Chevron */}
      <svg
        className="mt-1 h-5 w-5 shrink-0 text-gray-600"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.06-1.06l4.24 4.24c.3.3.3.77 0 1.06l-4.24 4.24a.75.75 0 0 1-1.06-.01Z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const router = useRouter();

  // This is what the input shows (so user can edit + search again)
  const [queryInput, setQueryInput] = useState(query);

  // Keep input in sync when URL query changes (e.g. back/forward)
  useEffect(() => {
    setQueryInput(query);
  }, [query]);

  // Builder state (same as home)
  const [from, setFrom] = useState("London");
  const [to, setTo] = useState("Anywhere");
  const [when, setWhen] = useState("Flexible");
  const [who, setWho] = useState("1 traveler");

  function buildQuery(
    next?: Partial<{ from: string; to: string; when: string; who: string }>
  ) {
    const f = next?.from ?? from;
    const t = next?.to ?? to;
    const w = next?.when ?? when;

    return `Flights from ${f} to ${t} ${w}`.replace(/\s+/g, " ").trim();
  }

  function submitSearch() {
    if (!queryInput.trim()) return;
    router.push(`/results?query=${encodeURIComponent(queryInput)}`);
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [allResults, setAllResults] = useState<Flight[]>([]);
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [tab, setTab] = useState<SortTab>("best");

  type VisaUIState = "neutral" | "good" | "warn";

  const [visaState, setVisaState] = useState<VisaUIState>("good");
  // switch to: "neutral" | "warn" to preview other looks

  useEffect(() => {
    async function fetchFlights() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/flights?query=${encodeURIComponent(query)}`
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
    const cloned = [...allResults];

    if (tab === "cheapest") {
      cloned.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
      return cloned;
    }

    if (tab === "fastest") {
      cloned.sort(
        (a, b) => parseDuration(a.duration) - parseDuration(b.duration)
      );
      return cloned;
    }

    // "best" (balanced feel): prefer cheap, then direct, then duration
    cloned.sort((a, b) => {
      const priceDiff = parsePrice(a.price) - parsePrice(b.price);
      if (priceDiff !== 0) return priceDiff;

      const stopsDiff = parseStops(a.stops) - parseStops(b.stops);
      if (stopsDiff !== 0) return stopsDiff;

      return parseDuration(a.duration) - parseDuration(b.duration);
    });

    return cloned;
  }, [allResults, tab]);

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
          {/* Navbar (match home) */}
          <nav className="flex items-center justify-between">
            <Link
              href="/"
              className="hyain-serif text-4xl font-semibold tracking-tight text-gray-900 hover:opacity-80 transition"
            >
              Hyain
            </Link>

            <div className="hidden sm:flex items-center gap-8 text-base md:text-lg text-gray-700">
              <button className="hover:text-gray-900 transition">About</button>
              <button className="hover:text-gray-900 transition">
                ♡ Saved
              </button>
            </div>

            <button className="rounded-full border border-black/10 bg-white/70 px-5 py-2.5 text-base md:text-lg font-semibold text-gray-900 backdrop-blur hover:bg-white/90 transition">
              Sign in
            </button>
          </nav>

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
              <div className="lg:col-span-8">
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
                          ...results.map((r) => parseDuration(r.duration))
                        )}
                        m
                      </span>{" "}
                      min · 1 stop max →
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: sidebar (two separate cards, no overlap) */}
              <aside className="lg:col-span-4 grid gap-6 self-start lg:sticky lg:top-6 lg:pl-2">
                <div className="rounded-[22px] p-6 bg-white/70 border border-white/45 backdrop-blur-m shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_18px_40px_rgba(0,0,0,0.12)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="hyain-serif text-2xl font-semibold text-gray-900">
                        Visa & entry
                      </h2>
                      <p className="mt-1 text-sm text-gray-700">
                        Quick check before you book
                      </p>
                    </div>

                    <span className="rounded-full bg-black/10 border border-black/10 px-3 py-1 text-xs font-semibold text-gray-800">
                      Beta
                    </span>
                  </div>

                  <div className="mt-4 space-y-3 text-gray-800">
                    {/* Status */}
                    {/* Visa status hero */}
                    <div className="rounded-2xl border border-emerald-600/25 bg-emerald-500/12 p-4 backdrop-blur-2xl">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            ✅ Visa-free
                          </p>

                          <p className="mt-1 text-lg font-semibold text-gray-900">
                            90 days visa-free
                          </p>

                          <p className="mt-1 text-sm text-gray-700">
                            UK passport · tourism & business
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-emerald-500/20 border border-emerald-700/25 px-3 py-1 text-xs font-semibold text-emerald-900">
                          OK to enter
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="rounded-full bg-white/50 border border-black/10 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white/70 transition">
                          Change passport →
                        </button>

                        <button className="rounded-full bg-white/25 border border-black/10 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-white/40 transition">
                          Official source →
                        </button>
                      </div>
                    </div>

                    {/* Clickable rows */}
                    {/* Clickable rows */}
                    <div className="mt-3 space-y-2">
                      <SideRow
                        title="Select passport"
                        subtitle="e.g. French, Turkish, UK"
                        icon={<span>🛂</span>}
                        onClick={() => alert("Passport picker later")}
                      />
                      <SideRow
                        title="Official source"
                        subtitle="Embassy / gov travel advice"
                        icon={<span>🔗</span>}
                        onClick={() => alert("Open official source later")}
                      />
                    </div>

                    <p className="text-xs text-gray-600 pt-2 border-t border-black/10">
                      This is guidance, not legal advice. Always confirm with
                      official sources.
                    </p>
                  </div>
                </div>

                <div className="rounded-[22px] p-6 bg-white/70 border border-white/45 backdrop-blur-m shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_18px_40px_rgba(0,0,0,0.12)]">
                  <h2 className="hyain-serif text-2xl font-semibold text-gray-900">
                    Trip Snapshot
                  </h2>

                  <div className="mt-4 space-y-2 text-gray-800">
                    <SideRow
                      title="Cannes Film Festival"
                      meta="May 14 – May 25"
                      subtitle="Official screenings • tickets • day trips"
                      icon={<span>🌍</span>}
                      onClick={() => alert("Open Cannes panel")}
                    />

                    <SideRow
                      title="Art exhibits close early"
                      subtitle="Louvre & Musée d’Orsay close at 5pm"
                      icon={<span>⚠️</span>}
                      onClick={() => alert("Open museum passes")}
                    />

                    <SideRow
                      title="Skip-the-line museum passes"
                      subtitle="Popular slots sell out quickly"
                      icon={<span>🎟️</span>}
                      onClick={() => alert("Open tickets")}
                    />
                  </div>
                </div>

                <div className="rounded-[22px] p-6 bg-white/70 border border-white/45 backdrop-blur-m shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_18px_40px_rgba(0,0,0,0.12)]">
                  <h2 className="hyain-serif text-2xl font-semibold text-gray-900">
                    Travel tips
                  </h2>

                  <div className="mt-4 space-y-2 text-gray-800">
                    <SideRow
                      title="Hotels are up this weekend"
                      subtitle="Popular areas selling out faster"
                      icon={<span>⚠️</span>}
                      onClick={() => alert("Open hotel insight")}
                    />

                    <SideRow
                      title="Seine River Dinner Cruise"
                      subtitle="Romantic boat tour • view tickets"
                      icon={<span>🎵</span>}
                      onClick={() => alert("Open cruise tickets")}
                    />

                    <SideRow
                      title="Airport transfer tip"
                      subtitle="Late arrivals? Pre-book to avoid surge pricing"
                      icon={<span>🚕</span>}
                      onClick={() => alert("Open transfer options")}
                    />
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
