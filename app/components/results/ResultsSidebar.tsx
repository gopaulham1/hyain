"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TMEvent = {
  id: string;
  name: string;
  url: string;
  venue?: string;
  date?: string;
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

const CITY_TO_ISO2: Record<string, string> = {
  london: "GB",
  manchester: "GB",
  paris: "FR",
  nice: "FR",
  rome: "IT",
  milan: "IT",
  barcelona: "ES",
  madrid: "ES",
  amsterdam: "NL",
  antalya: "TR",
  berlin: "DE",
  munich: "DE",
  hamburg: "DE",
  beijing: "CN",
  lisbon: "PT",
  athens: "GR",
  dubai: "AE",
  abu_dhabi: "AE",
  marrakech: "MA",
  agadir: "MA",
  istanbul: "TR",
  chișinău: "MD",
  chisinau: "MD",
};

function cityToIso2(city: string) {
  const key = city.trim().toLowerCase();
  return CITY_TO_ISO2[key] ?? null;
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

  // const passportLabel = ISO2_TO_PASSPORT_NAME[passportIso2] ?? passportIso2;
  // const destinationIso2 = useMemo(() => cityToIso2(toCity), [toCity]);
  // const passportIso2 = useMemo(() => cityToIso2(fromCity) ?? "GB", [fromCity]);

  const [visaLoading, setVisaLoading] = useState(false);
  const [visaError, setVisaError] = useState<string | null>(null);
  const [visaData, setVisaData] = useState<any>(null);

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
    AE: "United Arab Emirates",
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
        if (!cancelled) setTmEvents(data?.events ?? []);
      } catch {
        if (!cancelled) setTmEvents([]);
      } finally {
        if (!cancelled) setTmLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [toCity]);

  return (
    <aside className="lg:col-span-5 self-start lg:sticky lg:top-6 lg:pl-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Visa */}
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
                {/* <button
                  onClick={handleCheckVisa}
                  className="mt-3 inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-white/80"
                >
                  {visaLoading ? "Checking..." : "Check requirements"}
                </button>

                {visaError && (
                  <p className="mt-2 text-xs text-red-700">{visaError}</p>
                )}

                {visaData && (
                  <div className="mt-2 text-xs text-gray-800 space-y-1">
                    {visaData.raw?.error ? (
                      <p className="text-amber-800">
                        Couldn’t find visa info for this passport + destination.
                        Please check official sources.
                      </p>
                    ) : (
                      <p className="text-emerald-800">Visa info received ✅</p>
                    )}
                  </div>
                )} */}

                {visaData?.raw?.message && (
                  <p className="mt-1 text-xs text-gray-700">
                    {visaData.raw.message}
                  </p>
                )}
                <a
                  href={sherpaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full bg-white/70 px-4 py-2 text-sm font-semibold hover:bg-white"
                >
                  Official source →
                </a>
              </div>
            </div>

            <p className="text-xs text-gray-600 pt-2 border-t border-black/10">
              This is guidance, not legal advice. Always confirm with official
              sources.
            </p>
          </div>
        </div>

        {/* Destination info */}
        <div className="rounded-[22px] p-6 bg-white/70 border border-white/45 backdrop-blur-m shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_18px_40px_rgba(0,0,0,0.12)]">
          <h2 className="hyain-serif text-2xl font-semibold text-gray-900">
            Destination Info
          </h2>

          <div className="mt-3 mb-4 h-px bg-black/30" />

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

        {/* Events */}
        <div className="rounded-[22px] p-6 bg-white/70 border border-white/45 backdrop-blur-m shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_18px_40px_rgba(0,0,0,0.12)]">
          <h2 className="hyain-serif text-2xl font-semibold text-gray-900">
            Events
          </h2>

          <div className="mt-3 mb-4 h-px bg-black/30" />

          <div className="mt-4 space-y-2 text-gray-800">
            {tmLoading ? (
              <p className="text-sm text-gray-700">Loading events...</p>
            ) : tmEvents.length === 0 ? (
              <p className="text-sm text-gray-700">No events found.</p>
            ) : (
              tmEvents.map((e) => (
                <SideRow
                  key={e.id}
                  title={e.name}
                  meta={formatShortDate(e.date)}
                  subtitle={e.venue ? e.venue : "View details"}
                  icon={<span>🎟️</span>}
                  onClick={() => window.open(e.url, "_blank")}
                />
              ))
            )}
          </div>
        </div>

        {/* Tours */}
        <div className="rounded-[22px] p-6 bg-white/70 border border-white/45 backdrop-blur-m shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_18px_40px_rgba(0,0,0,0.12)]">
          <h2 className="hyain-serif text-2xl font-semibold text-gray-900">
            Tours
          </h2>

          <div className="mt-3 mb-4 h-px bg-black/30" />

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
      </div>
    </aside>
  );
}
