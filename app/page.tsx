"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">
        Hyain – AI Flight Search
      </h1>
      <p className="text-lg text-gray-300 mb-8">
        Search smarter. Travel cheaper.
      </p>

      <div className="flex items-center gap-2 w-full max-w-md">
        <input
          type="text"
          placeholder="e.g. London to Istanbul next weekend"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none"
        />

        <button
          onClick={() => {
            router.push(`/results?query=${encodeURIComponent(query)}`);
          }}
          className="px-4 py-3 bg-white text-black font-semibold rounded-lg"
        >
          Search
        </button>
      </div>
    </main>
  );
}
