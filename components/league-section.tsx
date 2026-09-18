import Link from "next/link";
import { ArrowRight, Swords } from "lucide-react";
import { RegistrationBoard } from "@/components/registration-board";
import { Reveal } from "@/components/reveal";

export function LeagueSection() {
  return (
    <section
      id="league"
      className="ink-wash-deep relative scroll-mt-20 overflow-hidden py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm tracking-[0.5em] text-gold-300">联赛报名</p>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-wider text-paper sm:text-4xl">
                联赛报名
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-jade-100/80 sm:text-base">
                输入游戏名称，选择是否报名；首领登录后可查看名单并导出 Excel。
              </p>
            </div>
            <Link
              href="/league"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm tracking-wider text-gold-300 transition-colors hover:text-gold-200"
            >
              <Swords className="h-4 w-4" aria-hidden />
              报名详情
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <RegistrationBoard />
        </Reveal>
      </div>
    </section>
  );
}
