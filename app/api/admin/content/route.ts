import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { INTRO_MODULE_LIMITS } from "@/lib/intro-modules";
import {
  listIntroModules,
  replaceIntroModules,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "请先登录首领后台。" },
      { status: 401 }
    );
  }
  try {
    const modules = await listIntroModules();
    return NextResponse.json({ ok: true, data: { modules } });
  } catch (error) {
    console.error("[api/admin/content] 读取部落介绍模块失败：", error);
    return NextResponse.json(
      { ok: false, error: "读取部落介绍模块失败，请稍后再试。" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "请先登录首领后台。" },
      { status: 401 }
    );
  }
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const rawModules = (body as { modules?: unknown } | null)?.modules;
  if (!Array.isArray(rawModules)) {
    return NextResponse.json(
      { ok: false, error: "模块数据格式不正确。" },
      { status: 400 }
    );
  }
  if (rawModules.length > INTRO_MODULE_LIMITS.maxModules) {
    return NextResponse.json(
      { ok: false, error: `模块数量最多 ${INTRO_MODULE_LIMITS.maxModules} 个。` },
      { status: 400 }
    );
  }

  let validationError: string | null = null;
  const modules: {
    id?: string;
    title: string;
    items: string;
    note: string;
  }[] = [];
  for (let index = 0; index < rawModules.length; index++) {
    const item = rawModules[index];
    const raw = item as {
      id?: unknown;
      title?: unknown;
      items?: unknown;
      note?: unknown;
    } | null;
    const title =
      typeof raw?.title === "string"
        ? raw.title.replace(/\s+/g, " ").trim()
        : "";
    const items =
      typeof raw?.items === "string"
        ? raw.items.replace(/\r\n/g, "\n").trim()
        : "";
    const note =
      typeof raw?.note === "string" ? raw.note.replace(/\s+/g, " ").trim() : "";
    const id = typeof raw?.id === "string" ? raw.id : undefined;
    if (!title) {
      validationError = `第 ${index + 1} 个模块缺少标题`;
      break;
    }
    if (title.length > INTRO_MODULE_LIMITS.maxTitle) {
      validationError = `模块「${title.slice(0, 12)}」标题过长`;
      break;
    }
    if (items.length > INTRO_MODULE_LIMITS.maxItems) {
      validationError = `模块「${title.slice(0, 12)}」内容过长`;
      break;
    }
    if (note.length > INTRO_MODULE_LIMITS.maxNote) {
      validationError = `模块「${title.slice(0, 12)}」备注过长`;
      break;
    }
    modules.push({ id, title, items, note });
  }
  if (validationError) {
    return NextResponse.json(
      { ok: false, error: validationError },
      { status: 400 }
    );
  }

  try {
    const saved = await replaceIntroModules(modules);
    return NextResponse.json({ ok: true, data: { modules: saved } });
  } catch (error) {
    console.error("[api/admin/content] 保存部落介绍模块失败：", error);
    return NextResponse.json(
      { ok: false, error: "保存失败，请稍后再试。" },
      { status: 500 }
    );
  }
}
