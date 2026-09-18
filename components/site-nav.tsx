"use client";

import Image from "next/image";
import Link from "next/link";
import { Crown, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/#about", label: "部落介绍" },
  { href: "/league", label: "联赛报名" },
  { href: "/#join", label: "加入部落" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo.png"
            alt="醉乡堂徽记"
            width={34}
            height={34}
            className="h-8 w-8 rounded-md object-cover transition-transform duration-500 group-hover:rotate-6"
          />
          <span className="font-serif text-xl font-semibold tracking-[0.18em] text-jade-900">
            醉乡堂
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm tracking-wider text-ink-soft transition-colors hover:text-jade-800"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-faint transition-colors hover:border-gold-400 hover:text-gold-600"
          >
            <Crown className="h-3.5 w-3.5" aria-hidden />
            首领入口
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink-soft md:hidden"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-line/70 bg-paper px-4 pb-4 pt-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line/50 py-3 text-sm tracking-wider text-ink-soft last:border-none"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-faint"
          >
            <Crown className="h-3.5 w-3.5" aria-hidden />
            首领入口
          </Link>
        </nav>
      )}
    </header>
  );
}
