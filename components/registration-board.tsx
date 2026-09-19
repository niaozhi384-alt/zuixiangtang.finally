"use client";

import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Loader2,
  Swords,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format";

type Choice = "register" | "skip";

interface Feedback {
  kind: "success" | "error";
  text: string;
}

interface WindowState {
  startAt: string | null;
  endAt: string | null;
  open: boolean;
  message: string | null;
}

export function RegistrationBoard() {
  const [name, setName] = useState("");
  const [choice, setChoice] = useState<Choice>("register");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [windowState, setWindowState] = useState<WindowState | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/registrations", { cache: "no-store" });
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { count: number; window: WindowState };
      };
      if (payload.ok) {
        setCount(payload.data?.count ?? 0);
        setWindowState(payload.data?.window ?? null);
      }
    } catch {
      setCount(null);
      setWindowState(null);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const normalizedName = useMemo(() => name.trim().replace(/\s+/g, " "), [name]);
  const closed = windowState !== null && !windowState.open;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    if (closed) return;
    if (!normalizedName) {
      setFeedback({ kind: "error", text: "请输入游戏名称。" });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName: normalizedName, choice }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        data?: { created: boolean };
      };
      if (!payload.ok) {
        setFeedback({
          kind: "error",
          text: payload.error ?? "提交失败，请稍后重试。",
        });
        return;
      }
      setFeedback({
        kind: "success",
        text: payload.data?.created
          ? "报名已提交。"
          : "已更新你的报名状态。",
      });
      await loadStatus();
    } catch {
      setFeedback({ kind: "error", text: "网络异常，请稍后重试。" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      {closed && windowState && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-cinnabar/30 bg-cinnabar/5 px-4 py-3 text-sm leading-relaxed text-cinnabar">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {windowState.message}，当前暂不能提交。
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-line bg-paper-soft p-6 sm:p-8"
      >
        <h3 className="flex items-center gap-2 font-serif text-lg font-semibold tracking-wider text-jade-900">
          <Swords className="h-5 w-5 text-gold-600" aria-hidden />
          填写报名
        </h3>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm tracking-wider text-ink-soft">
            游戏名称
          </span>
          <input
            type="text"
            value={name}
            maxLength={20}
            onChange={(event) => setName(event.target.value)}
            placeholder="请输入游戏名称"
            autoComplete="off"
            disabled={closed}
            className="w-full rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-600/15 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <fieldset className="mt-5">
          <legend className="mb-2 text-sm tracking-wider text-ink-soft">
            是否报名
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <ChoiceButton
              active={choice === "register"}
              onClick={() => setChoice("register")}
              disabled={closed}
              icon={<Swords className="h-4 w-4" aria-hidden />}
              label="报名参加"
            />
            <ChoiceButton
              active={choice === "skip"}
              onClick={() => setChoice("skip")}
              disabled={closed}
              icon={<Ban className="h-4 w-4" aria-hidden />}
              label="暂不参加"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={submitting || closed}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-jade-800 px-6 py-3 text-sm tracking-[0.25em] text-paper transition-all hover:bg-jade-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {submitting ? "提交中…" : "提交报名"}
        </button>

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

        <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
          重复提交将更新原记录；报名名单仅首领登录后可见。
        </p>
      </form>

      <div className="mt-5 space-y-2 text-center text-sm text-ink-faint">
        <p className="flex items-center justify-center gap-2">
          <Users className="h-4 w-4 text-gold-600" aria-hidden />
          {count === null ? "统计加载中…" : `已有 ${count} 人报名`}
        </p>
        {windowState && (windowState.startAt || windowState.endAt) && (
          <p className="flex items-center justify-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-gold-600" aria-hidden />
            报名时间：
            {windowState.startAt
              ? formatDateTime(windowState.startAt)
              : "不限"}
            {" — "}
            {windowState.endAt ? formatDateTime(windowState.endAt) : "不限"}
          </p>
        )}
      </div>
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  disabled = false,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "border-jade-700 bg-jade-800 text-paper shadow-sm"
          : "border-line bg-paper text-ink-soft hover:border-jade-500"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
