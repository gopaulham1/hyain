"use client";

import { useMemo, useState } from "react";

type Passport = "UK" | "EU" | "Turkey";

const CITY_TO_ISO3: Record<string, string> = {
  paris: "FRA",
  rome: "ITA",
  barcelona: "ESP",
  amsterdam: "NLD",
  prague: "CZE",
  vienna: "AUT",
  berlin: "DEU",
  lisbon: "PRT",
  athens: "GRC",
  dubai: "ARE",
  marrakech: "MAR",
};

function cityToIso3(city: string) {
  const key = city.trim().toLowerCase();
  return CITY_TO_ISO3[key] ?? null;
}

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
  // keep this logic inside sidebar for now (zero risk refactor)
  const visaByPassport = useMemo(
    () =>
      ({
        UK: {
          headline: "90 days visa-free",
          sub: "UK passport · tourism & business",
          badge: "OK to enter",
          statusEmoji: "✅",
        },
        EU: {
          headline: "90 days visa-free",
          sub: "EU passport · tourism & business",
          badge: "OK to enter",
          statusEmoji: "✅",
        },
        Turkey: {
          headline: "Visa required",
          sub: "Turkish passport · check requirements",
          badge: "Check details",
          statusEmoji: "⚠️",
        },
      }) as const,
    [],
  );

  const destinationIso3 = useMemo(() => cityToIso3(toCity), [toCity]);

  const [passport, setPassport] = useState<Passport>("UK");
  // --- Visa API state ---
  const [passportIso3, setPassportIso3] = useState<"GBR" | "TUR">("GBR");
  const [visaLoading, setVisaLoading] = useState(false);
  const [visaError, setVisaError] = useState<string | null>(null);
  const [visaData, setVisaData] = useState<any>(null);

  async function handleCheckVisa() {
    if (!destinationIso3) {
      setVisaError("Destination not supported yet.");
      setVisaData(null);
      return;
    }

    setVisaLoading(true);
    setVisaError(null);

    const res = await fetch("/api/visa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passport: passportIso3,
        destination: destinationIso3,
      }),
    });

    const json = await res.json();
    setVisaLoading(false);

    if (!json.ok) {
      setVisaError("Couldn’t fetch visa info right now.");
      setVisaData(null);
      return;
    }

    setVisaData(json);
  }

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
              <p className="text-xs text-gray-600">
                Dest ISO3: {destinationIso3 ?? "unknown"}
              </p>
              <p className="mt-1 text-sm text-gray-700">
                Quick check before you book
              </p>
            </div>

            <span className="rounded-full bg-black/10 border border-black/10 px-3 py-1 text-xs font-semibold text-gray-800">
              Beta
            </span>
          </div>

          <div className="mt-4 space-y-3 text-gray-800">
            <div className="rounded-2xl border border-emerald-600/25 bg-emerald-500/12 p-4 backdrop-blur-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {visaByPassport[passport].statusEmoji}{" "}
                    {visaByPassport[passport].headline.includes("Visa required")
                      ? "Visa required"
                      : "Visa-free"}
                  </p>

                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {visaByPassport[passport].headline}
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {visaByPassport[passport].sub}
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-emerald-500/20 border border-emerald-700/25 px-3 py-1 text-xs font-semibold text-emerald-900">
                  {visaByPassport[passport].badge}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <label className="text-sm font-semibold text-gray-900">
                  Passport
                </label>

                <select
                  value={passport}
                  onChange={(e) => setPassport(e.target.value as Passport)}
                  className="rounded-full bg-white/60 border border-black/10 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white/75 transition focus:outline-none"
                >
                  <option value="UK">UK</option>
                  <option value="EU">EU</option>
                  <option value="Turkey">Turkey</option>
                </select>

                <button
                  onClick={handleCheckVisa}
                  className="mt-3 inline-flex items-center rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-white/80"
                >
                  {visaLoading ? "Checking..." : "Check requirements"}
                </button>

                {visaError && (
                  <p className="mt-2 text-xs text-red-700">{visaError}</p>
                )}

                {visaData && (
                  <p className="mt-2 text-xs text-gray-800">
                    Live check: OK ✅
                  </p>
                )}

                <button
                  className="rounded-full bg-white/25 border border-black/10 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-white/40 transition"
                  onClick={() => alert("Open official source later")}
                >
                  Official source →
                </button>
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
            <SideRow
              title="Sunny"
              meta="Next 3 days"
              subtitle="16°C → 18°C · light breeze"
              icon={<span>☀️</span>}
              onClick={() => alert("Weather panel later")}
            />
            <SideRow
              title="Pack a light jacket"
              subtitle="Evenings drop to ~10°C"
              icon={<span>🧥</span>}
              onClick={() => alert("Packing tips later")}
            />
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
