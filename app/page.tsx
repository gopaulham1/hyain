"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  return (
    <main className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-black" />

      {/* Page container */}
      <div className="mx-auto max-w-6xl px-6 py-8 text-white">
        {/* Navbar placeholder */}
        <nav className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="text-3xl font-semibold tracking-tight text-white">
            Hyain
          </div>

          {/* Middle: links (hide on mobile for now) */}
          <div className="hidden sm:flex items-center gap-8 text-white/80">
            <button className="hover:text-white transition">About</button>
            <button className="hover:text-white transition">♡ Saved</button>
          </div>

          {/* Right: Sign in */}
          <button className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-white backdrop-blur hover:bg-white/15 transition">
            Sign in
          </button>
        </nav>

        {/* Hero section placeholder */}
        <div className="mt-8 rounded-[28px] border border-white/20 bg-white/10 p-10">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* LEFT SIDE — text + search */}
            <div className="lg:col-span-8">
              <h1 className="text-4xl md:text-5xl font-semibold mb-4">
                Discover Your Next Journey
              </h1>

              <p className="text-gray-300 mb-6">Search flights the easy way</p>

              {/* Search bar (UI only for now) */}
              <div className="flex gap-2 max-w-xl">
                <input
                  type="text"
                  placeholder="e.g. London to Istanbul next weekend"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none"
                />

                <button
                  onClick={() =>
                    router.push(`/results?query=${encodeURIComponent(query)}`)
                  }
                  className="px-4 py-3 bg-white text-black font-semibold rounded-lg"
                >
                  Search
                </button>
              </div>
            </div>

            {/* RIGHT SIDE — placeholder card */}
            <div className="lg:col-span-4 rounded-2xl border border-white/20 bg-white/10 p-6 text-sm text-gray-300">
              Cheapest deals card (coming next)
            </div>
          </div>
        </div>

        {/* Bottom sections */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 rounded-[28px] border border-white/20 bg-white/10 p-8">
            Left section (What’s on soon)
          </div>

          <div className="lg:col-span-4 rounded-[28px] border border-white/20 bg-white/10 p-8">
            Right section (Cheapest deals)
          </div>
        </div>
      </div>
    </main>
  );
}
