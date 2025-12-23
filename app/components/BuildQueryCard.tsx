"use client";

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
  return (
    <div className="rounded-[28px] p-6 hyain-glass-light-soft-solid">
      <div className="mt-2 space-y-3">
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            className="rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
            onClick={() => {
              setFrom("London");
              setQuery(buildQuery({ from: "London" }));
            }}
          >
            <div className="text-[11px] text-gray-600">Where from?</div>
            <div className="text-sm font-semibold text-gray-900">
              {from} <span className="text-gray-500 font-normal">(Any)</span>
            </div>
          </button>

          <button
            className="rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
            onClick={() => {
              setTo("Anywhere");
              setQuery(buildQuery({ to: "Anywhere" }));
            }}
          >
            <div className="text-[11px] text-gray-600">Where to?</div>
            <div className="text-sm font-semibold text-gray-900">{to}</div>
          </button>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            className="rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
            onClick={() => {
              setWhen("Flexible");
              setQuery(buildQuery({ when: "Flexible" }));
            }}
          >
            <div className="text-[11px] text-gray-600">When?</div>
            <div className="text-sm font-semibold text-gray-900">{when}</div>
            <div className="text-xs text-gray-500">
              Flexible dates get cheaper flights
            </div>
          </button>

          <button
            className="rounded-2xl bg-white/60 border border-black/10 px-4 py-2.5 text-left hover:bg-white/70 transition"
            onClick={() => {
              setWho("1 traveler");
              setQuery(buildQuery({ who: "1 traveler" }));
            }}
          >
            <div className="text-[11px] text-gray-600">Who?</div>
            <div className="text-sm font-semibold text-gray-900">{who}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
