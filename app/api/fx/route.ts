// app/api/fx/route.ts
import { NextResponse } from "next/server";

type GeoResult = {
  country_code?: string;
};

async function cityToCountryCode(city: string) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city,
  )}&count=1&language=en&format=json`;

  const r = await fetch(geoUrl, { next: { revalidate: 60 * 60 } });
  if (!r.ok) throw new Error("Geocoding failed");

  const j = (await r.json()) as { results?: GeoResult[] };
  const code = j.results?.[0]?.country_code;

  if (!code) throw new Error(`No country code found for "${city}"`);
  return code.toUpperCase();
}

async function countryCodeToCurrency(code: string) {
  // REST Countries alpha endpoint
  const url = `https://restcountries.com/v3.1/alpha/${encodeURIComponent(code)}`;

  const r = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!r.ok) throw new Error("REST Countries failed");

  const j = (await r.json()) as any[];
  const currencies = j?.[0]?.currencies;

  // currencies is an object like { EUR: { name, symbol }, ... }
  const currencyCode = currencies ? Object.keys(currencies)[0] : null;

  if (!currencyCode) throw new Error(`No currency found for "${code}"`);
  return currencyCode.toUpperCase();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const from = (searchParams.get("from") ?? "").trim();
    const to = (searchParams.get("to") ?? "").trim();

    if (!from || !to) {
      return NextResponse.json(
        { ok: false, error: "Missing from/to" },
        { status: 400 },
      );
    }

    // 1) city -> country code
    const [fromCountry, toCountry] = await Promise.all([
      cityToCountryCode(from),
      cityToCountryCode(to),
    ]);

    // 2) country code -> currency code
    const [fromCurrency, toCurrency] = await Promise.all([
      countryCodeToCurrency(fromCountry),
      countryCodeToCurrency(toCountry),
    ]);

    // 3) currency -> currency rate
    const fxUrl = `https://api.frankfurter.dev/latest?from=${encodeURIComponent(
      fromCurrency,
    )}&to=${encodeURIComponent(toCurrency)}`;

    const fxRes = await fetch(fxUrl, { next: { revalidate: 60 * 60 } });
    if (!fxRes.ok) {
      return NextResponse.json(
        { ok: false, error: "FX provider failed" },
        { status: 502 },
      );
    }

    const fxJson = (await fxRes.json()) as {
      date?: string;
      rates?: Record<string, number>;
    };

    const rate = fxJson?.rates?.[toCurrency];

    if (typeof rate !== "number") {
      return NextResponse.json(
        { ok: false, error: "No rate returned" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      fromCity: from,
      toCity: to,
      fromCountry,
      toCountry,
      fromCurrency,
      toCurrency,
      rate,
      date: fxJson.date ?? "",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Unexpected error" },
      { status: 500 },
    );
  }
}
