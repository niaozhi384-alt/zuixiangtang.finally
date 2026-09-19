"use client";

import {
  CalendarClock,
  Crown,
  Download,
  FileSpreadsheet,
  Loader2,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { formatDateTime, toShanghaiDateTimeLocal } from "@/lib/format";

type Choice = "register" | "skip";

interface AdminRow {
  id: string;
  gameName: string;
  choice: Choice;
  createdAt: string;
  updatedAt: string;
}

interface Payload {
  ok: boolean;
  data?: AdminRow[];
  mode?: "supabase" | "local";
  error?: string;
}

const CHOICE_META: Record<Choice, { label: string; className: string }> = {
  register: {
    label: "已报名",
    className: "border-jade-300 bg-jade-100 text-jade-800",
  },
  skip: {
    label: "不报名",
    className: "border-gold-300 bg-gold-100 text-gold-700",
  },
};

export function AdminDashboard({ username }: { username: string }) {
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [mode, setMode] = useState<"supabase" | "local">("local");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [windowStart, setWindowStart] = useState("");
  const [windowEnd, setWindowEnd] = useState("");
  const [savingWindow, setSavingWindow] = useState(false);
  const [windowMsg, setWindowMsg] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const loadRows = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/registrations", {
        cache: "no-store",
      });
      if (response.status === 401) {
        window.location.reload();
        return;
      }
      const payload = (await response.json()) as Payload;
      if (!payload.ok) throw new Error(payload.error ?? "加载失败");
      setRows(payload.data ?? []);
      setMode(payload.mode ?? "local");
      setError("");
    } catch {
      setError("加载报名数据失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWindow = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        cache: "no-store",
      });
      if (response.status === 401) return;
      const payload = (await response.json()) as {
        ok: boolean;
        data?: { startAt: string | null; endAt: string | null };
      };
      if (payload.ok) {
        setWindowStart(toShanghaiDateTimeLocal(payload.data?.startAt));
        setWindowEnd(toShanghaiDateTimeLocal(payload.data?.endAt));
      }
    } catch {
      // 忽略加载失败，避免影响主列表
    }
  }, []);

  useEffect(() => {
    void loadRows();
    void loadWindow();
  }, [loadRows, loadWindow]);

  async function handleDelete(id: string, gameName: string) {
    if (deletingId) return;
    const confirmed = window.confirm(`确定删除「${gameName}」的报名记录吗？`);
    if (!confirmed) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { ok: boolean; error?: string };
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

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin";
    }
  }

  async function handleSaveWindow() {
    if (savingWindow) return;
    setSavingWindow(true);
    setWindowMsg(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAt: windowStart, endAt: windowEnd }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
      };
      if (!payload.ok) {
        setWindowMsg({
          kind: "error",
          text: payload.error ?? "保存失败，请稍后再试。",
        });
        return;
      }
      setWindowMsg({ kind: "success", text: "报名时间已保存。" });
    } catch {
      setWindowMsg({ kind: "error", text: "网络异常，保存失败。" });
    } finally {
      setSavingWindow(false);
    }
  }

  const registeredCount = rows.filter((row) => row.choice === "register").length;
  const skipCount = rows.length - registeredCount;
  const latestUpdate = rows.reduce<string | null>((latest, row) => {
    if (!latest) return row.updatedAt;
    return row.updatedAt > latest ? row.updatedAt : latest;
  }, null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm tracking-[0.4em] text-gold-600">
            <Crown className="h-4 w-4" aria-hidden />
            首领后台
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold tracking-wider text-jade-900">
            联赛报名管理
          </h1>
          <p className="mt-2 text-sm text-ink-faint">
            欢迎归来，{username}。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/api/admin/registrations?format=xlsx"
            className="inline-flex items-center gap-2 rounded-md bg-jade-800 px-5 py-2.5 text-sm tracking-wider text-paper transition-colors hover:bg-jade-900"
          >
            <Download className="h-4 w-4" aria-hidden />
            导出 Excel
          </a>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void loadRows();
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-paper-soft px-4 py-2.5 text-sm text-ink-soft transition-colors hover:border-jade-500 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              aria-hidden
            />
            刷新
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-md border border-line bg-paper-soft px-4 py-2.5 text-sm text-ink-soft transition-colors hover:border-cinnabar hover:text-cinnabar"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            退出登录
          </button>
        </div>
      </div>

      {mode === "local" && (
        <div className="mt-6 flex items-start gap-3 rounded-md border border-gold-300 bg-gold-100/70 px-4 py-3 text-sm leading-relaxed text-gold-700">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            当前为本地演示模式（数据仅保存在本机）。部署上线前请按文档配置
            Supabase 免费线上数据库，数据才会永久保存并可供成员访问。
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5" aria-hidden />}
          label="报名总人数"
          value={rows.length}
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5" aria-hidden />}
          label="已报名"
          value={registeredCount}
        />
        <StatCard
          icon={<FileSpreadsheet className="h-5 w-5" aria-hidden />}
          label="暂不参加"
          value={skipCount}
        />
      </div>

      <section className="mt-6 rounded-lg border border-line bg-paper-soft p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-gold-600" aria-hidden />
          <h2 className="font-serif text-base font-semibold tracking-wider text-jade-900">
            报名时间设置
          </h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">
          设置联赛报名的开始与结束时间（按北京时间）。留空表示不限制；
          未开始或已结束时段，成员将无法提交报名。
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm tracking-wider text-ink-soft">
              开始时间
            </span>
            <input
              type="datetime-local"
              value={windowStart}
              onChange={(event) => setWindowStart(event.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-600/15"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm tracking-wider text-ink-soft">
              结束时间
            </span>
            <input
              type="datetime-local"
              value={windowEnd}
              onChange={(event) => setWindowEnd(event.target.value)}
              className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-600/15"
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveWindow}
            disabled={savingWindow}
            className="inline-flex items-center gap-2 rounded-md bg-jade-800 px-5 py-2.5 text-sm tracking-wider text-paper transition-colors hover:bg-jade-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingWindow && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
            {savingWindow ? "保存中…" : "保存设置"}
          </button>
          {windowMsg && (
            <span
              className={`text-sm ${
                windowMsg.kind === "success"
                  ? "text-jade-700"
                  : "text-cinnabar"
              }`}
            >
              {windowMsg.text}
            </span>
          )}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-line bg-paper-soft">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-serif text-base font-semibold tracking-wider text-jade-900">
            全部报名记录
          </h2>
          {latestUpdate && (
            <span className="text-xs text-ink-faint">
              最近更新 {formatDateTime(latestUpdate)}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink-faint">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            数据加载中…
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-cinnabar">
            <TriangleAlert className="h-4 w-4" aria-hidden />
            {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-base text-ink-soft">暂无报名记录</p>
            <p className="mt-2 text-sm text-ink-faint">
              待成员提交报名后，此处将显示名单。
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-paper text-xs tracking-wider text-ink-faint">
                  <th className="px-5 py-3 font-medium">序号</th>
                  <th className="px-5 py-3 font-medium">游戏名称</th>
                  <th className="px-5 py-3 font-medium">报名状态</th>
                  <th className="px-5 py-3 font-medium">报名时间</th>
                  <th className="px-5 py-3 font-medium">更新时间</th>
                  <th className="px-5 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const meta = CHOICE_META[row.choice];
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-line/60 last:border-none hover:bg-jade-50/50"
                    >
                      <td className="px-5 py-3 font-serif text-gold-600">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="px-5 py-3 text-ink">{row.gameName}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs ${meta.className}`}
                        >
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-ink-soft">
                        {formatDateTime(row.createdAt)}
                      </td>
                      <td className="px-5 py-3 text-ink-soft">
                        {formatDateTime(row.updatedAt)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id, row.gameName)}
                          disabled={deletingId !== null}
                          aria-label={`删除 ${row.gameName} 的报名记录`}
                          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-ink-faint transition-colors hover:bg-cinnabar/10 hover:text-cinnabar disabled:opacity-50"
                        >
                          {deletingId === row.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          )}
                          删除
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-line bg-paper-soft px-5 py-4">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-jade-100 text-jade-800">
        {icon}
      </span>
      <div>
        <p className="text-xs tracking-wider text-ink-faint">{label}</p>
        <p className="mt-0.5 font-serif text-2xl font-semibold text-jade-900">
          {value}
        </p>
      </div>
    </div>
  );
}
