"use client";

import {
  Crown,
  Gift,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Reveal } from "@/components/reveal";
import { DEFAULT_INTRO_MODULES } from "@/lib/intro-modules";

interface IntroModuleView {
  id: string;
  title: string;
  items: string;
  note: string;
}

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
              <span className="whitespace-pre-wrap">{item}</span>
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

function iconFor(title: string): React.ReactNode {
  switch (title) {
    case "部落活动":
      return <Swords className="h-5 w-5" aria-hidden />;
    case "晋升之阶":
      return <Shield className="h-5 w-5" aria-hidden />;
    case "奖励机制":
      return <Gift className="h-5 w-5" aria-hidden />;
    case "职位增幅":
      return <Crown className="h-5 w-5" aria-hidden />;
    case "联赛纪律":
      return <ScrollText className="h-5 w-5" aria-hidden />;
    default:
      return <Sparkles className="h-5 w-5" aria-hidden />;
  }
}

function toItems(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function About() {
  const [modules, setModules] = useState<IntroModuleView[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/site-content?key=intro_modules", { cache: "no-store" })
      .then((response) => response.json())
      .then(
        (payload: {
          ok: boolean;
          data?: { modules?: IntroModuleView[] };
        }) => {
          if (!cancelled) {
            setModules(
              payload.ok && Array.isArray(payload.data?.modules)
                ? payload.data.modules
                : []
            );
          }
        }
      )
      .catch(() => {
        if (!cancelled) setModules([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const cards =
    modules && modules.length > 0
      ? modules.map((module) => ({
          id: module.id,
          title: module.title,
          items: toItems(module.items),
          note: module.note || undefined,
        }))
      : modules !== null
        ? DEFAULT_INTRO_MODULES.map((module) => ({
            id: module.title,
            title: module.title,
            items: toItems(module.items),
            note: module.note || undefined,
          }))
        : [];

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

        {cards.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => (
              <AboutCard
                key={card.id}
                icon={iconFor(card.title)}
                title={card.title}
                items={card.items}
                note={card.note}
                delay={Math.min(index, 5) * 60}
              />
            ))}
          </div>
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
