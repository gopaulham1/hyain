"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { whatsOnSoonCards } from "@/data/whatsOnSoon";
import { cheapestDeals } from "@/data/cheapestDeals";
import BuildQueryCard from "./components/BuildQueryCard";
import Navbar from "./components/Navbar";

export default function Home() {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("London");
  const [to, setTo] = useState("Anywhere");
  const [when, setWhen] = useState("Flexible");
  const [who, setWho] = useState("1 traveler");

  const router = useRouter();
  function buildQuery(
    next?: Partial<{ from: string; to: string; when: string; who: string }>,
  ) {
    const f = next?.from ?? from;
    const t = next?.to ?? to;
    const w = next?.when ?? when;
    const p = next?.who ?? who;

    return `Flights from ${f} to ${t} ${w} ${p}`.replace(/\s+/g, " ").trim();
  }

  function submitSearch() {
    if (!query.trim()) return;

    router.push(`/results?query=${encodeURIComponent(query)}`);
  }

  const textHeroSub = "text-base md:text-lg text-gray-700";
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
          <Navbar />
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

                {/* Search bar */}
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex w-full items-center gap-3 rounded-full bg-white/45 border border-black/10 shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-2xl px-3 py-2 md:py-3 transition hover:border-black/20 focus-within:border-black/30 focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.55)_inset,0_10px_30px_rgba(0,0,0,0.08),0_0_0_3px_rgba(0,0,0,0.10)]">
                    <input
                      type="text"
                      placeholder="e.g. London to Istanbul next weekend"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          submitSearch();
                        }
                      }}
                      className="flex-1 min-w-0 bg-transparent px-5 py-3 md:py-3 text-base md:text-lg text-gray-900 placeholder-gray-500 focus:outline-none"
                    />
                    <button
                      onClick={submitSearch}
                      className="shrink-0 rounded-full bg-white px-6 py-2.5 md:py-3 text-black font-semibold hover:bg-white/90 transition"
                    >
                      Search
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE — compact search builder */}
              <BuildQueryCard
                from={from}
                to={to}
                when={when}
                who={who}
                setFrom={setFrom}
                setTo={setTo}
                setWhen={setWhen}
                setWho={setWho}
                setQuery={setQuery}
                buildQuery={buildQuery}
              />
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
                {whatsOnSoonCards.map((card) => (
                  <button
                    key={`${card.title}-${card.meta}`}
                    className="group relative h-36 w-full overflow-hidden rounded-2xl border border-white/30 bg-white/20 p-4 text-left transition hover:bg-white/30"
                  >
                    <Image
                      src={card.img}
                      alt={card.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] brightness-[1.12] contrast-[1.06] saturate-[0.95]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />

                    <div className="relative z-10 text-gray-900">
                      <p className="text-xl font-semibold tracking-tight text-gray-900">
                        {card.title}
                      </p>
                      <p className="text-base md:text-lg text-gray-700">
                        {card.meta}
                      </p>
                    </div>
                  </button>
                ))}
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
                {cheapestDeals.map((deal) => (
                  <button
                    key={`${deal.city}-${deal.month}-${deal.price}`}
                    className="group relative h-32 w-full overflow-hidden rounded-2xl border border-white/30 bg-white/20 text-left transition duration-300 ease-out hover:bg-white/30 hover:scale-[1.01] hover:shadow-xl hover:shadow-black/20"
                  >
                    <Image
                      src={deal.img}
                      alt={deal.alt}
                      fill
                      className="object-cover brightness-[1.15] contrast-[1.05]"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />

                    <div className="relative z-10 flex h-full items-start justify-between p-4 text-gray-900">
                      <div>
                        <p className="text-xl font-semibold text-gray-900">
                          {deal.city}
                        </p>
                        <p className="text-base md:text-lg text-gray-600">
                          {deal.month}
                        </p>
                      </div>

                      <p className="text-xl md:text-2xl font-semibold text-gray-900">
                        {deal.price}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
