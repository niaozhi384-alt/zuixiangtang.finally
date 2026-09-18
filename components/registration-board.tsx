"use client";

import {
  Ban,
  CheckCircle2,
  Loader2,
  Swords,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatMonthDay } from "@/lib/format";

type Choice = "register" | "skip";

interface RosterItem {
  id: string;
  gameName: string;
  choice: Choice;
  createdAt: string;
  updatedAt: string;
}

interface Feedback {
  kind: "success" | "error";
  text: string;
}

export function RegistrationBoard() {
  const [name, setName] = useState("");
  const [choice, setChoice] = useState<Choice>("register");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [rosterError, setRosterError] = useState(false);

  const loadRoster = useCallback(async () => {
    try {
      const response = await fetch("/api/registrations", { cache: "no-store" });
      const payload = (await response.json()) as {
        ok: boolean;
        data?: RosterItem[];
        error?: string;
      };
      if (!payload.ok) throw new Error(payload.error ?? "加载失败");
      setRoster(payload.data ?? []);
      setRosterError(false);
    } catch {
      setRosterError(true);
    } finally {
      setRosterLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRoster();
  }, [loadRoster]);

  const normalizedName = useMemo(() => name.trim().replace(/\s+/g, " "), [name]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
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
      await loadRoster();
    } catch {
      setFeedback({ kind: "error", text: "网络异常，请稍后重试。" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-line bg-paper-soft p-6 sm:p-7"
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
            className="w-full rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-600/15"
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
              icon={<Swords className="h-4 w-4" aria-hidden />}
              label="报名参加"
            />
            <ChoiceButton
              active={choice === "skip"}
              onClick={() => setChoice("skip")}
              icon={<Ban className="h-4 w-4" aria-hidden />}
              label="暂不参加"
            />
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={submitting}
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
          重复提交将更新原记录；完整名单仅首领可见。
        </p>
      </form>

      <section className="rounded-lg border border-line bg-paper-soft p-6 sm:p-7">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-serif text-lg font-semibold tracking-wider text-jade-900">
            <Users className="h-5 w-5 text-gold-600" aria-hidden />
            报名名单
          </h3>
          <span className="rounded-full border border-gold-400/60 bg-gold-100/60 px-3 py-1 text-xs tracking-wider text-gold-700">
            已报名 {roster.length} 人
          </span>
        </div>

        {rosterLoading ? (
          <div className="mt-8 flex items-center justify-center gap-2 py-10 text-sm text-ink-faint">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            名单加载中…
          </div>
        ) : rosterError ? (
          <div className="mt-8 flex items-center justify-center gap-2 py-10 text-sm text-ink-faint">
            <TriangleAlert className="h-4 w-4" aria-hidden />
            名单暂时无法加载，请稍后刷新页面。
          </div>
        ) : roster.length === 0 ? (
          <div className="mt-8 py-10 text-center">
            <p className="text-sm text-ink-faint">暂无报名</p>
          </div>
        ) : (
          <ol className="mt-5 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            {roster.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-md border border-line/70 bg-paper px-3.5 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="font-serif text-sm text-gold-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-sm text-ink">
                    {item.gameName}
                  </span>
                </div>
                <time className="shrink-0 text-xs text-ink-faint">
                  {formatMonthDay(item.createdAt)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-all ${
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
