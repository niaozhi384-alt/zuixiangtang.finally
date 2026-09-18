import type { Metadata } from "next";
import {
  FileSpreadsheet,
  Lock,
  RefreshCw,
  ScrollText,
  UserRound,
} from "lucide-react";
import { Footer } from "@/components/footer";
import { RegistrationBoard } from "@/components/registration-board";
import { Reveal } from "@/components/reveal";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "联赛报名",
  description:
    "醉乡堂部落联赛报名：输入游戏名称并选择是否报名，首领登录后台可查看全部名单并导出 Excel。",
};

const RULES = [
  {
    icon: <UserRound className="h-5 w-5" aria-hidden />,
    title: "填写报名",
    text: "输入游戏名称，选择是否报名。",
  },
  {
    icon: <RefreshCw className="h-5 w-5" aria-hidden />,
    title: "随时修改",
    text: "重复提交将更新原有记录。",
  },
  {
    icon: <Lock className="h-5 w-5" aria-hidden />,
    title: "名单保密",
    text: "公开页面仅展示已报名名单。",
  },
  {
    icon: <FileSpreadsheet className="h-5 w-5" aria-hidden />,
    title: "首领汇总",
    text: "首领登录后可查看全部记录并导出 Excel。",
  },
];

export default function LeaguePage() {
  return (
    <>
      <SiteNav />
      <main>
        <header className="ink-wash border-b border-line/60 py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <p className="text-sm tracking-[0.5em] text-gold-600">联赛报名</p>
              <h1 className="mt-3 font-serif text-4xl font-bold tracking-wider text-jade-900 sm:text-5xl">
                联赛报名
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
                输入游戏名称，选择是否参加本次联赛。
              </p>
            </Reveal>
          </div>
        </header>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="mb-8 flex items-center gap-2 text-sm tracking-[0.3em] text-ink-faint">
                <ScrollText className="h-4 w-4 text-gold-600" aria-hidden />
                报名须知
              </div>
            </Reveal>
            <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {RULES.map((rule, index) => (
                <Reveal key={rule.title} delay={index * 70}>
                  <article className="h-full rounded-lg border border-line bg-paper-soft p-5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-jade-100 text-jade-800">
                      {rule.icon}
                    </span>
                    <h2 className="mt-4 font-serif text-base font-semibold tracking-wider text-jade-900">
                      {rule.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {rule.text}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <RegistrationBoard />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
