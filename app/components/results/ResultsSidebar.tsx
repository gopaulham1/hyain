"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cityToIso2 } from "@/lib/geo/cityIso2";
import { getTriviaFact } from "@/data/cityTrivia";
import { getToursForCity } from "@/data/toursByCity";
import Image from "next/image";

type TMEvent = {
  id: string;
  name: string;
  url: string;
  venue?: string;
  date?: string;
  img?: string;
};

type WeatherToday = {
  max: number | null;
  min: number | null;
  label: string;
  emoji: string;
};

function formatShortDate(iso?: string) {
  if (!iso) return undefined; // so SideRow meta can be empty
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(d); // e.g. "05 Jun"
}

function formatFxRate(n: number) {
  // nice readable rate: 4.957 -> 4.96, 23.1107 -> 23.11
  return n >= 10 ? n.toFixed(2) : n.toFixed(3);
}

const ISO2_TO_PASSPORT_NAME: Record<string, string> = {
  GB: "British",
  MD: "Moldovan",
  TR: "Turkish",
  FR: "French",
  ES: "Spanish",
  AE: "Emirati",
  CN: "China",
  IT: "Italian",
  RU: "Russian",
  NL: "Dutch",
  DE: "German",
  PT: "Portuguese",
  GR: "Greek",
  MA: "Moroccan",
};

function SideRow({
  title,
  subtitle,
  meta,
  icon,
  onClick,
  bigIcon,
  flushLeft,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  bigIcon?: boolean;
  flushLeft?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left",
        "rounded-2xl",
        "transition",
        "hover:bg-white/40 active:bg-white/55",
        flushLeft
          ? "overflow-hidden flex items-center justify-between"
          : "px-4 py-3 flex items-start justify-between gap-4",
      ].join(" ")}
    >
      {flushLeft ? (
        <>
          {/* Left icon badge (flush + pilled) */}
          {icon ? (
            <div className="shrink-0 pr-3">
              <div className="h-14 w-14 rounded-2xl bg-white/60 backdrop-blur-sm border border-black/10 grid place-items-center text-4xl shadow-sm">
                {icon}
              </div>
            </div>
          ) : null}

          {/* Text block */}
          <div className="min-w-0 flex-1 pr-4 py-1">
            <p className="font-semibold text-gray-900 truncate">{title}</p>
            {meta ? <p className="mt-1 text-sm text-gray-600">{meta}</p> : null}
            {subtitle ? (
              <p className="mt-1 text-sm leading-snug text-gray-700">
                {subtitle}
              </p>
            ) : null}
          </div>
        </>
      ) : (
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
      )}

      {/* Arrow */}
      {/* Arrow (only for clickable rows) */}
      {onClick ? (
        <svg
          className={
            flushLeft
              ? "h-5 w-5 shrink-0 text-gray-600 mr-3 self-center"
              : "mt-1 h-5 w-5 shrink-0 text-gray-600"
          }
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
      ) : null}
    </button>
  );
}

