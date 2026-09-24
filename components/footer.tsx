import Link from "next/link";
import { Crown } from "lucide-react";
import { Seal } from "@/components/seal";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="ink-wash-deep relative overflow-hidden text-jade-100">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <Seal size={38} />
              <span className="font-serif text-xl font-semibold tracking-[0.2em] text-paper">
                醉乡堂
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-jade-200/80">
              五湖四海皆兄弟，醉乡堂里认神州。Clash of Clans 部落，期待你的加入。
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-[0.3em] text-gold-300">
              部落导航
            </h3>
            <div className="grid grid-cols-2 gap-y-2.5 text-sm text-jade-100/85">
              <Link href="/" className="transition-colors hover:text-paper">
                首页
              </Link>
              <Link href="/#about" className="transition-colors hover:text-paper">
                部落介绍
              </Link>
              <Link href="/league" className="transition-colors hover:text-paper">
                联赛报名
              </Link>
              <Link href="/#download" className="transition-colors hover:text-paper">
                游戏下载
              </Link>
              <Link href="/#message" className="transition-colors hover:text-paper">
                留言板
              </Link>
              <Link href="/#join" className="transition-colors hover:text-paper">
                加入部落
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold tracking-[0.3em] text-gold-300">
              联系部落
            </h3>
            <p className="text-sm text-jade-100/85">QQ 群：1036109738</p>
            <p className="mt-1.5 text-sm text-jade-200/70">
              加群备注游戏名，欢迎四海兄弟。
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-jade-100/15 pt-6 text-xs text-jade-200/60 sm:flex-row">
          <p>
            © {year} 醉乡堂部落 · 五湖四海皆兄弟，醉乡堂里认神州
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-300"
          >
            <Crown className="h-3.5 w-3.5" aria-hidden />
            首领入口
          </Link>
        </div>
      </div>
    </footer>
  );
}
