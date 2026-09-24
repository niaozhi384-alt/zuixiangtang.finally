"use client";

import {
  Loader2,
  MessageCircle,
  RefreshCw,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatDateTime } from "@/lib/format";

interface MessageRow {
  id: string;
  content: string;
  createdAt: string;
}

export function AdminMessages() {
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/messages", {
        cache: "no-store",
      });
      if (response.status === 401) return;
      const payload = (await response.json()) as {
        ok: boolean;
        data?: MessageRow[];
        error?: string;
      };
      if (!payload.ok) throw new Error(payload.error ?? "加载失败");
      setRows(payload.data ?? []);
      setError("");
    } catch {
      setError("加载留言失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(id: string) {
    if (deletingId) return;
    const confirmed = window.confirm("确定删除这条留言吗？");
    if (!confirmed) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };
      if (!payload.ok) {
        window.alert(payload.error ?? "删除失败，请稍后重试。");
        return;
      }
      setRows((current) => current.filter((row) => row.id !== id));
    } catch {
      window.alert("网络异常，删除失败。");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="mt-6 rounded-lg border border-line bg-paper-soft">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-gold-600" aria-hidden />
          <h2 className="font-serif text-base font-semibold tracking-wider text-jade-900">
            匿名留言
          </h2>
          <span className="rounded-full border border-gold-400/60 bg-gold-100/60 px-2.5 py-0.5 text-xs tracking-wider text-gold-700">
            {rows.length} 条
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-jade-500 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            aria-hidden
          />
          刷新
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-faint">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          留言加载中…
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-cinnabar">
          <TriangleAlert className="h-4 w-4" aria-hidden />
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-ink-faint">暂无留言</p>
        </div>
      ) : (
        <ul className="divide-y divide-line/60">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-start justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">
                  {row.content}
                </p>
                <time className="mt-1.5 block text-xs text-ink-faint">
                  {formatDateTime(row.createdAt)}
                </time>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(row.id)}
                disabled={deletingId !== null}
                aria-label="删除这条留言"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-ink-faint transition-colors hover:bg-cinnabar/10 hover:text-cinnabar disabled:opacity-50"
              >
                {deletingId === row.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                )}
                删除
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
