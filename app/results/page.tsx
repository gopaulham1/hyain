"use client";

import type { Flight } from "../types/flight";
import FlightCard from "../components/FlightCard";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [results, setResults] = useState<Flight[]>([]);
  const [allResults, setAllResults] = useState<Flight[]>([]);

  // loading + error state for Day 6
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 🧠 Optional: remember which card was clicked
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFlights() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/flights?query=${encodeURIComponent(query)}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch flights");
        }

        const data = await res.json();

        setAllResults(data);
        setResults(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Could not load flights right now.");
        setLoading(false);
      }
    }

    fetchFlights();
  }, [query]);

  function showCheapest() {
    if (results.length === 0) return;

    const cheapest = [...results].sort(
      (a, b) =>
        Number(a.price.replace("£", "")) - Number(b.price.replace("£", ""))
    )[0];

    setResults([cheapest]);
  }

  function showAll() {
    setResults(allResults);
  }

  function handleCardClick(flight: Flight) {
    setSelectedAirline(flight.airline);
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Search Results</h1>

        <p className="text-gray-300 mb-6">
          You searched for: <span className="font-semibold">{query}</span>
        </p>

        <p className="text-sm text-gray-400 mb-4">
          Hyain’s smart engine picked a few options that balance price,
          convenience, and travel time:
        </p>

        {/* 🔘 Filter buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={showAll}
            className="px-4 py-2 rounded-full bg-gray-800 text-sm hover:bg-gray-700 transition"
          >
            Show all
          </button>
          <button
            onClick={showCheapest}
            className="px-4 py-2 rounded-full bg-purple-600 text-sm hover:bg-purple-500 transition"
          >
            Show cheapest only
          </button>
        </div>

        {loading && (
          <p className="text-gray-400 mb-6 animate-pulse">
            Fetching flights for your search...
          </p>
        )}

        {error && <p className="text-red-400 mb-6">{error}</p>}

        {!loading && results.length === 0 && !error && (
          <p className="text-gray-400 mb-6">
            No flights found for this search. Try different dates or airports.
          </p>
        )}

        <div className="space-y-4">
          {results.map((flight, index) => (
            <FlightCard
              key={index}
              flight={flight}
              selected={selectedAirline === flight.airline}
              onClick={() => handleCardClick(flight)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
