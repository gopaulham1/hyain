import type { Flight } from "../types/flight";

interface FlightCardProps {
  flight: Flight;
  selected: boolean;
  onClick: () => void;
}

function TagBadge({ tag }: { tag?: Flight["tag"] }) {
  if (!tag) return null;

  const label =
    tag === "BEST"
      ? "🔥 Best"
      : tag === "CHEAPEST"
      ? "💸 Cheapest"
      : tag === "FASTEST"
      ? "⚡ Fastest"
      : "🛫 Direct";

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-800 text-gray-100">
      {label}
    </span>
  );
}

export default function FlightCard({
  flight,
  selected,
  onClick,
}: FlightCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 cursor-pointer transition
        hover:bg-gray-800
        ${selected ? "ring-2 ring-purple-500 scale-[1.01]" : ""}
      `}
    >
      <div>
        <div className="flex items-center gap-3 mb-1">
          <p className="text-xs uppercase text-gray-400">{flight.airline}</p>
          <TagBadge tag={flight.tag} />
        </div>

        <p className="text-lg font-semibold">
          {flight.from} → {flight.to}
        </p>
        <p className="text-sm text-gray-400">{flight.duration}</p>
      </div>

      <div className="text-right">
        <p className="text-xl font-bold">{flight.price}</p>
        <p className="text-xs text-gray-400">{flight.stops}</p>
        <p className="text-xs text-gray-500 mt-1">{flight.note}</p>
      </div>
    </div>
  );
}
