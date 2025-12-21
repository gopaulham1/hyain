export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-black" />

      {/* Page container */}
      <div className="mx-auto max-w-6xl px-6 py-8 text-white">
        {/* Navbar placeholder */}
        <div className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4">
          Navbar (logo + links later)
        </div>

        {/* Hero section placeholder */}
        <div className="mt-8 rounded-[28px] border border-white/20 bg-white/10 p-10">
          Hero section (headline + search will live here)
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
