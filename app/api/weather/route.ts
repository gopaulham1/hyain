// app/api/weather/route.ts
import { NextResponse } from "next/server";

type GeoResult = {
  latitude: number;
  longitude: number;
  name: string;
  country?: string;
};

function weatherCodeLabel(code: number) {
  if (code === 0) return { emoji: "☀️", label: "Clear" };
  if (code <= 2) return { emoji: "🌤️", label: "Mostly clear" };
  if (code === 3) return { emoji: "☁️", label: "Cloudy" };
  if (code >= 45 && code <= 48) return { emoji: "🌫️", label: "Fog" };
  if (code >= 51 && code <= 67) return { emoji: "🌦️", label: "Drizzle/Rain" };
  if (code >= 71 && code <= 77) return { emoji: "🌨️", label: "Snow" };
  if (code >= 80 && code <= 82) return { emoji: "🌧️", label: "Rain showers" };
  if (code >= 95) return { emoji: "⛈️", label: "Thunderstorm" };
  return { emoji: "🌤️", label: "Weather" };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = (searchParams.get("city") ?? "").trim();

    if (!city) {
      return NextResponse.json(
        { ok: false, error: "Missing city" },
        { status: 400 },
      );
    }

    // 1) Geocode city -> lat/lon
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city,
    )}&count=1&language=en&format=json`;

    const geoRes = await fetch(geoUrl, { next: { revalidate: 60 * 60 } });
    if (!geoRes.ok) {
      return NextResponse.json(
        { ok: false, error: "Geocoding failed" },
        { status: 502 },
      );
    }

    const geoJson = (await geoRes.json()) as { results?: GeoResult[] };
    const hit = geoJson.results?.[0];

    if (!hit) {
      return NextResponse.json(
        { ok: false, error: `No location found for "${city}"` },
        { status: 404 },
      );
    }

    // 2) Forecast
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${hit.latitude}&longitude=${hit.longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

    const wRes = await fetch(forecastUrl, { next: { revalidate: 60 * 30 } });
    if (!wRes.ok) {
      return NextResponse.json(
        { ok: false, error: "Weather fetch failed" },
        { status: 502 },
      );
    }

    const wJson = await wRes.json();

    const todayMax = wJson?.daily?.temperature_2m_max?.[0];
    const todayMin = wJson?.daily?.temperature_2m_min?.[0];
    const todayCode = wJson?.daily?.weathercode?.[0];

    const codeNum = Number.isFinite(todayCode) ? Number(todayCode) : 0;
    const { emoji, label } = weatherCodeLabel(codeNum);

    return NextResponse.json({
      ok: true,
      city: hit.name,
      country: hit.country ?? "",
      latitude: hit.latitude,
      longitude: hit.longitude,
      today: {
        max: typeof todayMax === "number" ? Math.round(todayMax) : null,
        min: typeof todayMin === "number" ? Math.round(todayMin) : null,
        code: codeNum,
        label,
        emoji,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Unexpected error" },
      { status: 500 },
    );
  }
}
