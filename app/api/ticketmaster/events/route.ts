import { NextResponse } from "next/server";

export const runtime = "nodejs";

function tmDate(d: Date) {
  // Ticketmaster wants: YYYY-MM-DDTHH:mm:ssZ (no milliseconds)
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function shouldRejectTicketmasterEvent(e: any) {
  const name = String(e?.name ?? "").toLowerCase();

  // Fast keyword blacklist (covers 95% of junk add-ons)
  const badName =
    /\b(parking|permit|upgrade|vip|package|club|jazz|seat|meet\s*&?\s*greet|fast\s*track|add[-\s]?on|bundle|pass|insurance|merch|shirt|t-?shirt|voucher|gift|shuttle)\b/i.test(
      name,
    );

  // Classification-based blacklist (when TM tags it)
  const cls = e?.classifications?.[0];
  const segment = String(cls?.segment?.name ?? "").toLowerCase();
  const genre = String(cls?.genre?.name ?? "").toLowerCase();
  const subGenre = String(cls?.subGenre?.name ?? "").toLowerCase();

  const badClassification =
    segment.includes("miscellaneous") ||
    genre.includes("parking") ||
    subGenre.includes("parking");

  return badName || badClassification;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city")?.trim();

    const now = new Date();

    // Start from tomorrow (00:00)
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 4,
      0,
      0,
      0,
    );

    // End of next month
    const endOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 2,
      0, // day 0 = last day of previous month
      23,
      59,
      59,
    );

    // Format for Ticketmaster (ISO with Z)
    const startDateTime = tmDate(startDate);
    const endDateTime = tmDate(endOfNextMonth);

    if (!city) return NextResponse.json({ events: [] });

    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) return NextResponse.json({ events: [] });

    const paramsObj: Record<string, string> = {
      apikey: apiKey,
      city,
      size: "20",
      sort: "date,asc",
      startDateTime,
      endDateTime,
    };

    const params = new URLSearchParams(paramsObj);

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;

    // const r = await fetch(url, { next: { revalidate: 60 * 30 } }); // cache 30 mins
    const r = await fetch(url, { cache: "no-store" });

    let data = await r.json();

    if (!r.ok) {
      return NextResponse.json({
        events: [],
        debug: {
          url,
          status: r.status,
          errors: data?.errors ?? null,
        },
      });
    }

    let raw = data?._embedded?.events ?? [];

    // ✅ Fallback: if nothing in this month + next month, retry with "any time"
    if (r.ok && raw.length === 0) {
      const fallbackParamsObj: Record<string, string> = {
        apikey: apiKey,
        city,
        size: "20",
        sort: "date,asc",
      };

      // keep countryCode if you add it dynamically
      if (paramsObj.countryCode) {
        fallbackParamsObj.countryCode = paramsObj.countryCode;
      }

      const fallbackParams = new URLSearchParams(fallbackParamsObj);
      const fallbackUrl = `https://app.ticketmaster.com/discovery/v2/events.json?${fallbackParams.toString()}`;

      const r2 = await fetch(fallbackUrl, { cache: "no-store" });
      const data2 = await r2.json();

      // swap to fallback results
      if (r2.ok) {
        data = data2;
        raw = data2?._embedded?.events ?? [];
      }
    }

    const eventsRaw = raw
      .filter((e: any) => !shouldRejectTicketmasterEvent(e))
      .map((e: any) => {
        const venue = e?._embedded?.venues?.[0]?.name;
        const date = e?.dates?.start?.localDate;
        const name = e?.name;
        const url = e?.url;
        const id = e?.id;

        const img =
          e?.images?.find((im: any) => im?.ratio === "3_2" && im?.width >= 300)
            ?.url ||
          e?.images?.find((im: any) => im?.width >= 300)?.url ||
          e?.images?.[0]?.url;

        return { id, name, url, venue, date, img };
      })
      .filter((e: any) => e?.name && e?.url);

    // ✅ Diversity: avoid same first word
    const seenFirstWords = new Set<string>();

    const events = eventsRaw
      .filter((e: any) => {
        if (!e.name) return false;

        const firstWord = e.name.trim().split(" ")[0].toLowerCase();

        if (seenFirstWords.has(firstWord)) return false;

        seenFirstWords.add(firstWord);
        return true;
      })
      .slice(0, 3);

    return NextResponse.json({
      events,
      debug: {
        url,
        status: r.status,
        rawCount: raw.length,
      },
    });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
