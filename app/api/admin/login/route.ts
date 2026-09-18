import { NextResponse } from "next/server";
import {
  createSessionToken,
  safeEqual,
  SESSION_COOKIE,
} from "@/lib/auth";
import { config } from "@/lib/config";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const SESSION_MAX_AGE_SEC = 12 * 60 * 60;

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`admin-login:${ip}`, 15 * 60 * 1000, 8);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "尝试次数过多，请 15 分钟后再试。" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  if (!config.adminPassword) {
    return NextResponse.json(
      { ok: false, error: "后台尚未配置管理员密码，请在环境变量中设置 ADMIN_PASSWORD。" },
      { status: 503 }
    );
  }

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const { username, password } = (body ?? {}) as {
    username?: unknown;
    password?: unknown;
  };
  const submittedName = typeof username === "string" ? username.trim() : "";
  const submittedPass = typeof password === "string" ? password : "";

  const nameOk = safeEqual(submittedName, config.adminUsername);
  const passOk = safeEqual(submittedPass, config.adminPassword);
  if (!nameOk || !passOk) {
    return NextResponse.json(
      { ok: false, error: "账号或密码不正确。" },
      { status: 401 }
    );
  }

  const token = createSessionToken(config.adminUsername);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
  return response;
}
