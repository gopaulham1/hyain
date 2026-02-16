// app/api/whats-on-soon/route.ts
import { NextResponse } from "next/server";
import { CITY_IMAGES } from "@/data/cityImages";

export const dynamic = "force-dynamic";

type Card = {
  id: string;
  title: string;
  meta: string;
  img: string;
  alt: string;
};

const FALLBACK: Card[] = [
  {
    id: "fallback-1",
    title: "Live Music Night",
    meta: "Feb · London",
    img: "/images/london2.jpg",
    alt: "London",
  },
  {
    id: "fallback-2",
    title: "Art Exhibition",
    meta: "Feb · Paris",
    img: "/images/paris.jpg",
    alt: "Paris",
  },
  {
    id: "fallback-3",
    title: "Food Festival",
    meta: "Feb · Rome",
    img: "/images/rome.jpg",
    alt: "Rome",
  },
];

function monthLabel(d: Date) {
  return d.toLocaleString("en-GB", { month: "short" });
}

function firstAndLastDayUTC(now = new Date()) {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59));
  return { start, end };
}

function toTicketmasterDate(d: Date) {
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function isEnglishishTitle(s: string) {
  // strict + simple: only allow basic ASCII characters
  // (this will drop German umlauts, accents, Cyrillic, etc)
  return /^[\x00-\x7F]+$/.test(s);
}

function cleanTitle(raw: string) {
  let t = raw.trim();

  // remove bracket tags like [VIP], (18+), etc.
  t = t.replace(/^\s*[\[\(].*?[\]\)]\s*/g, "");

  // nuke common promo tails
  t = t.replace(/\b(entry|tickets?)\b.*$/i, "");
  t = t.replace(
    /\b(guest\s*list|free\s*drink|drink\s*deal|ladies\s*night)\b.*$/i,
    "",
  );

  // collapse whitespace + too many !!!!
  t = t.replace(/\s{2,}/g, " ").replace(/!{2,}/g, "!");

  return t.trim();
}

function isCrapEvent(rawTitle: string) {
  // hard block list
  return /(entry\s+to\s+all|guest\s*list|free\s*drink|drink\s*deal|package|vip\s*table|bottle\s*service|open\s*bar|karaoke|happy\s*hour|ladies\s*night)/i.test(
    rawTitle,
  );
}

function segmentScore(e: any) {
  const seg = (e?.classifications?.[0]?.segment?.name || "").toLowerCase();
  // you already filter these segments in your current file:contentReference[oaicite:3]{index=3}
  if (seg === "music") return 3;
  if (seg === "arts & theatre") return 2;
  if (seg === "sports") return 1;
  return 0;
}

async function fetchTicketmaster(params: Record<string, string>) {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) return [];

  const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
  url.searchParams.set("apikey", key);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 * 60 * 6 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data?._embedded?.events ?? [];
}

function toCard(e: any, month: string): Card | null {
  const id = e?.id;
  const rawTitle = e?.name?.trim();
  if (!id || !rawTitle) return null;

  // keep only decent categories (your current approach):contentReference[oaicite:4]{index=4}
  const seg = (e?.classifications?.[0]?.segment?.name || "").toLowerCase();
  if (!(seg === "music" || seg === "sports" || seg === "arts & theatre"))
    return null;

  if (isCrapEvent(rawTitle)) return null;

  const title = cleanTitle(rawTitle);
  if (!title || title.length < 6) return null;

  // drop non-English-looking titles
  if (!isEnglishishTitle(title)) return null;

  if (/row\s+[a-z]\b/i.test(title)) return null;
  if (/section\s+\d+/i.test(title)) return null;

  const venue = e?._embedded?.venues?.[0];
  const city = venue?.city?.name;
  const country = venue?.country?.countryCode || venue?.country?.name || "";
  if (!city) return null;

  console.log("CITY FROM API:", city);

  // only use YOUR curated city images
  const cityKey = city.toLowerCase();
  const img = CITY_IMAGES[cityKey] ?? "/images/world.jpg";

  const meta = `${month} · ${city}${country ? `, ${country}` : ""}`;
  return { id, title, meta, img, alt: title };
}

export async function GET() {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) return NextResponse.json(FALLBACK, { status: 200 });

  const { start, end } = firstAndLastDayUTC();
  const startDateTime = toTicketmasterDate(start);
  const endDateTime = toTicketmasterDate(end);
  const month = monthLabel(start);

  // Europe + Middle East-ish
  const COUNTRIES = [
    "GB",
    "FR",
    "DE",
    "NL",
    "ES",
    "IT",
    "PT",
    "IE",
    "BE",
    "CH",
    "AT",
    "SE",
    "NO",
    "DK",
    "FI",
    "PL",
    "CZ",
    "HU",
    "GR",
    "RO",
    "TR",
    "AE",
  ];

  try {
    // Pull more than you need, then we’ll pick the “best 3”
    const batches = await Promise.all(
      COUNTRIES.map((cc) =>
        fetchTicketmaster({
          startDateTime,
          endDateTime,
          size: "20",
          sort: "date,asc",
          countryCode: cc,
        }),
      ),
    );

    const merged = batches.flat();

    // score + convert
    const scored = merged
      .map((e) => ({ e, score: segmentScore(e) }))
      .sort((a, b) => b.score - a.score);

    const seen = new Set<string>();
    const usedCities = new Set<string>();
    const usedCountries = new Set<string>();
    const cards: Card[] = [];

    for (const { e } of scored) {
      const c = toCard(e, month);
      if (!c) continue;

      // dedupe (your current logic does this):contentReference[oaicite:5]{index=5}
      const dupeKey = `${c.title.toLowerCase()}|${c.meta.toLowerCase()}`;
      if (seen.has(dupeKey)) continue;
      seen.add(dupeKey);

      // make results feel “varied” (avoid 3 events in the same city)
      const cityKey =
        c.meta.split("·")[1]?.trim().split(",")[0]?.toLowerCase() || "";
      if (cityKey && usedCities.has(cityKey)) continue;
      if (cityKey) usedCities.add(cityKey);

      const countryCode = c.meta.split(",")[1]?.trim().toUpperCase() || "";

      if (countryCode && usedCountries.has(countryCode)) continue;
      if (countryCode) usedCountries.add(countryCode);

      cards.push(c);
      if (cards.length === 3) break;
    }

    return NextResponse.json(cards.length ? cards : FALLBACK, { status: 200 });
  } catch {
    return NextResponse.json(FALLBACK, { status: 200 });
  }
}
