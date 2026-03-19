import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between">
      <Link
        href="/"
        className="hyain-serif text-4xl font-semibold tracking-tight text-gray-900 hover:opacity-80 transition"
      >
        Hyain
      </Link>

      <div className="hidden sm:flex items-center gap-8 text-base md:text-lg text-gray-700">
        <button className="hover:text-gray-900 transition">About</button>
      </div>

      <button className="rounded-full border border-black/10 bg-white/70 px-5 py-2.5 text-base md:text-lg font-semibold text-gray-900 backdrop-blur hover:bg-white/90 transition">
        Sign in
      </button>
    </nav>
  );
}
