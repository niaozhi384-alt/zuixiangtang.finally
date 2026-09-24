import { NextResponse } from "next/server";
import { maskProfanity } from "@/lib/profanity";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { addMessage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`messages:${ip}`, 60 * 60 * 1000, 10);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "留言过于频繁，请稍后再试。" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const raw = (body as { content?: unknown } | null)?.content ?? "";
  const content =
    typeof raw === "string"
      ? raw.trim().replace(/\s+/g, " ").slice(0, 300)
      : "";
  if (!content) {
    return NextResponse.json(
      { ok: false, error: "请输入留言内容。" },
      { status: 400 }
    );
  }
  if (/[\u0000-\u001f\u007f]/.test(content)) {
    return NextResponse.json(
      { ok: false, error: "留言包含无效字符。" },
      { status: 400 }
    );
  }

  const { text, masked } = maskProfanity(content);
  try {
    const record = await addMessage(text);
    return NextResponse.json(
      { ok: true, data: { id: record.id, masked } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/messages] 保存留言失败：", error);
    return NextResponse.json(
      { ok: false, error: "提交失败，请稍后重试。" },
      { status: 500 }
    );
  }
}
