"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("London");
  const [to, setTo] = useState("Anywhere");
  const [when, setWhen] = useState("Flexible");
  const [who, setWho] = useState("1 traveler");

  const router = useRouter();
  function buildQuery(
    next?: Partial<{ from: string; to: string; when: string; who: string }>
  ) {
    const f = next?.from ?? from;
    const t = next?.to ?? to;
    const w = next?.when ?? when;
    const p = next?.who ?? who;

    return `Flights from ${f} to ${t} ${w}`.replace(/\s+/g, " ").trim();
  }

  const textHeroSub = "text-base md:text-lg text-gray-700";
  const textSectionTitle = "text-xl md:text-2xl font-semibold text-gray-900";

  const textMeta = "text-base md:text-xl text-gray-600";

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background image */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />

      {/* Dark overlay for readability */}
      <div className="fixed inset-0 -z-10 bg-black/0" />

      {/* Page container */}
      <div className="w-full px-2 md:px-4 py-8">
        <div className="mx-auto w-[min(1800px,98.5vw)]">
          {/* Navbar placeholder */}
          <nav className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="hyain-serif text-4xl font-semibold tracking-tight text-gray-900">
              Hyain
            </div>

            {/* Middle: links (hide on mobile for now) */}
            <div className="hidden sm:flex items-center gap-8 text-base md:text-lg text-gray-700">
              <button className="hover:text-gray-900 transition">About</button>
              <button className="hover:text-gray-900 transition">
                ♡ Saved
              </button>
            </div>

            {/* Right: Sign in */}
            <button className="rounded-full border border-black/10 bg-white/70 px-5 py-2.5 text-base md:text-lg font-semibold text-gray-900 backdrop-blur hover:bg-white/90 transition">
              Sign in
            </button>
          </nav>

          {/* Hero section placeholder */}
          <div className="mt-8 rounded-[28px] p-10 hyain-glass-light-strong">
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
              {/* LEFT SIDE — text + search */}
              <div>
                <h1 className="hyain-serif text-4xl md:text-6xl font-medium tracking-tight mb-4 text-gray-900">
                  Discover Your Next Journey
                </h1>

                <p className={`${textHeroSub} mb-6`}>
                  Search flights the easy way
                </p>

                {/* Search bar (UI only for now) */}
                {/* Search bar (UI only for now) */}
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex w-full items-center gap-3 rounded-full bg-white/45 border border-black/10 shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl px-3 py-2 md:py-3 transition hover:border-black/20 focus-within:border-black/30 focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_10px_30px_rgba(0,0,0,0.08),0_0_0_3px_rgba(0,0,0,0.10)]">
                    <input
                      type="text"
                      placeholder="e.g. London to Istanbul next weekend"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 min-w-0 bg-transparent px-5 py-3 md:py-3 text-base md:text-lg text-gray-900 placeholder-gray-500 focus:outline-none"
                    />

                    <button
                      onClick={() =>
                        router.push(
                          `/results?query=${encodeURIComponent(query)}`
                        )
                      }
                      className="shrink-0 rounded-full bg-white px-6 py-2.5 md:py-3 text-black font-semibold hover:bg-white/90 transition"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE — placeholder card */}
              {/* RIGHT SIDE — compact search builder */}
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
                      <div className="text-[11px] text-gray-600">
                        Where from?
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {from}{" "}
                        <span className="text-gray-500 font-normal">(Any)</span>
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
                      <div className="text-sm font-semibold text-gray-900">
                        {to}
                      </div>
                    </button>
                  </div>

                  {/* Row 2 */}
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
                      <div className="text-sm font-semibold text-gray-900">
                        {when}
                      </div>
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
                      <div className="text-sm font-semibold text-gray-900">
                        {who}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom sections */}
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 rounded-[28px] p-10 hyain-glass-light">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="hyain-serif tracking-tight text-xl md:text-2xl font-extrabold text-gray-900">
                    What’s on soon
                  </h2>

                  <p className={`mt-1 ${textMeta}`}>
                    Top destinations from you
                  </p>
                </div>

                <button className="text-base md:text-lg font-semibold text-gray-700 hover:text-gray-900 transition">
                  Find flights for this →
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* Card 1 */}
                <button className="group relative h-36 w-full overflow-hidden rounded-2xl border border-white/30 bg-white/20 p-4 text-left transition hover:bg-white/30">
                  {/* Background image */}
                  <Image
                    src="/images/rio3.jpg"
                    alt="Rio de Janeiro"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] brightness-[1.12] contrast-[1.06] saturate-[0.95]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Overlay (top text readable) */}

                  {/* Text */}
                  <div className="relative z-10 text-gray-900">
                    <p className="text-xl font-semibold tracking-tight text-gray-900">
                      Carnival
                    </p>
                    <p className="text-base md:text-lg text-gray-700">
                      Feb · Rio
                    </p>
                  </div>
                </button>

                {/* Card 2 */}
                <button className="group relative h-36 w-full overflow-hidden rounded-2xl border border-white/30 bg-white/20 p-4 text-left transition hover:bg-white/30">
                  {/* Background image */}
                  <Image
                    src="/images/tokyo2.jpg"
                    alt="Cherry Blossoms"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] brightness-[1.12] contrast-[1.06] saturate-[0.95]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Overlay (top text readable) */}

                  {/* Text */}
                  <div className="relative z-10 text-gray-900">
                    <p className="text-xl font-semibold tracking-tight text-gray-900">
                      Cherry Blossoms
                    </p>
                    <p className="text-base md:text-lg text-gray-700">
                      Mar – Apr · Tokyo
                    </p>
                  </div>
                </button>

                {/* Card 3 */}
                <button className="group relative h-36 w-full overflow-hidden rounded-2xl border border-white/30 bg-white/20 p-4 text-left transition hover:bg-white/30">
                  {/* Background image */}
                  <Image
                    src="/images/london2.jpg"
                    alt="London"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] brightness-[1.12] contrast-[1.06] saturate-[0.95]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Overlay (top text readable) */}

                  {/* Text */}
                  <div className="relative z-10 text-gray-900">
                    <p className="text-xl font-semibold tracking-tight text-gray-900">
                      Winter Wonderland
                    </p>
                    <p className="text-base md:text-lg text-gray-700">
                      Nov – Jan · London
                    </p>
                  </div>
                </button>

                {/* Card 4 */}
                <button className="group relative h-36 w-full overflow-hidden rounded-2xl border border-white/30 bg-white/20 p-4 text-left transition hover:bg-white/30">
                  {/* Background image */}
                  <Image
                    src="/images/prague.jpg"
                    alt="Prague"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03] brightness-[1.12] contrast-[1.06] saturate-[0.95]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Overlay (top text readable) */}

                  {/* Text */}
                  <div className="relative z-10 text-gray-900">
                    <p className="text-xl font-semibold tracking-tight text-gray-900">
                      Christmas Markets
                    </p>
                    <p className="text-base md:text-lg text-gray-700">
                      Nov - Dec · Prague
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-[28px] p-8 hyain-glass-light-soft-solid overflow-hidden lg:min-h-[360px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="hyain-serif tracking-tight text-xl md:text-2xl font-extrabold text-gray-900">
                    Cheapest from London LTN
                  </h2>

                  <p className="mt-1 text-base md:text-lg font-semibold text-gray-600">
                    This week or so
                  </p>
                </div>

                <button className="text-base md:text-lg font-semibold text-gray-700 hover:text-gray-900 transition">
                  See weekend trips →
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {/* Item 1 */}
                <button className="group relative h-32 w-full overflow-hidden rounded-2xl border border-white/30 bg-white/20 text-left transition duration-300 ease-out hover:bg-white/30 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20">
                  {/* Background image */}
                  <Image
                    src="/images/paris.jpg"
                    alt="Paris"
                    fill
                    className="object-cover brightness-[1.15] contrast-[1.05]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Gradient overlay */}

                  {/* Content */}
                  <div className="relative z-10 flex h-full items-start justify-between p-4 text-gray-900">
                    <div>
                      <p className="text-xl font-semibold text-gray-900">
                        Paris
                      </p>
                      <p className="text-base md:text-lg text-gray-600">Feb</p>
                    </div>
                    <p className="text-xl md:text-2xl font-semibold text-gray-900">
                      £24
                    </p>
                  </div>
                </button>

                {/* Item 2 */}
                <button className="group relative h-32 w-full overflow-hidden rounded-2xl border border-white/30 bg-white/20 text-left transition duration-300 ease-out hover:bg-white/30 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20">
                  {/* Background image */}
                  <Image
                    src="/images/rome.jpg"
                    alt="Rome"
                    fill
                    className="object-cover brightness-[1.15] contrast-[1.05]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Gradient overlay */}

                  {/* Content */}
                  <div className="relative z-10 flex h-full items-start justify-between p-4 text-gray-900">
                    <div>
                      <p className="text-xl font-semibold text-gray-900">
                        Rome
                      </p>
                      <p className="text-base md:text-lg text-gray-600">Jan</p>
                    </div>

                    <p className="text-xl md:text-2xl font-semibold text-gray-900">
                      £39
                    </p>
                  </div>
                </button>

                {/* Item 3 */}
                <button className="group relative h-32 w-full overflow-hidden rounded-2xl border border-white/30 bg-white/20 text-left transition duration-300 ease-out hover:bg-white/30 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20">
                  {/* Background image */}
                  <Image
                    src="/images/barcelona.jpg"
                    alt="Barcelona"
                    fill
                    className="object-cover brightness-[1.15] contrast-[1.05]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Gradient overlay */}

                  {/* Content */}
                  <div className="relative z-10 flex h-full items-start justify-between p-4 text-gray-900">
                    <div>
                      <p className="text-xl font-semibold text-gray-900">
                        Barcelona
                      </p>
                      <p className="text-base md:text-lg text-gray-600">Nov</p>
                    </div>

                    <p className="text-xl md:text-2xl font-semibold text-gray-900">
                      £55
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
