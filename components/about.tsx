"use client";

import { Crown, Gift, ScrollText, Shield, Swords } from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/reveal";

interface AboutCardProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
  note?: string;
  delay?: number;
}

function AboutCard({ icon, title, items, note, delay = 0 }: AboutCardProps) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="flex h-full flex-col rounded-lg border border-line bg-paper-soft p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/80 hover:shadow-[0_20px_44px_-28px_rgba(38,32,25,0.35)]">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-jade-100 text-jade-800">
            {icon}
          </span>
          <h3 className="font-serif text-lg font-semibold tracking-wider text-jade-900">
            {title}
          </h3>
        </div>
        <ul className="space-y-2 text-sm leading-relaxed text-ink-soft">
          {items.map((item) => (
            <li key={item} className="flex items-baseline gap-2">
              <span className="h-1 w-1 shrink-0 translate-y-[-2px] rounded-full bg-gold-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {note && (
          <p className="mt-auto pt-4 text-xs tracking-wider text-ink-faint">
            {note}
          </p>
        )}
      </article>
    </Reveal>
  );
}

const DEFAULT_CARDS: AboutCardProps[] = [
  {
    icon: <Swords className="h-5 w-5" aria-hidden />,
    title: "部落活动",
    items: ["部落战 · 联赛 · 竞赛", "十级都城"],
    note: "有奶🍼 兼顾休闲娱乐",
  },
  {
    icon: <Shield className="h-5 w-5" aria-hidden />,
    title: "晋升之阶",
    items: ["捐兵一千 · 长老", "捐兵两千 · 副首"],
    delay: 60,
  },
  {
    icon: <Gift className="h-5 w-5" aria-hidden />,
    title: "奖励机制",
    items: ["竞赛第一：5 元 🧧", "联赛第一：8.88"],
    note: "并列第一看捐兵数与活跃度",
    delay: 120,
  },
  {
    icon: <Crown className="h-5 w-5" aria-hidden />,
    title: "职位增幅",
    items: ["长老：奖励增幅 0.05", "副首：奖励增幅 0.25"],
    note: "仅群成员有效",
    delay: 60,
  },
  {
    icon: <ScrollText className="h-5 w-5" aria-hidden />,
    title: "联赛纪律",
    items: ["挂绿牌未打、乱打者", "有职位降职 · 无职位 ✈"],
    delay: 120,
  },
];

export function About() {
  const [intro, setIntro] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-content?key=clan_intro", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: { ok: boolean; data?: { value?: string } }) => {
        if (!cancelled) {
          setIntro(
            payload.ok && typeof payload.data?.value === "string"
              ? payload.data.value
              : ""
          );
        }
      })
      .catch(() => {
        if (!cancelled) setIntro("");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="about" className="scroll-mt-20 py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="mb-10">
            <p className="text-sm tracking-[0.5em] text-gold-600">关于我们</p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-wider text-jade-900 sm:text-4xl">
              部落介绍
            </h2>
          </div>
        </Reveal>

        {intro !== null && intro.trim() !== "" ? (
          <Reveal>
            <article className="mx-auto max-w-4xl rounded-lg border border-line bg-paper-soft px-8 py-8 shadow-[0_18px_44px_-26px_rgba(38,32,25,0.3)] sm:px-12">
              {intro
                .split(/\n+/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p
                    key={index}
                    className="whitespace-pre-wrap font-serif text-base leading-loose text-ink-soft sm:text-lg [&:not(:first-child)]:mt-5"
                  >
                    {paragraph}
                  </p>
                ))}
            </article>
          </Reveal>
        ) : (
          intro !== null && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {DEFAULT_CARDS.map((card) => (
                <AboutCard key={card.title} {...card} />
              ))}
            </div>
          )
        )}

        <Reveal delay={140}>
          <p className="mt-10 text-center font-serif text-base text-ink-soft sm:text-lg">
            希望大家在醉乡堂里玩得开心 ☺
          </p>
        </Reveal>
      </div>
    </section>
  );
}
