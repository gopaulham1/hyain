import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  // OpenStreetMap Nominatim (free, rate-limited, good for MVP)
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
    lat,
  )}&lon=${encodeURIComponent(lon)}`;

  const res = await fetch(url, {
    headers: {
      // Nominatim wants a User-Agent. Keep it simple for dev.
      "User-Agent": "Hyain/0.1",
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { city: undefined, country: undefined },
      { status: 200 },
    );
  }

  const data = await res.json();

  const address = data?.address || {};
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    undefined;

  const country = address.country || undefined;

  return NextResponse.json({ city, country });
}
