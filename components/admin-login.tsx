"use client";

import { Crown, Loader2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Seal } from "@/components/seal";

export function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
      if (!payload.ok) {
        setError(payload.error ?? "登录失败，请稍后重试。");
        setSubmitting(false);
        return;
      }
      window.location.reload();
    } catch {
      setError("网络异常，请稍后重试。");
      setSubmitting(false);
    }
  }

  return (
    <div className="ink-wash flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-line bg-paper-soft p-8 shadow-[0_28px_64px_-32px_rgba(38,32,25,0.4)]"
      >
        <div className="flex flex-col items-center">
          <Seal size={52} glow />
          <h1 className="mt-4 font-serif text-2xl font-semibold tracking-[0.2em] text-jade-900">
            首领后台
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-xs tracking-wider text-ink-faint">
            <Crown className="h-3.5 w-3.5 text-gold-600" aria-hidden />
            仅部落首领可登录
          </p>
        </div>

        <label className="mt-8 block">
          <span className="mb-2 block text-sm tracking-wider text-ink-soft">
            用户名
          </span>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
            className="w-full rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-600/15"
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-2 block text-sm tracking-wider text-ink-soft">
            密码
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-600/15"
          />
        </label>

        <div aria-live="polite">
          {error && (
            <p className="mt-4 flex items-start gap-2 text-sm text-cinnabar">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-jade-800 px-6 py-3 text-sm tracking-[0.25em] text-paper transition-colors hover:bg-jade-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {submitting ? "登录中…" : "进入后台"}
        </button>
      </form>
    </div>
  );
}
