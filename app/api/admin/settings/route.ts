import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { shanghaiDateTimeLocalToIso } from "@/lib/format";
import {
  getRegistrationWindow,
  setRegistrationWindow,
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
    const window = await getRegistrationWindow();
    return NextResponse.json({ ok: true, data: window });
  } catch (error) {
    console.error("[api/admin/settings] 读取报名时间失败：", error);
    return NextResponse.json(
      { ok: false, error: "读取报名时间失败，请稍后再试。" },
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
  const { startAt, endAt } = (body ?? {}) as {
    startAt?: unknown;
    endAt?: unknown;
  };

  const startText = typeof startAt === "string" ? startAt.trim() : "";
  const endText = typeof endAt === "string" ? endAt.trim() : "";

  let startIso: string | null = null;
  let endIso: string | null = null;
  if (startText) {
    const parsed = shanghaiDateTimeLocalToIso(startText);
    if (!parsed) {
      return NextResponse.json(
        { ok: false, error: "开始时间格式不正确。" },
        { status: 400 }
      );
    }
    startIso = parsed;
  }
  if (endText) {
    const parsed = shanghaiDateTimeLocalToIso(endText);
    if (!parsed) {
      return NextResponse.json(
        { ok: false, error: "结束时间格式不正确。" },
        { status: 400 }
      );
    }
    endIso = parsed;
  }
  if (
    startIso &&
    endIso &&
    new Date(endIso).getTime() <= new Date(startIso).getTime()
  ) {
    return NextResponse.json(
      { ok: false, error: "结束时间必须晚于开始时间。" },
      { status: 400 }
    );
  }

  try {
    await setRegistrationWindow(startIso, endIso);
    return NextResponse.json({ ok: true, data: { startAt: startIso, endAt: endIso } });
  } catch (error) {
    console.error("[api/admin/settings] 保存报名时间失败：", error);
    return NextResponse.json(
      { ok: false, error: "保存失败，请稍后再试。" },
      { status: 500 }
    );
  }
}
