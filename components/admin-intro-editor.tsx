"use client";

import { Eraser, Loader2, PenLine } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const MAX_LENGTH = 3000;

export function AdminIntroEditor() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/content", {
        cache: "no-store",
      });
      if (response.status === 401) return;
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { value?: string };
      };
      if (payload.ok) {
        setValue(
          typeof payload.data?.value === "string" ? payload.data.value : ""
        );
      }
    } catch {
      // 忽略加载失败
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };
      if (!payload.ok) {
        setMessage({
          kind: "error",
          text: payload.error ?? "保存失败，请稍后再试。",
        });
        return;
      }
      setMessage({ kind: "success", text: "部落介绍已保存，前台即时生效。" });
    } catch {
      setMessage({ kind: "error", text: "网络异常，保存失败。" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-line bg-paper-soft p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <PenLine className="h-5 w-5 text-gold-600" aria-hidden />
        <h2 className="font-serif text-base font-semibold tracking-wider text-jade-900">
          部落介绍管理
        </h2>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-faint">
        修改首页「部落介绍」的内容，保存后前台立即生效；留空保存可恢复默认版面。
        每空一行视为一个段落。
      </p>
      <label className="mt-4 block">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={MAX_LENGTH}
          rows={8}
          disabled={loading}
          placeholder={loading ? "加载中…" : "输入部落介绍内容（留空恢复默认）"}
          className="w-full resize-y rounded-md border border-line bg-paper px-3.5 py-2.5 text-sm leading-relaxed text-ink outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-600/15 disabled:opacity-60"
        />
        <span className="mt-1 block text-right text-xs text-ink-faint">
          {value.length}/{MAX_LENGTH}
        </span>
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 rounded-md bg-jade-800 px-5 py-2.5 text-sm tracking-wider text-paper transition-colors hover:bg-jade-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {saving ? "保存中…" : "保存内容"}
        </button>
        <button
          type="button"
          onClick={() => setValue("")}
          disabled={loading || value === ""}
          className="inline-flex items-center gap-2 rounded-md border border-line bg-paper px-4 py-2.5 text-sm text-ink-soft transition-colors hover:border-jade-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Eraser className="h-4 w-4" aria-hidden />
          清空（恢复默认）
        </button>
        {message && (
          <span
            className={`text-sm ${
              message.kind === "success" ? "text-jade-700" : "text-cinnabar"
            }`}
          >
            {message.text}
          </span>
        )}
      </div>
    </section>
  );
}
