import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { listMessages } from "@/lib/storage";

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
    const messages = await listMessages();
    return NextResponse.json({ ok: true, data: messages });
  } catch (error) {
    console.error("[api/admin/messages] 读取留言失败：", error);
    return NextResponse.json(
      { ok: false, error: "读取留言失败，请稍后再试。" },
      { status: 500 }
    );
  }
}
