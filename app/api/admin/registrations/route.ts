import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { dbMode } from "@/lib/config";
import { buildRegistrationsWorkbook } from "@/lib/excel";
import { shanghaiDate } from "@/lib/hitokoto";
import { listRegistrations } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { ok: false, error: "请先登录首领后台。" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const wantExcel = url.searchParams.get("format") === "xlsx";

  try {
    const rows = await listRegistrations({ all: true });
    if (wantExcel) {
      const buffer = await buildRegistrationsWorkbook(rows);
      const filename = `醉乡堂联赛报名_${shanghaiDate()}.xlsx`;
      return new Response(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="zuixiangtang-league.xlsx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
          "Cache-Control": "no-store",
        },
      });
    }
    return NextResponse.json({ ok: true, data: rows, mode: dbMode() });
  } catch (error) {
    console.error("[api/admin/registrations] 读取数据失败：", error);
    return NextResponse.json(
      { ok: false, error: "读取报名数据失败，请检查数据库配置。" },
      { status: 500 }
    );
  }
}
