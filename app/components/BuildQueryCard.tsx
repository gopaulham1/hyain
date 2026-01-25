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
  const [fromStage, setFromStage] = useState<"region" | "city">("region");
  const [fromRegion, setFromRegion] = useState<
    "Europe" | "Asia" | "USA" | "Everywhere else" | null
  >(null);

  const [toOpen, setToOpen] = useState(false);
  const [toStage, setToStage] = useState<"region" | "city">("region");
  const [toRegion, setToRegion] = useState<
    "Europe" | "Asia" | "USA" | "Everywhere else" | null
  >(null);

  const cardRef = useRef<HTMLDivElement | null>(null);

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

  const REGION_CITIES: Record<
    "Europe" | "Asia" | "USA" | "Everywhere else",
    string[]
  > = {
    Europe: ["London", "Paris", "Milan", "Barcelona"],
    USA: ["New York", "California", "Texas", "Florida"],
    Asia: ["China", "India", "Dubai", "Maldives"],
    "Everywhere else": ["Africa", "South America", "Australia", "Russia"],
  };

  const [whenOpen, setWhenOpen] = useState(false);
  const whenOptions = [
    "Anytime",
    "Next week",
    "Next month",
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
  ];

  const [whoOpen, setWhoOpen] = useState(false);
  const whoOptions = Array.from({ length: 9 }, (_, i) =>
    i === 0 ? "1 traveler" : `${i + 1} travelers`,
  );

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
              className="w-full rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
              onClick={() => {
                setFromOpen((v) => {
                  const next = !v;
                  if (next) {
                    setFromStage("region");
                    setFromRegion(null);
                    setToOpen(false);
                  }
                  return next;
                });
              }}
            >
              <div className="text-[11px] text-gray-600">Where from?</div>
              <div className="text-sm font-semibold text-gray-900">
                {from} <span className="text-gray-500 font-normal">(Any)</span>
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
                          setFromStage("city");
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
                {fromStage === "city" && fromRegion && (
                  <div>
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <button
                        type="button"
                        className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition"
                        onClick={() => {
                          setFromStage("region");
                          setFromRegion(null);
                        }}
                      >
                        ← Back
                      </button>

                      <div className="text-sm font-semibold text-gray-900">
                        {fromRegion}
                      </div>

                      <div className="w-10" />
                    </div>

                    <div className="pb-3">
                      {REGION_CITIES[fromRegion].map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-black/5 transition"
                          onClick={() => {
                            setFrom(option);
                            setQuery(buildQuery({ from: option }));
                            setFromOpen(false);
                            setFromStage("region");
                            setFromRegion(null);
                          }}
                        >
                          {option}
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
              className="w-full rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
              onClick={() => {
                setToOpen((v) => {
                  const next = !v;
                  if (next) {
                    setToStage("region");
                    setToRegion(null);
                    setFromOpen(false); // closes the other dropdown (nice UX)
                  }
                  return next;
                });
              }}
            >
              <div className="text-[11px] text-gray-600">Where to?</div>
              <div className="text-sm font-semibold text-gray-900">{to}</div>
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
                          setToStage("city");
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

                {/* STAGE 2: CITIES */}
                {toStage === "city" && toRegion && (
                  <div>
                    <div className="flex items-center justify-between px-4 pt-4 pb-2">
                      <button
                        type="button"
                        className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition"
                        onClick={() => {
                          setToStage("region");
                          setToRegion(null);
                        }}
                      >
                        ← Back
                      </button>

                      <div className="text-sm font-semibold text-gray-900">
                        {toRegion}
                      </div>

                      <div className="w-10" />
                    </div>

                    <div className="pb-3">
                      {REGION_CITIES[toRegion].map((option) => (
                        <button
                          key={option}
                          type="button"
                          className="border border-black/10 bg-white hover:bg-black/5 transition p-6"
                          onClick={() => {
                            setTo(option);
                            setQuery(buildQuery({ to: option }));
                            setToOpen(false);
                            setToStage("region");
                            setToRegion(null);
                          }}
                        >
                          {option}
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
              className="w-full rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
              onClick={() => setWhenOpen((v) => !v)}
            >
              <div className="text-[11px] text-gray-600">When?</div>
              <div className="text-sm font-semibold text-gray-900">{when}</div>
              <div className="text-xs text-gray-500">
                Flexible dates get cheaper flights
              </div>
            </button>

            {whenOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md border border-black/10 shadow-lg">
                {whenOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-black/5 transition"
                    onClick={() => {
                      setWhen(option);
                      setQuery(buildQuery({ when: option }));
                      setWhenOpen(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* WHO */}
          <div className="relative">
            <button
              type="button"
              className="w-full rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
              onClick={() => setWhoOpen((v) => !v)}
            >
              <div className="text-[11px] text-gray-600">Who?</div>
              <div className="text-sm font-semibold text-gray-900">{who}</div>
            </button>

            {whoOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md border border-black/10 shadow-lg">
                {whoOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-black/5 transition"
                    onClick={() => {
                      setWho(option);
                      setQuery(buildQuery({ who: option }));
                      setWhoOpen(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
