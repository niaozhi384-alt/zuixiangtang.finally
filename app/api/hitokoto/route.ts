import { NextResponse } from "next/server";
import { getDailyHitokoto } from "@/lib/hitokoto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getDailyHitokoto();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("[api/hitokoto] 获取一言失败：", error);
    return NextResponse.json(
      { ok: false, error: "暂时无法获取一言，请稍后再试。" },
      { status: 500 }
    );
  }
}
