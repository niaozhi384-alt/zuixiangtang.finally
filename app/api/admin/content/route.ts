import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getSiteContent, setSiteContent } from "@/lib/storage";

export const dynamic = "force-dynamic";

const CONTENT_KEY = "clan_intro";
const MAX_LENGTH = 3000;

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "请先登录首领后台。" },
      { status: 401 }
    );
  }
  try {
    const value = await getSiteContent(CONTENT_KEY);
    return NextResponse.json({ ok: true, data: { value } });
  } catch (error) {
    console.error("[api/admin/content] 读取部落介绍失败：", error);
    return NextResponse.json(
      { ok: false, error: "读取部落介绍失败，请稍后再试。" },
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
  const raw = (body as { value?: unknown } | null)?.value;
  const value = typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
  if (value.length > MAX_LENGTH) {
    return NextResponse.json(
      { ok: false, error: `内容最多 ${MAX_LENGTH} 个字符。` },
      { status: 400 }
    );
  }
  try {
    await setSiteContent(CONTENT_KEY, value);
    return NextResponse.json({ ok: true, data: { value } });
  } catch (error) {
    console.error("[api/admin/content] 保存部落介绍失败：", error);
    return NextResponse.json(
      { ok: false, error: "保存失败，请稍后再试。" },
      { status: 500 }
    );
  }
}
