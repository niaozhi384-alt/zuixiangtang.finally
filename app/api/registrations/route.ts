import { NextResponse } from "next/server";
import { dbMode } from "@/lib/config";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  listRegistrations,
  upsertRegistration,
  type RegistrationChoice,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await listRegistrations();
    return NextResponse.json({ ok: true, data, mode: dbMode() });
  } catch (error) {
    console.error("[api/registrations] 读取报名名单失败：", error);
    return NextResponse.json(
      { ok: false, error: "读取报名数据失败，请稍后再试。" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`registrations:${ip}`, 60 * 60 * 1000, 40);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "提交过于频繁，请稍后再试。" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const { gameName, choice } = (body ?? {}) as {
    gameName?: unknown;
    choice?: unknown;
  };

  const name =
    typeof gameName === "string" ? gameName.trim().replace(/\s+/g, " ") : "";
  if (!name) {
    return NextResponse.json(
      { ok: false, error: "请输入游戏名称。" },
      { status: 400 }
    );
  }
  if (name.length > 20) {
    return NextResponse.json(
      { ok: false, error: "游戏名称最多 20 个字符。" },
      { status: 400 }
    );
  }
  if (/[\u0000-\u001f\u007f]/.test(name)) {
    return NextResponse.json(
      { ok: false, error: "游戏名称包含无效字符。" },
      { status: 400 }
    );
  }
  if (choice !== "register" && choice !== "skip") {
    return NextResponse.json(
      { ok: false, error: "请选择是否报名。" },
      { status: 400 }
    );
  }

  try {
    const result = await upsertRegistration(name, choice as RegistrationChoice);
    return NextResponse.json(
      {
        ok: true,
        data: {
          record: result.record,
          created: result.created,
        },
      },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    console.error("[api/registrations] 提交报名失败：", error);
    return NextResponse.json(
      { ok: false, error: "提交失败，请稍后重试。" },
      { status: 500 }
    );
  }
}
