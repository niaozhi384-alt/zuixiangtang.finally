"use client";

import {
  ArrowDown,
  ArrowUp,
  Loader2,
  PenLine,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ModuleForm {
  id?: string;
  title: string;
  items: string;
  note: string;
}

export function AdminIntroEditor() {
  const [modules, setModules] = useState<ModuleForm[]>([]);
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
        data?: { modules?: ModuleForm[] };
      };
      if (payload.ok && Array.isArray(payload.data?.modules)) {
        setModules(
          payload.data.modules.map((module) => ({
            id: module.id,
            title: module.title ?? "",
            items: module.items ?? "",
            note: module.note ?? "",
          }))
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

  function update(index: number, field: keyof ModuleForm, value: string) {
    setModules((current) =>
      current.map((module, moduleIndex) =>
        moduleIndex === index ? { ...module, [field]: value } : module
      )
    );
  }

  function addModule() {
    setModules((current) => [
      ...current,
      { title: "", items: "", note: "" },
    ]);
  }

  function removeModule(index: number) {
    setModules((current) => current.filter((_, i) => i !== index));
  }

  function moveModule(index: number, direction: "up" | "down") {
    setModules((current) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSave() {
    if (saving) return;
    const cleaned = modules.map((module) => ({
      id: module.id,
      title: module.title.trim(),
      items: module.items.replace(/\r\n/g, "\n").trim(),
      note: module.note.trim(),
    }));
    const missing = cleaned.some((module) => !module.title);
    if (missing) {
      setMessage({ kind: "error", text: "每个模块都需要填写标题。" });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modules: cleaned }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        data?: { modules?: ModuleForm[] };
      };
      if (!payload.ok) {
        setMessage({
          kind: "error",
          text: payload.error ?? "保存失败，请稍后再试。",
        });
        return;
      }
      setModules(
        (payload.data?.modules ?? cleaned).map((module) => ({
          id: module.id,
          title: module.title,
          items: module.items,
          note: module.note,
        }))
      );
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
        修改首页「部落介绍」各小模块的内容，保存后前台立即生效；
        可新增、删除模块，内容每行一条，备注为卡片下方的小字说明。
      </p>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-ink-faint">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          加载中…
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {modules.map((module, index) => (
            <div
              key={module.id ?? `new-${index}`}
              className="rounded-md border border-line bg-paper p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={module.title}
                  onChange={(event) =>
                    update(index, "title", event.target.value)
                  }
                  maxLength={30}
                  placeholder="模块标题（必填）"
                  aria-label={`模块 ${index + 1} 标题`}
                  className="min-w-0 flex-1 rounded-md border border-line bg-paper-soft px-3 py-2 text-sm font-medium text-ink outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-600/15"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveModule(index, "up")}
                    disabled={index === 0}
                    aria-label="上移"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink-faint transition-colors hover:border-jade-500 hover:text-jade-800 disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveModule(index, "down")}
                    disabled={index === modules.length - 1}
                    aria-label="下移"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink-faint transition-colors hover:border-jade-500 hover:text-jade-800 disabled:opacity-40"
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeModule(index)}
                    aria-label="删除模块"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line text-ink-faint transition-colors hover:border-cinnabar hover:text-cinnabar"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
              <textarea
                value={module.items}
                onChange={(event) => update(index, "items", event.target.value)}
                maxLength={600}
                rows={3}
                placeholder="内容（每行一条）"
                aria-label={`模块 ${index + 1} 内容`}
                className="mt-3 w-full resize-y rounded-md border border-line bg-paper-soft px-3 py-2 text-sm leading-relaxed text-ink outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-600/15"
              />
              <input
                type="text"
                value={module.note}
                onChange={(event) => update(index, "note", event.target.value)}
                maxLength={120}
                placeholder="备注（可选，显示在卡片下方）"
                aria-label={`模块 ${index + 1} 备注`}
                className="mt-2 w-full rounded-md border border-line bg-paper-soft px-3 py-2 text-xs text-ink-soft outline-none transition focus:border-jade-600 focus:ring-2 focus:ring-jade-600/15"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addModule}
          disabled={loading || modules.length >= 20}
          className="inline-flex items-center gap-2 rounded-md border border-jade-700 px-4 py-2.5 text-sm tracking-wider text-jade-800 transition-colors hover:bg-jade-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" aria-hidden />
          添加模块
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 rounded-md bg-jade-800 px-5 py-2.5 text-sm tracking-wider text-paper transition-colors hover:bg-jade-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {saving ? "保存中…" : "保存全部"}
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
