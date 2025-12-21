"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background image */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />

      {/* Dark overlay for readability */}
      <div className="fixed inset-0 -z-10 bg-black/40" />

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
        <div className="mt-8 rounded-[28px] p-10 hyain-glass border border-white/15 shadow-xl shadow-black/30">
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
            <div className="lg:col-span-4 rounded-[28px] p-6 hyain-glass border border-white/15 shadow-xl shadow-black/30">
              Cheapest deals card (coming next)
            </div>
          </div>
        </div>

        {/* Bottom sections */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 rounded-[28px] p-8 hyain-glass border border-white/15 shadow-xl shadow-black/30">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  What’s on soon
                </h2>
                <p className="mt-1 text-sm text-white/70">
                  Top destinations from you
                </p>
              </div>

              <button className="text-sm text-white/80 hover:text-white transition">
                Find flights for this →
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* Card 1 */}
              <button className="group rounded-2xl border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15 transition">
                <p className="text-lg font-semibold tracking-tight">Carnival</p>
                <p className="text-sm text-white/70">Feb</p>
                <div className="mt-3 h-20 rounded-xl bg-white/10" />
              </button>

              {/* Card 2 */}
              <button className="group rounded-2xl border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15 transition">
                <p className="text-lg font-semibold tracking-tight">
                  Cherry Blossoms
                </p>
                <p className="text-sm text-white/70">Mar – Apr</p>
                <div className="mt-3 h-20 rounded-xl bg-white/10" />
              </button>

              {/* Card 3 */}
              <button className="group rounded-2xl border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15 transition">
                <p className="text-lg font-semibold tracking-tight">
                  Cherry Blossoms
                </p>
                <p className="text-sm text-white/70">Mar – Apr</p>
                <div className="mt-3 h-20 rounded-xl bg-white/10" />
              </button>

              {/* Card 4 */}
              <button className="group rounded-2xl border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15 transition">
                <p className="text-lg font-semibold tracking-tight">
                  Oktoberfest
                </p>
                <p className="text-sm text-white/70">Sep</p>
                <div className="mt-3 h-20 rounded-xl bg-white/10" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-[28px] p-8 hyain-glass border border-white/15 shadow-xl shadow-black/30 overflow-hidden lg:min-h-[360px]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Cheapest from London LTN
                </h2>
                <p className="mt-1 text-sm text-white/70">This week or so</p>
              </div>

              <button className="text-sm text-white/80 hover:text-white transition">
                See weekend trips →
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {/* Item 1 */}
              <button className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15 transition">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold tracking-tight">
                      Paris
                    </p>
                    <p className="text-sm text-white/70">Feb</p>
                  </div>
                  <p className="text-lg font-semibold">£24</p>
                </div>
                <div className="mt-3 h-16 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10" />
              </button>

              {/* Item 2 */}
              <button className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15 transition">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold tracking-tight">Rome</p>
                    <p className="text-sm text-white/70">Mar – Apr</p>
                  </div>
                  <p className="text-lg font-semibold">£29</p>
                </div>
                <div className="mt-3 h-16 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10" />
              </button>

              {/* Item 3 */}
              <button className="w-full rounded-2xl border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15 transition">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold tracking-tight">
                      Barcelona
                    </p>
                    <p className="text-sm text-white/70">Sep</p>
                  </div>
                  <p className="text-lg font-semibold">£33</p>
                </div>
                <div className="mt-3 h-16 rounded-xl bg-gradient-to-r from-white/10 to-white/5 border border-white/10" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
