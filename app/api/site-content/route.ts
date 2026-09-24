import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/storage";

export const dynamic = "force-dynamic";

const ALLOWED_KEYS = new Set(["clan_intro"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key") ?? "clan_intro";
  if (!ALLOWED_KEYS.has(key)) {
    return NextResponse.json(
      { ok: false, error: "无效的内容键。" },
      { status: 400 }
    );
  }
  try {
    const value = await getSiteContent(key);
    return NextResponse.json({ ok: true, data: { key, value } });
  } catch (error) {
    console.error("[api/site-content] 读取内容失败：", error);
    return NextResponse.json(
      { ok: false, error: "读取内容失败，请稍后再试。" },
      { status: 500 }
    );
  }
}