function EventRow({
  title,
  meta,
  subtitle,
  img,
  onClick,
}: {
  title: string;
  meta?: string;
  subtitle?: string;
  img?: string;
  onClick?: () => void;
}) {
  const canRenderImage =
    !!img &&
    (img.startsWith("/") ||
      img.includes("ticketm.") ||
      img.includes("ticketmaster") ||
      img.includes("universe.com"));
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-full text-left",
        "rounded-2xl overflow-hidden",
        "flex items-center",
        "transition-all",
        "hover:bg-white/40 active:bg-white/55",
        "hover:shadow-md hover:-translate-y-[1px]",
      ].join(" ")}
    >
      {/* Thumbnail (pilled badge like destination icons) */}
      <div className="shrink-0 pr-3">
        <div className="h-14 w-14 rounded-2xl bg-white/60 backdrop-blur-sm border border-black/10 shadow-sm overflow-hidden grid place-items-center">
          {canRenderImage ? (
            <div className="relative h-full w-full">
              <Image
                src={img!}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="56px"
              />
            </div>
          ) : (
            <div className="h-full w-full grid place-items-center text-xl">
              🎟️
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1 pr-4 py-3">
        <p className="font-semibold text-gray-900 truncate">{title}</p>
        <p className="mt-1 text-sm text-gray-600">
          {meta ? meta : null}
          {meta && subtitle ? <span className="mx-2">•</span> : null}
          {subtitle ? subtitle : null}
        </p>
      </div>

      {/* Arrow */}
      <svg
        className="h-5 w-5 shrink-0 text-gray-600"
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

type ResultsSidebarProps = {
  fromCity: string;
  toCity: string;
};

export default function ResultsSidebar({
  fromCity,
  toCity,
}: ResultsSidebarProps) {
  const passportIso2 = cityToIso2(fromCity) ?? "MD";
  const destinationIso2 = cityToIso2(toCity) ?? "AE";

  const passportLabel = ISO2_TO_PASSPORT_NAME[passportIso2] ?? passportIso2;

  const [visaLoading, setVisaLoading] = useState(false);
  const [visaError, setVisaError] = useState<string | null>(null);
  const [visaData, setVisaData] = useState<any>(null);

  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherToday, setWeatherToday] = useState<WeatherToday | null>(null);

  const [fxData, setFxData] = useState<any>(null);
  const [fxLoading, setFxLoading] = useState(false);

  const trivia = useMemo(() => getTriviaFact(toCity), [toCity]);
  const tours = useMemo(() => getToursForCity(toCity, 3), [toCity]);

  const visaRequired = !!visaData?.visaRequired;

  const visaTintClasses = visaRequired
    ? "border-red-600/25 bg-red-600/15"
    : "border-emerald-600/25 bg-emerald-600/15";

  async function handleCheckVisa() {
    try {
      setVisaLoading(true);
      setVisaError(null);

      const res = await fetch("/api/visa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passport: passportIso2,
          destination: destinationIso2,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json?.ok) {
        setVisaError(json?.error || "Couldn’t fetch visa info right now.");
        setVisaData(null);
        return;
      }

      setVisaData(json);
    } catch (err) {
      setVisaError("Couldn’t fetch visa info right now.");
      setVisaData(null);
    } finally {
      setVisaLoading(false);
    }
  }

  const lastVisaKeyRef = useRef<string | null>(null);

  useEffect(() => {
    return;
    const key = `${passportIso2}-${destinationIso2}`;

    // prevents double-call (dev fast refresh / strict mode vibes)
    if (lastVisaKeyRef.current === key) return;

    lastVisaKeyRef.current = key;
    handleCheckVisa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passportIso2, destinationIso2]);

  const countryNameMap: Record<string, string> = {
    GB: "United Kingdom",
    FR: "France",
    ES: "Spain",
    IT: "Italy",
    BE: "Belgium",
    MA: "Morocco",
    NL: "Netherlands",
    AE: "United Arab Emirates",
    DE: "Germany",
    RU: "Russia",
    CN: "China",
    MD: "Moldova",
    TR: "Turkey",
  };

  function toSlug(value: string) {
    return value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z-]/g, "");
  }

  const destinationName =
    countryNameMap[destinationIso2 ?? ""] || destinationIso2;

  const passportName =
    ISO2_TO_PASSPORT_NAME[passportIso2 ?? ""] || passportIso2;

  const sherpaUrl = `https://apply.joinsherpa.com/visa/${toSlug(
    destinationName,
  )}/${toSlug(passportName)}-citizens`;

  const [tmLoading, setTmLoading] = useState(false);
  const [tmEvents, setTmEvents] = useState<TMEvent[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!toCity || toCity === "Anywhere") {
        setTmEvents([]);
        return;
      }

      setTmLoading(true);
      try {
        const r = await fetch(
          `/api/ticketmaster/events?city=${encodeURIComponent(toCity)}`,
        );
        const data = await r.json();
        console.log("TM API response:", data);
        if (!cancelled) setTmEvents(data?.events ?? []);
      } catch {
        if (!cancelled) setTmEvents([]);
      } finally {
        if (!cancelled) setTmLoading(false);
      }
    }

    // load();
    return () => {
      cancelled = true;
    };
  }, [toCity]);

  useEffect(() => {
    let cancelled = false;

    async function loadWeather() {
      if (!toCity || toCity === "Anywhere") {
        setWeatherToday(null);
        return;
      }

      setWeatherLoading(true);
      try {
        const r = await fetch(
          `/api/weather?city=${encodeURIComponent(toCity)}`,
        );
        const data = await r.json();

        if (!cancelled && data?.ok) {
          setWeatherToday(data.today ?? null);
        }
        if (!cancelled && !data?.ok) {
          setWeatherToday(null);
        }
      } catch {
        if (!cancelled) setWeatherToday(null);
      } finally {
        if (!cancelled) setWeatherLoading(false);
      }
    }

    // loadWeather();
    return () => {
      cancelled = true;
    };
  }, [toCity]);

  useEffect(() => {
    let cancelled = false;

    async function loadFx() {
      if (!fromCity || !toCity || toCity === "Anywhere") {
        setFxData(null);
        return;
      }

      setFxLoading(true);
      try {
        const r = await fetch(
          `/api/fx?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}`,
          { cache: "no-store" },
        );
        const data = await r.json();

        if (!cancelled && data?.ok) setFxData(data);
        if (!cancelled && !data?.ok) setFxData(null);
      } catch {
        if (!cancelled) setFxData(null);
      } finally {
        if (!cancelled) setFxLoading(false);
      }
    }

    // loadFx();
    return () => {
      cancelled = true;
    };
  }, [fromCity, toCity]);

  return (
    <aside className="lg:col-span-5 self-start lg:sticky lg:top-6 lg:pl-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Visa */}
        <div className="rounded-[22px] p-6 bg-white/70 border border-white/45 backdrop-blur-m shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_18px_40px_rgba(0,0,0,0.12)] sm:h-[360px] overflow-hidden flex flex-col">
          {" "}
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
          <div className="mt-4 space-y-3 text-gray-800 overflow-auto flex-1">
            {" "}
            <div
              className={`rounded-2xl border p-4 backdrop-blur-2xl ${visaTintClasses}`}
            >
              {" "}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  {/* Top status row */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">
                      {visaData?.visaRequired
                        ? "⚠️  Visa required"
                        : `✅  Visa-free${visaData?.durationDays ? ` – ${visaData.durationDays} days` : ""}`}
                    </h3>
                  </div>

                  {/* Passport line */}
                  <p className="mt-2 text-sm text-gray-700">
                    {passportLabel} passport · tourism & business
                  </p>

                  {/* Passport + destination pills (static) */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold">Passport</span>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold">
                      {passportLabel}
                    </span>

                    <span className="ml-2 font-semibold">To</span>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold">
                      {countryNameMap[destinationIso2 ?? ""] || destinationIso2}
                    </span>
                  </div>

                  {/* One-time status */}
                  {visaLoading && (
                    <p className="mt-3 text-xs text-gray-700">Checking...</p>
                  )}

                  {visaError && (
                    <p className="mt-3 text-xs text-red-700">{visaError}</p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {visaData?.raw?.message && (
                  <p className="mt-1 text-xs text-gray-700">
                    {visaData.raw.message}
                  </p>
                )}
                <a
                  href={sherpaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-white/70 px-4 py-2 text-xs font-semibold hover:bg-white"
                >
                  Official source →
                </a>
              </div>
            </div>
            <p className="text-xs text-gray-600 pt-2 border-t border-black/10">
              This is guidance, not legal advice
            </p>
          </div>
        </div>

        {/* Destination info */}
        <div className="rounded-[22px] p-6 bg-white/70 border border-white/45 backdrop-blur-m shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_18px_40px_rgba(0,0,0,0.12)] sm:h-[360px] overflow-hidden flex flex-col">
          {" "}
          <h2 className="hyain-serif text-2xl font-semibold text-gray-900">
            {toCity} Info
          </h2>
          <div className="mt-3 mb-3 h-px bg-black/30" />
          <div className="space-y-1.5 text-gray-800 overflow-auto flex-1">
            {" "}
            <SideRow
              flushLeft
              title={weatherToday ? "Weather today" : "Weather"}
              meta={
                weatherToday
                  ? `High ${weatherToday.max ?? "–"}° • Low ${weatherToday.min ?? "–"}°`
                  : undefined
              }
              subtitle={
                weatherLoading
                  ? "Fetching forecast..."
                  : (weatherToday?.label ?? "Couldn’t load right now")
              }
              icon={<span>{weatherToday?.emoji ?? "🌦️"}</span>}
            />
            <SideRow
              flushLeft
              title="Currency"
              meta={
                fxData?.ok && typeof fxData?.rate === "number"
                  ? `1 ${fxData.fromCurrency} = ${formatFxRate(fxData.rate)} ${fxData.toCurrency}`
                  : undefined
              }
              subtitle={
                fxLoading
                  ? "Fetching exchange rate..."
                  : fxData?.ok
                    ? `Updated ${fxData.date ?? "recently"}`
                    : "Couldn’t load right now"
              }
              icon={
                <Image
                  src="/icons/currency.svg"
                  alt="Currency"
                  width={32}
                  height={32}
                />
              }
            />
            {trivia ? (
              <SideRow
                flushLeft
                title={`${toCity} is home to...`}
                subtitle={trivia}
                icon={
                  <Image
                    src="/icons/info.svg"
                    alt="Info"
                    width={32}
                    height={32}
                  />
                }
              />
            ) : null}
          </div>
        </div>

        {/* Events */}
        <div className="rounded-[22px] p-6 bg-white/70 border border-white/45 backdrop-blur-m shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_18px_40px_rgba(0,0,0,0.12)]">
          <h2 className="hyain-serif text-2xl font-semibold text-gray-900">
            Live from {toCity}!
          </h2>

          <div className="mt-3 mb-4 h-px bg-black/30" />

          <div className="mt-4 space-y-2 text-gray-800">
            {tmLoading ? (
              <p className="text-sm text-gray-700">Loading events...</p>
            ) : tmEvents.length === 0 ? (
              <p className="text-sm text-gray-700">No events found.</p>
            ) : (
              tmEvents.map((e) => (
                <EventRow
                  key={e.id}
                  title={e.name}
                  meta={formatShortDate(e.date)}
                  subtitle={e.venue ? e.venue : "View details"}
                  img={e.img}
                  onClick={() => window.open(e.url, "_blank")}
                />
              ))
            )}
          </div>
        </div>

        {/* Tours */}
        <div className="rounded-[22px] p-6 bg-white/70 border border-white/45 backdrop-blur-m shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_18px_40px_rgba(0,0,0,0.12)]">
          <h2 className="hyain-serif text-2xl font-semibold text-gray-900">
            Tours from {toCity}
          </h2>

          <div className="mt-3 mb-4 h-px bg-black/30" />

          <div className="mt-4 space-y-2 text-gray-800">
            {tours.length === 0 ? (
              <p className="text-sm text-gray-700">
                No tour picks available yet.
              </p>
            ) : (
              tours.map((t) => (
                <EventRow
                  key={t.id}
                  title={t.title}
                  meta={t.pill}
                  subtitle={t.subtitle}
                  img={t.img}
                  onClick={() => {
                    // const slug = toCity.toLowerCase().replace(/\s+/g, "-");
                    window.open(t.viator_link, "_blank");
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
