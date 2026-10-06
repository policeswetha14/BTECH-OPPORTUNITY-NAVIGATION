import Link from "next/link";
import { Logo } from "./components/Logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070d19] px-5 py-12 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(14,116,144,0.18),transparent_48%),linear-gradient(145deg,#070d19,#0a1324_58%,#070d19)]" />
      <section className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-950/65 p-7 text-center shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Page not found</p>
        <p className="mt-4 text-7xl font-semibold tracking-tighter text-white sm:text-8xl">404</p>
        <h1 className="mt-4 text-xl font-semibold text-white sm:text-2xl">This page is off the map.</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
          The address may be incorrect or the page may have moved. Head back to your dashboard to continue exploring opportunities.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/dashboard" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
            Open dashboard
          </Link>
          <Link href="/" className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
