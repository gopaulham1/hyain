// app/api/whats-on-soon/route.ts
import { NextResponse } from "next/server";

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
    id: "fallback-carnival",
    title: "Carnival",
    meta: "Feb · Rio",
    img: "/images/rio3.jpg",
    alt: "Rio de Janeiro",
  },
  {
    id: "fallback-cherry-blossoms",
    title: "Cherry Blossoms",
    meta: "Mar – Apr · Tokyo",
    img: "/images/tokyo2.jpg",
    alt: "Cherry Blossoms",
  },
  {
    id: "fallback-winter-wonderland",
    title: "Winter Wonderland",
    meta: "Nov – Jan · London",
    img: "/images/london2.jpg",
    alt: "London",
  },
  {
    id: "fallback-christmas-markets",
    title: "Christmas Markets",
    meta: "Nov - Dec · Prague",
    img: "/images/prague.jpg",
    alt: "Prague",
  },
];

function monthLabel(d: Date) {
  return d.toLocaleString("en-GB", { month: "short" }); // Feb, Mar, etc.
}

function firstAndLastDayUTC(now = new Date()) {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0-11
  const start = new Date(Date.UTC(y, m, 1, 0, 0, 0));
  const end = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59)); // last day of month
  return { start, end };
}

function toTicketmasterDate(d: Date) {
  // Ticketmaster wants: YYYY-MM-DDTHH:mm:ssZ (no milliseconds)
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

export async function GET() {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) {
    // No key = don't break the UI
    return NextResponse.json(FALLBACK, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }

  const { start, end } = firstAndLastDayUTC();
  const startDateTime = toTicketmasterDate(start);
  const endDateTime = toTicketmasterDate(end);

  // Global query (we can refine categories later)
  const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
  url.searchParams.set("apikey", key);
  url.searchParams.set("startDateTime", startDateTime);
  url.searchParams.set("endDateTime", endDateTime);
  url.searchParams.set("size", "24");
  url.searchParams.set("sort", "date,asc");

  try {
    const res = await fetch(url.toString(), {
      // Cache this API response for everyone (CDN-friendly)
      next: { revalidate: 60 * 60 * 12 }, // 12 hours
    });

    if (!res.ok) {
      return NextResponse.json(FALLBACK, {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    const data = await res.json();
    const events = data?._embedded?.events ?? [];

    const seen = new Set<string>();

    const cards: Card[] = events
      // 1) keep only decent categories (optional but HIGHLY recommended)
      .filter((e: any) => {
        const segment = e?.classifications?.[0]?.segment?.name?.toLowerCase();
        return (
          segment === "music" ||
          segment === "sports" ||
          segment === "arts & theatre"
        );
      })
      .map((e: any) => {
        const id = e?.id;
        const title = e?.name?.trim();

        // basic “nope” filter for junky listings
        if (!title) return null;
        if (title.length < 6) return null;
        if (/row\s+[a-z]\b/i.test(title)) return null; // "Row C Start"
        if (/section\s+\d+/i.test(title)) return null;

        const venue = e?._embedded?.venues?.[0];
        const city = venue?.city?.name;
        const country = venue?.country?.countryCode || venue?.country?.name;

        const imgObj =
          (e?.images || []).find((im: any) => im?.ratio === "16_9") ||
          (e?.images || [])[0];

        const img = imgObj?.url;

        if (!id || !city || !img) return null;

        const meta = `${monthLabel(start)} · ${city}${country ? `, ${country}` : ""}`;

        // 2) de-dupe by title+meta (or just title)
        const dupeKey = `${title.toLowerCase()}|${meta.toLowerCase()}`;
        if (seen.has(dupeKey)) return null;
        seen.add(dupeKey);

        return { id, title, meta, img, alt: title } as Card;
      })
      .filter(Boolean)
      .slice(0, 4);

    return NextResponse.json(cards.length ? cards : FALLBACK, {
      headers: {
        // extra cache hint for edge/CDN layers
        "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(FALLBACK, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  }
}
