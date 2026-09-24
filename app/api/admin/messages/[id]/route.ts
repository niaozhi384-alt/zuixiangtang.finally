import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { deleteMessage } from "@/lib/storage";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "请先登录首领后台。" },
      { status: 401 }
    );
  }
  const { id } = await context.params;
  if (!/^[\w-]{1,64}$/.test(id)) {
    return NextResponse.json(
      { ok: false, error: "无效的留言编号。" },
      { status: 400 }
    );
  }
  try {
    const deleted = await deleteMessage(id);
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: "留言不存在或已被删除。" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/messages] 删除留言失败：", error);
    return NextResponse.json(
      { ok: false, error: "删除失败，请稍后重试。" },
      { status: 500 }
    );
  }
}
