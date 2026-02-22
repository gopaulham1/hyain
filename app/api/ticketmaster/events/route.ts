import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city")?.trim();

    if (!city) return NextResponse.json({ events: [] });

    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) return NextResponse.json({ events: [] });

    const params = new URLSearchParams({
      apikey: apiKey,
      city,
      size: "3",
      sort: "date,asc",
    });

    const url = `https://app.ticketmaster.com/discovery/v2/events.json?${params.toString()}`;

    const r = await fetch(url, { next: { revalidate: 60 * 30 } }); // cache 30 mins
    if (!r.ok) return NextResponse.json({ events: [] });

    const data = await r.json();
    const raw = data?._embedded?.events ?? [];

    const events = raw.map((e: any) => {
      const venue = e?._embedded?.venues?.[0]?.name;
      const date = e?.dates?.start?.localDate;
      return {
        id: e?.id,
        name: e?.name,
        url: e?.url,
        venue,
        date,
      };
    });

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
