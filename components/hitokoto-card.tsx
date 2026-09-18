import { Quote } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { getDailyHitokoto } from "@/lib/hitokoto";

export async function HitokotoCard() {
  const hitokoto = await getDailyHitokoto();

  return (
    <section className="relative py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal>
          <figure className="relative overflow-hidden rounded-lg border border-line bg-paper-soft px-8 py-8 shadow-[0_18px_44px_-26px_rgba(38,32,25,0.35)] sm:px-12">
            <div className="absolute inset-y-0 left-0 flex flex-col items-center justify-center border-r border-line bg-jade-50/60 px-2.5">
              <span className="vertical-text font-serif text-sm tracking-widest text-cinnabar">
                今日一言
              </span>
            </div>
            <Quote
              className="mb-3 h-6 w-6 text-gold-400"
              aria-hidden
            />
            <blockquote className="font-serif text-xl leading-relaxed text-jade-900 sm:text-2xl">
              {hitokoto.text}
            </blockquote>
            <figcaption className="mt-5 flex items-center justify-between text-xs tracking-wider text-ink-faint sm:text-sm">
              <span>—— {hitokoto.from}</span>
              <span>{hitokoto.date}</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
