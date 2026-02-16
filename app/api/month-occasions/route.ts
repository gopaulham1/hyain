import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Card = {
  id: string;
  title: string;
  meta: string;
  img: string;
  alt: string;
};

// cheap placeholder images (swap for your own)
const IMG_BY_KEY: Record<string, string> = {
  valentines: "/images/valentines.jpg",
  ramadan: "/images/ramadan.jpg",
  easter: "/images/easter.jpg",
  holi: "/images/holi.jpg",
  default: "/images/world.jpg",
};

function monthLabel(d: Date) {
  return d.toLocaleString("en-GB", { month: "short" });
}

function getYearMonthUTC(now = new Date()) {
  return { y: now.getUTCFullYear(), m: now.getUTCMonth() + 1 }; // m = 1..12
}

async function fetchCalendarific(country: string, y: number, m: number) {
  const key = process.env.CALENDARIFIC_API_KEY;
  if (!key) return [];

  const url = new URL("https://calendarific.com/api/v2/holidays");
  url.searchParams.set("api_key", key);
  url.searchParams.set("country", country);
  url.searchParams.set("year", String(y));
  url.searchParams.set("month", String(m));
  // We want non-boring stuff too:
  url.searchParams.set("type", "national,religious,observance");

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.response?.holidays ?? [];
}

export async function GET() {
  const { y, m } = getYearMonthUTC();
  const month = monthLabel(new Date(Date.UTC(y, m - 1, 1)));

  // “Around the world” without calling 230 countries (that would be slow/expensive).
  // We sample big regions. You can tweak this list later.
  const COUNTRIES = ["GB", "US", "AE", "IN", "FR", "BR", "SG"];

  const key = process.env.CALENDARIFIC_API_KEY;
  if (!key) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const results = await Promise.all(
      COUNTRIES.map((c) => fetchCalendarific(c, y, m)),
    );
    const merged = results.flat();

    const seen = new Set<string>();
    const cards: Card[] = [];

    for (const h of merged) {
      const name = String(h?.name || "").trim();
      if (!name) continue;

      // dedupe by name
      const k = name.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);

      const types: string[] = h?.type || [];
      const isRamadan = /ramadan/i.test(name);
      const isValentines = /valentine/i.test(name);

      const img = isValentines
        ? IMG_BY_KEY.valentines
        : isRamadan
          ? IMG_BY_KEY.ramadan
          : IMG_BY_KEY.default;

      cards.push({
        id: `cal-${k.replace(/\s+/g, "-")}`,
        title: name,
        meta: `${month} · Worldwide`,
        img,
        alt: name,
      });

      if (cards.length === 4) break;
    }

    return NextResponse.json(cards, { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
