"use client";

import { Check, Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/reveal";

const QQ_GROUP = "1036109738";

export function JoinSection() {
  const [copied, setCopied] = useState(false);

  async function copyGroupNumber() {
    try {
      await navigator.clipboard.writeText(QQ_GROUP);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="join" className="scroll-mt-20 bg-jade-50/60 py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-wider text-jade-900 sm:text-4xl">
            加入部落
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mx-auto mt-10 max-w-md rounded-lg border border-line bg-paper-soft px-8 py-8 shadow-[0_18px_44px_-26px_rgba(38,32,25,0.3)]">
            <div className="flex items-center justify-center gap-2 text-sm tracking-widest text-ink-faint">
              <MessageCircle className="h-4 w-4 text-jade-600" aria-hidden />
              官方 QQ 群
            </div>
            <p className="mt-3 font-serif text-4xl font-bold tracking-[0.12em] text-jade-900">
              {QQ_GROUP}
            </p>
            <p className="mt-2 text-sm text-ink-faint">加群备注游戏名！！</p>
            <button
              type="button"
              onClick={copyGroupNumber}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-jade-800 px-6 py-3 text-sm tracking-[0.2em] text-paper transition-colors hover:bg-jade-900"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden />
                  已复制群号
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden />
                  复制群号
                </>
              )}
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
