"use client";

import {
  CheckCircle2,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/reveal";

const MAX_LENGTH = 300;

interface Feedback {
  kind: "success" | "error";
  text: string;
}

export function MessageBoard() {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const text = content.trim();
    if (!text) {
      setFeedback({ kind: "error", text: "请输入留言内容。" });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        data?: { masked?: boolean };
      };
      if (!payload.ok) {
        setFeedback({
          kind: "error",
          text: payload.error ?? "提交失败，请稍后重试。",
        });
        return;
      }
      setContent("");
      setFeedback({
        kind: "success",
        text: payload.data?.masked
          ? "留言已提交（检测到不当词汇，已自动屏蔽）。"
          : "留言已提交，感谢你的建议。",
      });
    } catch {
      setFeedback({ kind: "error", text: "网络异常，请稍后重试。" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="message" className="scroll-mt-20 py-14 sm:py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <p className="text-sm tracking-[0.5em] text-gold-600">留言板</p>
            <h2 className="mt-2 font-serif text-3xl font-bold tracking-wider text-jade-900">
              匿名留言
            </h2>
            <p className="mt-3 text-sm text-ink-faint">
              留言完全匿名，只有首领登录后台后能看到。
            </p>
          </div>
        </Reveal>
        <Reveal delay={80}>
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-lg border border-line bg-paper-soft p-6 sm:p-7"
          >
            <label className="block">
              <span className="mb-2 flex items-center gap-1.5 text-sm tracking-wider text-ink-soft">
                <MessageCircle
                  className="h-4 w-4 text-gold-600"
                  aria-hidden
                />
                想说点什么
              </span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={MAX_LENGTH}
                rows={4}
                placeholder="给首领的建议或悄悄话（含不当词汇将被自动屏蔽）"
                className="w-full resize-y rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm leading-relaxed text-ink outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-600/15"
              />
              <span className="mt-1 block text-right text-xs text-ink-faint">
                {content.length}/{MAX_LENGTH}
              </span>
            </label>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs text-ink-faint">
                <ShieldCheck className="h-4 w-4 text-jade-600" aria-hidden />
                仅首领可见
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-md bg-jade-800 px-6 py-2.5 text-sm tracking-[0.2em] text-paper transition-colors hover:bg-jade-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    提交中…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden />
                    提交留言
                  </>
                )}
              </button>
            </div>
            <div aria-live="polite">
              {feedback && (
                <p
                  className={`mt-4 flex items-start gap-2 text-sm ${
                    feedback.kind === "success"
                      ? "text-jade-700"
                      : "text-cinnabar"
                  }`}
                >
                  {feedback.kind === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  ) : (
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  )}
                  {feedback.text}
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
