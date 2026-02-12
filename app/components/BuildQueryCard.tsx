"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  from: string;
  to: string;
  when: string;
  who: string;
  setFrom: (v: string) => void;
  setTo: (v: string) => void;
  setWhen: (v: string) => void;
  setWho: (v: string) => void;
  setQuery: (v: string) => void;
  buildQuery: (
    next?: Partial<{
      from: string;
      to: string;
      when: string;
      who: string;
    }>,
  ) => string;
};

export default function BuildQueryCard({
  from,
  to,
  when,
  who,
  setFrom,
  setTo,
  setWhen,
  setWho,
  setQuery,
  buildQuery,
}: Props) {
  const [fromOpen, setFromOpen] = useState(false);
  const [fromStage, setFromStage] = useState<"region" | "country" | "city">(
    "region",
  );
  const [fromRegion, setFromRegion] = useState<
    "Europe" | "Asia" | "USA" | "Everywhere else" | null
  >(null);

  const [fromCountry, setFromCountry] = useState<string | null>(null);

  const [toOpen, setToOpen] = useState(false);
  const [toStage, setToStage] = useState<"region" | "country" | "city">(
    "region",
  );
  const [toRegion, setToRegion] = useState<
    "Europe" | "Asia" | "USA" | "Everywhere else" | null
  >(null);

  const [toCountry, setToCountry] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const closeAll = () => {
    setFromOpen(false);
    setToOpen(false);
    setWhenOpen(false);
    setWhoOpen(false);
  };

  const REGION_OPTIONS = [
    { key: "Europe", label: "EUROPE", img: "/images/london2.jpg" },
    { key: "Asia", label: "ASIA", img: "/images/tokyo2.jpg" },
    { key: "USA", label: "USA", img: "/images/barcelona.jpg" },
    {
      key: "Everywhere else",
      label: "OTHER PLACES",
      img: "/images/rio3.jpg",
    },
  ] as const;

  const REGION_COUNTRIES: Record<
    "Europe" | "Asia" | "USA" | "Everywhere else",
    string[]
  > = {
    Europe: ["France", "Germany", "Italy", "Spain", "United Kingdom"],
    Asia: ["China", "India", "United Arab Emirates", "Maldives"],
    USA: ["United States"],
    "Everywhere else": [
      "Australia",
      "Brazil",
      "Canada",
      "Mauritius",
      "South Africa",
    ],
  };

  const COUNTRY_CITIES: Record<string, string[]> = {
    "United Kingdom": ["London", "Manchester", "Edinburgh"],
    France: ["Paris", "Nice", "Lyon"],
    Germany: ["Berlin", "Munich", "Frankfurt"],
    Italy: ["Milan", "Rome", "Venice"],
    Spain: ["Barcelona", "Madrid", "Valencia"],

    China: ["Beijing", "Shanghai", "Shenzhen"],
    India: ["Delhi", "Mumbai", "Bangalore"],
    "United Arab Emirates": ["Dubai", "Abu Dhabi"],
    Maldives: ["Malé"],

    "United States": ["New York", "Los Angeles", "Chicago"],

    Australia: ["Sydney", "Melbourne"],
    Brazil: ["São Paulo", "Rio de Janeiro"],
    Canada: ["Toronto", "Vancouver"],
    Mauritius: ["Port Louis"],
    "South Africa": ["Cape Town", "Johannesburg"],
  };

  const [whenOpen, setWhenOpen] = useState(false);

  // NEW
  type DateMode = "anytime" | "flexible" | "month" | "date";
  const [dateMode, setDateMode] = useState<DateMode>("anytime");
  const [departDate, setDepartDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const flexibleOptions = [
    "This Week",
    "Next Week",
    "This Month",
    "Next Month",
    "Weekends Only",
  ];

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isBetween = (d: Date, a: Date, b: Date) => {
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const tA = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
    const tB = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
    return t > Math.min(tA, tB) && t < Math.max(tA, tB);
  };

  const monthLabel = (d: Date) =>
    d.toLocaleString(undefined, { month: "long", year: "numeric" });

  const formatPretty = (d: Date) => {
    const day = d.getDate();
    const month = d.toLocaleString(undefined, { month: "short" });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const buildMonthGrid = (monthStart: Date) => {
    const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
    const startDow = (first.getDay() + 6) % 7; // Monday=0
    const start = new Date(first);
    start.setDate(first.getDate() - startDow);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const x = new Date(start);
      x.setDate(start.getDate() + i);
      days.push(x);
    }
    return days;
  };

  const applyWhen = (label: string) => {
    setWhen(label);
    setQuery(buildQuery({ when: label }));
  };

  const clearDates = () => {
    setDepartDate(null);
    setReturnDate(null);
    applyWhen("Anytime");
  };

  const [whoOpen, setWhoOpen] = useState(false);

  const MAX_PAX = 9;
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const updateWho = (
    nextAdults: number,
    nextChildren: number,
    opts?: { syncQuery?: boolean },
  ) => {
    const syncQuery = opts?.syncQuery ?? true;

    let a = Math.max(1, nextAdults);
    let c = Math.max(0, nextChildren);

    // cap total pax
    if (a + c > MAX_PAX) c = MAX_PAX - a;

    setAdults(a);
    setChildren(c);

    const total = a + c;
    const label = total === 1 ? "1 traveller" : `${total} travellers`;

    setWho(label);

    if (syncQuery) {
      setQuery(buildQuery({ who: label }));
    }
  };

  // optional: if you want it to start from current `who` prop
  useEffect(() => {
    const n = parseInt(who, 10);
    if (!Number.isNaN(n) && n >= 1) updateWho(n, 0, { syncQuery: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setFromOpen(false);
        setToOpen(false);
        setWhenOpen(false);
        setWhoOpen(false);

        setFromStage("region");
        setFromRegion(null);
        setToStage("region");
        setToRegion(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="rounded-[28px] p-6 hyain-glass-light-soft-solid"
    >
      <div className="mt-2 space-y-3">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <button
              type="button"
              className="w-full min-h-[88px] flex flex-col justify-center rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
              onClick={() => {
                if (!fromOpen) closeAll();
                setFromOpen((v) => !v);
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/icons/flight-dep.svg"
                  alt=""
                  className="h-6 w-6 opacity-70"
                  aria-hidden="true"
                />

                <div>
                  <div className="text-xs text-gray-600">Where from?</div>

                  <div className="text-base font-semibold text-gray-900">
                    {from}{" "}
                    <span className="text-gray-500 font-normal">(Any)</span>
                  </div>
                </div>
              </div>
            </button>

            {fromOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md border border-black/10 shadow-lg">
                {/* STAGE 1: REGIONS */}
                {fromStage === "region" && (
                  <div className="grid grid-cols-2 gap-0">
                    {REGION_OPTIONS.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        className="overflow-hidden border border-black/10 bg-white hover:bg-black/5 transition"
                        onClick={() => {
                          setFromRegion(r.key);
                          setFromStage("country");
                        }}
                      >
                        {/* You can replace this text-only block with your icon image later */}
                        <div className="flex flex-col">
                          <div className="relative w-full h-28">
                            <img
                              src={r.img}
                              alt={r.label}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>

                          <div className="py-3 text-center text-[12px] font-semibold tracking-[0.22em] text-gray-700">
                            {r.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* STAGE 2: CITIES */}
                {/* STAGE 2: COUNTRIES */}
                {fromStage === "country" && fromRegion && (
                  <div>
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <button
                        type="button"
                        className="text-base font-semibold text-gray-700 hover:text-gray-900 transition"
                        onClick={() => {
                          setFromStage("region");
                          setFromRegion(null);
                          setFromCountry(null);
                        }}
                      >
                        ← Back
                      </button>

                      <div className="text-base font-semibold text-gray-900">
                        {fromRegion}
                      </div>
                      <div className="w-10" />
                    </div>

                    <div className="pb-3 max-h-[320px] overflow-auto">
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900 hover:bg-black/5 transition"
                        onClick={() => {
                          setFrom(fromRegion); // sets "Europe"
                          setQuery(buildQuery({ from: fromRegion }));
                          setFromOpen(false);
                          setFromStage("region");
                          setFromRegion(null);
                          setFromCountry(null);
                        }}
                      >
                        All of {fromRegion}
                      </button>

                      {REGION_COUNTRIES[fromRegion]
                        .slice()
                        .sort((a, b) => a.localeCompare(b))
                        .map((country) => (
                          <button
                            key={country}
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-black/5 transition"
                            onClick={() => {
                              setFromCountry(country);
                              setFromStage("city");
                            }}
                          >
                            {country}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* STAGE 3: CITIES */}
                {fromStage === "city" && fromRegion && fromCountry && (
                  <div>
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <button
                        type="button"
                        className="text-base font-semibold text-gray-700 hover:text-gray-900 transition"
                        onClick={() => {
                          setFromStage("country");
                        }}
                      >
                        ← Back
                      </button>

                      <div className="text-base font-semibold text-gray-900">
                        {fromCountry}
                      </div>
                      <div className="w-10" />
                    </div>

                    <div className="pb-3 max-h-[320px] overflow-auto">
                      {(COUNTRY_CITIES[fromCountry] ?? [])
                        .slice()
                        .sort((a, b) => a.localeCompare(b))
                        .map((city) => (
                          <button
                            key={city}
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-black/5 transition"
                            onClick={() => {
                              setFrom(city);
                              setQuery(buildQuery({ from: city }));
                              setFromOpen(false);
                              setFromStage("region");
                              setFromRegion(null);
                              setFromCountry(null);
                            }}
                          >
                            {city}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className="w-full min-h-[88px] flex flex-col justify-center rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
              onClick={() => {
                if (!toOpen) closeAll();
                setToOpen((v) => !v);
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/icons/flight-4.svg"
                  alt=""
                  className="h-6 w-6 opacity-70"
                  aria-hidden="true"
                />

                <div>
                  <div className="text-xs text-gray-600">Where to?</div>

                  <div className="text-base font-semibold text-gray-900">
                    {to}
                  </div>
                </div>
              </div>
            </button>

            {toOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md border border-black/10 shadow-lg">
                {/* STAGE 1: REGIONS */}
                {toStage === "region" && (
                  <div className="grid grid-cols-2 gap-0">
                    {REGION_OPTIONS.map((r) => (
                      <button
                        key={r.key}
                        type="button"
                        className="overflow-hidden border border-black/10 bg-white hover:bg-black/5 transition"
                        onClick={() => {
                          setToRegion(r.key);
                          setToStage("country");
                        }}
                      >
                        <div className="flex flex-col">
                          <div className="relative w-full h-28">
                            <img
                              src={r.img}
                              alt={r.label}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </div>

                          <div className="py-3 text-center text-[12px] font-semibold tracking-[0.22em] text-gray-700">
                            {r.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* STAGE 2: COUNTRIES */}
                {toStage === "country" && toRegion && (
                  <div>
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <button
                        type="button"
                        className="text-base font-semibold text-gray-700 hover:text-gray-900 transition"
                        onClick={() => {
                          setToStage("region");
                          setToRegion(null);
                          setToCountry(null);
                        }}
                      >
                        ← Back
                      </button>

                      <div className="text-base font-semibold text-gray-900">
                        {toRegion}
                      </div>
                      <div className="w-10" />
                    </div>

                    <div className="pb-3 max-h-[320px] overflow-auto">
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-gray-900 hover:bg-black/5 transition"
                        onClick={() => {
                          setTo(toRegion); // sets "Europe"
                          setQuery(buildQuery({ to: toRegion }));
                          setToOpen(false);
                          setWhenOpen(false);
                          setToStage("region");
                          setToRegion(null);
                          setToCountry(null);
                        }}
                      >
                        All of {toRegion}
                      </button>

                      {REGION_COUNTRIES[toRegion]
                        .slice()
                        .sort((a, b) => a.localeCompare(b))
                        .map((country) => (
                          <button
                            key={country}
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-black/5 transition"
                            onClick={() => {
                              setToCountry(country);
                              setToStage("city");
                            }}
                          >
                            {country}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* STAGE 3: CITIES */}
                {toStage === "city" && toRegion && toCountry && (
                  <div>
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <button
                        type="button"
                        className="text-base font-semibold text-gray-700 hover:text-gray-900 transition"
                        onClick={() => {
                          setToStage("country");
                        }}
                      >
                        ← Back
                      </button>

                      <div className="text-base font-semibold text-gray-900">
                        {toCountry}
                      </div>
                      <div className="w-10" />
                    </div>

                    <div className="pb-3 max-h-[320px] overflow-auto">
                      {(COUNTRY_CITIES[toCountry] ?? [])
                        .slice()
                        .sort((a, b) => a.localeCompare(b))
                        .map((city) => (
                          <button
                            key={city}
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-black/5 transition"
                            onClick={() => {
                              setTo(city);
                              setQuery(buildQuery({ to: city }));
                              setToOpen(false);
                              setToStage("region");
                              setToRegion(null);
                              setToCountry(null);
                            }}
                          >
                            {city}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Row 2 */}
        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-3">
          {/* WHEN */}
          <div className="relative">
            <button
              type="button"
              className="w-full min-h-[88px] flex flex-col justify-center rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
              onClick={() => {
                if (!whenOpen) closeAll();
                setWhenOpen((v) => !v);
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/icons/calendar-3.svg"
                  alt=""
                  className="h-6 w-6 opacity-70"
                  aria-hidden="true"
                />

                <div>
                  <div className="text-xs text-gray-600">When?</div>
                  <div className="text-base font-semibold text-gray-900">
                    {when}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                Flexible dates get cheaper flights
              </div>
            </button>

            {whenOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl bg-white/85 text-gray-700 backdrop-blur-md border border-black/10 shadow-lg">
                <div className="grid grid-cols-2 gap-2 p-3 border-b border-black/10">
                  {[
                    { key: "anytime", label: "Anytime" },
                    { key: "flexible", label: "Flexible" },
                    { key: "month", label: "Month view" },
                    { key: "date", label: "Choose date" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => {
                        const mode = m.key as DateMode;

                        setDateMode(mode);

                        if (mode === "anytime") {
                          clearDates();
                          setWhenOpen(false);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${
                        dateMode === m.key
                          ? "bg-black text-white"
                          : "bg-white hover:bg-black/5 text-gray-700"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="p-3 space-y-2">
                  {dateMode === "flexible" &&
                    flexibleOptions.map((opt) => (
                      <button
                        key={opt}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-black/5"
                        onClick={() => {
                          setWhen(opt);
                          setWhenOpen(false);
                          setQuery(buildQuery({ when: opt }));
                        }}
                      >
                        {opt}
                      </button>
                    ))}

                  {dateMode === "month" && (
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((m) => (
                        <button
                          key={m}
                          className="px-3 py-2 rounded-lg hover:bg-black/5 text-sm"
                          onClick={() => {
                            setWhen(m);
                            setWhenOpen(false);
                            setQuery(buildQuery({ when: m }));
                          }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  )}

                  {dateMode === "date" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className="px-2 py-1 rounded-lg hover:bg-black/5"
                          onClick={() => {
                            const prev = new Date(calendarMonth);
                            prev.setMonth(prev.getMonth() - 1);
                            setCalendarMonth(
                              new Date(prev.getFullYear(), prev.getMonth(), 1),
                            );
                          }}
                        >
                          ←
                        </button>

                        <div className="text-sm font-semibold text-gray-900">
                          {monthLabel(calendarMonth)}
                        </div>

                        <button
                          type="button"
                          className="px-2 py-1 rounded-lg hover:bg-black/5"
                          onClick={() => {
                            const next = new Date(calendarMonth);
                            next.setMonth(next.getMonth() + 1);
                            setCalendarMonth(
                              new Date(next.getFullYear(), next.getMonth(), 1),
                            );
                          }}
                        >
                          →
                        </button>
                      </div>

                      <div className="grid grid-cols-7 text-xs text-gray-500 px-1">
                        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => (
                          <div key={w} className="py-1 text-center">
                            {w}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {buildMonthGrid(calendarMonth).map((d) => {
                          const inMonth =
                            d.getMonth() === calendarMonth.getMonth();
                          const isStart = departDate && sameDay(d, departDate);
                          const isEnd = returnDate && sameDay(d, returnDate);
                          const inRange =
                            departDate &&
                            returnDate &&
                            isBetween(d, departDate, returnDate);

                          return (
                            <button
                              key={`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`}
                              type="button"
                              onClick={() => {
                                if (!departDate || (departDate && returnDate)) {
                                  setDepartDate(d);
                                  setReturnDate(null);
                                  applyWhen(formatPretty(d)); // one-way
                                  return;
                                }

                                if (departDate && !returnDate) {
                                  if (d.getTime() < departDate.getTime()) {
                                    setDepartDate(d);
                                    applyWhen(formatPretty(d));
                                    return;
                                  }

                                  setReturnDate(d);
                                  const formatShort = (d: Date) =>
                                    `${d.getDate()} ${d.toLocaleString(undefined, { month: "short" })}`;

                                  applyWhen(
                                    `${formatShort(departDate)} – ${formatShort(d)}`,
                                  );
                                  setWhenOpen(false);
                                }
                              }}
                              className={[
                                "h-9 rounded-lg text-sm transition",
                                inMonth ? "text-gray-900" : "text-gray-400",
                                inRange ? "bg-black/10" : "hover:bg-black/5",
                                isStart || isEnd
                                  ? "bg-black text-white hover:bg-black"
                                  : "",
                              ].join(" ")}
                            >
                              {d.getDate()}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="text-xs text-gray-600">
                          {!departDate && "Select departure"}
                          {departDate &&
                            !returnDate &&
                            "Select return (optional)"}
                          {departDate && returnDate && "Dates selected"}
                        </div>

                        <button
                          type="button"
                          className="text-xs text-gray-700 hover:text-gray-900 underline"
                          onClick={clearDates}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* WHO */}
          <div className="relative">
            <button
              type="button"
              className="w-full min-h-[88px] flex flex-col justify-center rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
              onClick={() => {
                if (!whoOpen) closeAll();
                setWhoOpen((v) => !v);
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/icons/person-2.svg"
                  alt=""
                  className="h-6 w-6 opacity-70"
                  aria-hidden="true"
                />

                <div>
                  <div className="text-xs text-gray-600">Who?</div>
                  <div className="text-base font-semibold text-gray-900">
                    {who}
                  </div>
                </div>
              </div>
            </button>

            {whoOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md border border-black/10 shadow-lg">
                <div className="p-4 space-y-5">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">Adults</div>
                      <div className="text-sm text-gray-500">Aged 18+</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="h-10 w-10 rounded-xl bg-black/5 hover:bg-black/10 text-gray-900 flex items-center justify-center"
                        onClick={() => updateWho(adults - 1, children)}
                        disabled={adults <= 1}
                      >
                        −
                      </button>

                      <div className="w-6 text-center font-semibold text-gray-900">
                        {adults}
                      </div>

                      <button
                        type="button"
                        className="h-10 w-10 rounded-xl bg-black/5 hover:bg-black/10 text-gray-900 flex items-center justify-center"
                        onClick={() => updateWho(adults + 1, children)}
                        disabled={adults + children >= MAX_PAX}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        Children
                      </div>
                      <div className="text-sm text-gray-500">Aged 0 to 17</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="h-10 w-10 rounded-xl bg-black/5 hover:bg-black/10 text-gray-900 flex items-center justify-center"
                        onClick={() => updateWho(adults, children - 1)}
                        disabled={children <= 0}
                      >
                        −
                      </button>

                      <div className="w-6 text-center font-semibold text-gray-900">
                        {children}
                      </div>

                      <button
                        type="button"
                        className="h-10 w-10 rounded-xl bg-black/5 hover:bg-black/10 text-gray-900 flex items-center justify-center"
                        onClick={() => updateWho(adults, children + 1)}
                        disabled={adults + children >= MAX_PAX}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-gray-700 hover:text-gray-900 underline"
                      onClick={() => setWhoOpen(false)}
                    ></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
