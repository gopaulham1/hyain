"use client";

import type { Flight } from "../types/flight";
import Image from "next/image";

interface FlightCardProps {
  flight: Flight;
  selected: boolean;
  onClick: () => void;
}

function TagPill({ tag }: { tag?: Flight["tag"] }) {
  if (!tag) return null;

  const text =
    tag === "BEST"
      ? "BEST MATCH"
      : tag === "CHEAPEST"
        ? "CHEAPEST"
        : tag === "FASTEST"
          ? "FASTEST"
          : "DIRECT";

  return (
    <span className="inline-flex max-w-full items-center justify-center whitespace-nowrap rounded-full bg-black/10 border border-black/10 px-3 py-[3px] text-[10px] tracking-wide font-semibold text-gray-800">
      {text}
    </span>
  );
}

function AirlineLogo({ airline }: { airline: string }) {
  const a = airline.toLowerCase();

  let src = "";

  if (a.includes("easy")) src = "/airlines/easyjet.jpg";
  else if (a.includes("wizz")) src = "/airlines/wizzair.jpg";
  else if (a.includes("ryan")) src = "/airlines/ryanair.jpg";
  else if (a.includes("vueling")) src = "/airlines/vueling.jpg";
  else if (a.includes("klm")) src = "/airlines/klm.png";
  else if (a.includes("france")) src = "/airlines/air-france.png";
  else if (a.includes("lufthansa")) src = "/airlines/lufty.png";
  else if (a.includes("qatar")) src = "/airlines/qatari.png";
  else if (a.includes("turkish")) src = "/airlines/turkish.jpg";
  else if (a.includes("ita")) src = "/airlines/ita.jpg";
  else if (a.includes("lot")) src = "/airlines/lot.jpg";
  else if (a.includes("pegasus")) src = "/airlines/pegasus.jpg";
  else if (a.includes("british") || a === "ba") src = "/airlines/ba.jpg";

  if (!src) {
    return (
      <span className="text-sm font-semibold text-gray-700">{airline}</span>
    );
  }

  return (
    <Image
      src={src}
      alt={airline}
      width={64}
      height={28}
      className="object-contain"
    />
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function computeDuration(departure: string, arrival: string) {
  const diff = new Date(arrival).getTime() - new Date(departure).getTime();

  const minutes = Math.max(0, Math.floor(diff / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${h}h ${m}m`;
}

export default function FlightCard({
  flight,
  selected,
  onClick,
}: FlightCardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        "rounded-2xl border border-white/35 bg-white/40 backdrop-blur-m",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.50)_inset,0_10px_30px_rgba(0,0,0,0.08)]",
        "px-5 py-4 transition cursor-pointer",
        "hover:bg-white/70",
        selected ? "ring-2 ring-black/20" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-4">
        {/* LEFT */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-20 shrink-0 flex flex-col items-center gap-2">
            <div className="w-full flex justify-center">
              <TagPill tag={flight.tag} />
            </div>

            <div className="h-9 w-20 flex items-center justify-center">
              <AirlineLogo airline={flight.airline} />
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-lg md:text-xl font-semibold text-gray-900 truncate">
              {flight.from} – {flight.to}
            </p>

            <p className="mt-1 text-sm md:text-base text-gray-700">
              <span className="font-semibold text-gray-900">
                {formatTime(flight.departureTime)} →{" "}
                {formatTime(flight.arrivalTime)}
              </span>
              <span className="mx-2 text-gray-400">·</span>
              <span>{formatDate(flight.departureTime)}</span>
            </p>

            <p className="mt-0.5 text-sm text-gray-600">
              {computeDuration(flight.departureTime, flight.arrivalTime)} ·{" "}
              {flight.stops}
            </p>

            {flight.note && (
              <p className="mt-2 text-xs md:text-sm text-gray-700">
                {flight.note}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <p className="text-2xl md:text-3xl font-semibold text-gray-900">
            {flight.price}
          </p>

          <button className="rounded-full bg-[#23435a]/90 px-6 py-2.5 text-white font-semibold hover:bg-[#23435a] transition">
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
