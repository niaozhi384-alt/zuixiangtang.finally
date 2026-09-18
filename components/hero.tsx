import Link from "next/link";
import { Seal } from "@/components/seal";

export function Hero() {
  return (
    <section className="ink-wash relative overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:py-32">
        <div className="hero-rise flex justify-center">
          <Seal size={64} glow />
        </div>

        <h1 className="hero-rise-delay-1 mt-8 font-serif text-6xl font-bold leading-tight tracking-[0.12em] text-jade-900 sm:text-7xl">
            醉乡堂
        </h1>

        <p className="hero-rise-delay-2 mx-auto mt-7 max-w-xl font-serif text-lg leading-relaxed text-ink-soft sm:text-xl">
          醉月频中圣，迷花不事君。
          <br />
          <span className="text-jade-800">
            五湖四海皆兄弟，醉乡堂里认神州。
          </span>
        </p>

        <div className="hero-rise-delay-3 mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/league"
            className="inline-flex items-center justify-center rounded-md bg-jade-800 px-7 py-3 text-sm tracking-[0.2em] text-paper transition-all hover:-translate-y-0.5 hover:bg-jade-900 hover:shadow-lg"
          >
            报名联赛
          </Link>
          <Link
            href="/#join"
            className="inline-flex items-center justify-center rounded-md border border-gold-500/70 px-7 py-3 text-sm tracking-[0.2em] text-gold-600 transition-all hover:-translate-y-0.5 hover:bg-gold-100/60"
          >
            加入部落
          </Link>
        </div>
      </div>
    </section>
  );
}
