"use client";

import { useState } from "react";

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
    }>
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

  const fromOptions = [
    "London",
    "Anywhere",
    "Paris",
    "Dubai",
    "Rome",
    "Istanbul",
  ];
  const [toOpen, setToOpen] = useState(false);

  const toOptions = [
    "London",
    "Anywhere",
    "Paris",
    "Dubai",
    "Rome",
    "Istanbul",
  ];

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
    i === 0 ? "1 traveler" : `${i + 1} travelers`
  );

  return (
    <div className="rounded-[28px] p-6 hyain-glass-light-soft-solid">
      <div className="mt-2 space-y-3">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <button
              type="button"
              className="w-full rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
              onClick={() => setFromOpen((v) => !v)}
            >
              <div className="text-[11px] text-gray-600">Where from?</div>
              <div className="text-sm font-semibold text-gray-900">
                {from} <span className="text-gray-500 font-normal">(Any)</span>
              </div>
            </button>

            {fromOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md border border-black/10 shadow-lg">
                {fromOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-black/5 transition"
                    onClick={() => {
                      setFrom(option);
                      setQuery(buildQuery({ from: option }));
                      setFromOpen(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              className="w-full rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
              onClick={() => setToOpen((v) => !v)}
            >
              <div className="text-[11px] text-gray-600">Where to?</div>
              <div className="text-sm font-semibold text-gray-900">{to}</div>
            </button>

            {toOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md border border-black/10 shadow-lg">
                {toOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm text-gray-900 hover:bg-black/5 transition"
                    onClick={() => {
                      setTo(option);
                      setQuery(buildQuery({ to: option }));
                      setToOpen(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
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
