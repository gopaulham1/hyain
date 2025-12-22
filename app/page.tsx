"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const textHeroSub = "text-base md:text-lg text-white/80";
  const textSectionTitle = "text-lg md:text-xl font-semibold text-white";
  const textMeta = "text-sm md:text-base text-white";

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background image */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      />

      {/* Dark overlay for readability */}
      <div className="fixed inset-0 -z-10 bg-black/30" />

      {/* Page container */}
      <div className="w-full px-2 md:px-4 py-8 text-white">
        <div className="mx-auto w-[min(1800px,98.5vw)]">
          {/* Navbar placeholder */}
          <nav className="flex items-center justify-between">
            {/* Left: Logo */}
            <div className="hyain-serif text-3xl font-semibold tracking-tight text-white">
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
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
              {/* LEFT SIDE — text + search */}
              <div>
                <h1 className="hyain-serif text-4xl md:text-6xl font-medium tracking-tight mb-4 text-white/90">
                  Discover Your Next Journey
                </h1>

                <p className={`${textHeroSub} mb-6`}>
                  Search flights the easy way
                </p>

                {/* Search bar (UI only for now) */}
                {/* Search bar (UI only for now) */}
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex w-full items-center gap-3 rounded-full border border-white/25 bg-white/20 backdrop-blur px-3 py-2 md:py-3">
                    <input
                      type="text"
                      placeholder="e.g. London to Istanbul next weekend"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 min-w-0 bg-transparent px-5 py-3 md:py-3 text-base md:text-lg text-white/95 placeholder-white/75 focus:outline-none"
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
              <div className="rounded-[28px] p-6 hyain-glass border border-white/15 shadow-xl shadow-black/30">
                Cheapest deals card (coming next)
              </div>
            </div>
          </div>

          {/* Bottom sections */}
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8 rounded-[28px] p-10 hyain-glass border border-white/20 bg-black/20 shadow-xl shadow-black/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    className={`hyain-serif tracking-tight ${textSectionTitle}`}
                  >
                    What’s on soon
                  </h2>
                  <p className={`mt-1 ${textMeta}`}>
                    Top destinations from you
                  </p>
                </div>

                <button className="text-sm md:text-base text-white hover:text-white transition">
                  Find flights for this →
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {/* Card 1 */}
                <button className="group relative h-36 w-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 text-left transition hover:bg-white/15">
                  {/* Background image */}
                  <Image
                    src="/images/rio.jpg"
                    alt="Rio de Janeiro"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Overlay (top text readable) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/10" />

                  {/* Text */}
                  <div className="relative z-10">
                    <p className="text-lg font-semibold tracking-tight">
                      Carnival
                    </p>
                    <p className="text-sm md:text-base text-white/90">
                      Feb · Rio
                    </p>
                  </div>
                </button>

                {/* Card 2 */}
                <button className="group relative h-36 w-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 text-left transition hover:bg-white/15">
                  {/* Background image */}
                  <Image
                    src="/images/tokyo.jpg"
                    alt="Cherry Blossoms"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Overlay (top text readable) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/10" />

                  {/* Text */}
                  <div className="relative z-10">
                    <p className="text-lg font-semibold tracking-tight">
                      Cherry Blossoms
                    </p>
                    <p className="text-sm md:text-base text-white/90">
                      Mar – Apr · Tokyo
                    </p>
                  </div>
                </button>

                {/* Card 3 */}
                <button className="group relative h-36 w-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 text-left transition hover:bg-white/15">
                  {/* Background image */}
                  <Image
                    src="/images/kyoto.jpg"
                    alt="Kyoto"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Overlay (top text readable) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/10" />

                  {/* Text */}
                  <div className="relative z-10">
                    <p className="text-lg font-semibold tracking-tight">
                      Cherry Blossoms
                    </p>
                    <p className="text-sm md:text-base text-white/90">
                      Mar – Apr · Kyoto
                    </p>
                  </div>
                </button>

                {/* Card 4 */}
                <button className="group relative h-36 w-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-4 text-left transition hover:bg-white/15">
                  {/* Background image */}
                  <Image
                    src="/images/munich.jpg"
                    alt="Munich"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Overlay (top text readable) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/10" />

                  {/* Text */}
                  <div className="relative z-10">
                    <p className="text-lg font-semibold tracking-tight">
                      Carnival
                    </p>
                    <p className="text-sm md:text-base text-white/90">
                      Sep · Munich
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 rounded-[28px] p-8 hyain-glass border border-white/20 bg-black/25 shadow-xl shadow-black/40 overflow-hidden lg:min-h-[360px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    className={`hyain-serif tracking-tight ${textSectionTitle}`}
                  >
                    Cheapest from London LTN
                  </h2>
                  <p className={`mt-1 ${textMeta}`}>This week or so</p>
                </div>

                <button className="text-sm md:text-base text-white hover:text-white transition">
                  See weekend trips →
                </button>
              </div>

              <div className="mt-5 space-y-3">
                {/* Item 1 */}
                <button className="group relative h-32 w-full overflow-hidden rounded-2xl border border-white/15 text-left transition duration-300 ease-out hover:bg-white/15 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/30">
                  {/* Background image */}
                  <Image
                    src="/images/paris.jpg"
                    alt="Paris"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="relative z-10 flex h-full items-start justify-between p-4">
                    <div>
                      <p className="text-lg font-semibold">Paris</p>
                      <p className="text-sm md:text-base text-white/90">Feb</p>
                    </div>

                    <p className="text-lg md:text-xl font-semibold text-white">
                      £24
                    </p>
                  </div>
                </button>

                {/* Item 2 */}
                <button className="group relative h-32 w-full overflow-hidden rounded-2xl border border-white/15 text-left transition duration-300 ease-out hover:bg-white/15 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/30">
                  {/* Background image */}
                  <Image
                    src="/images/rome.jpg"
                    alt="Rome"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="relative z-10 flex h-full items-start justify-between p-4">
                    <div>
                      <p className="text-lg font-semibold">Rome</p>
                      <p className="text-sm md:text-base text-white/90">Jan</p>
                    </div>

                    <p className="text-lg md:text-xl font-semibold text-white">
                      £39
                    </p>
                  </div>
                </button>

                {/* Item 3 */}
                <button className="group relative h-32 w-full overflow-hidden rounded-2xl border border-white/15 text-left transition duration-300 ease-out hover:bg-white/15 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/30">
                  {/* Background image */}
                  <Image
                    src="/images/barcelona.jpg"
                    alt="Barcelona"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent" />

                  {/* Content */}
                  <div className="relative z-10 flex h-full items-start justify-between p-4">
                    <div>
                      <p className="text-lg font-semibold">Barcelona</p>
                      <p className="text-sm md:text-base text-white/90">Nov</p>
                    </div>

                    <p className="text-lg md:text-xl font-semibold text-white">
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
