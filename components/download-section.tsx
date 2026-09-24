import { Download } from "lucide-react";
import { Reveal } from "@/components/reveal";

export function DownloadSection() {
  return (
    <section id="download" className="scroll-mt-20 bg-jade-50/60 py-14 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <Reveal>
          <p className="text-sm tracking-[0.5em] text-gold-600">游戏下载</p>
          <h2 className="mt-2 font-serif text-3xl font-bold tracking-wider text-jade-900 sm:text-4xl">
            部落冲突国际服
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
            国服玩家经常找不到国际服安装包？点击下方按钮，前往下载部落冲突国际服最新安装包。
          </p>
        </Reveal>
        <Reveal delay={100}>
          <a
            href="https://clashpost.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-jade-800 px-8 py-3.5 text-sm tracking-[0.2em] text-paper transition-all hover:-translate-y-0.5 hover:bg-jade-900 hover:shadow-lg"
          >
            <Download className="h-4 w-4" aria-hidden />
            下载国际服安装包
          </a>
          <p className="mt-4 text-xs text-ink-faint">
            下载地址：clashpost.com（外部网站，将在新窗口打开）
          </p>
        </Reveal>
      </div>
    </section>
  );
}
