import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { config } from "@/lib/config";

export const SESSION_COOKIE = "zxt_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const DEV_FALLBACK_SECRET = "zuixiangtang-local-dev-secret";

let warnedAboutSecret = false;

function getSessionSecret(): string {
  if (config.sessionSecret) return config.sessionSecret;
  if (process.env.NODE_ENV === "production") {
    if (!warnedAboutSecret) {
      warnedAboutSecret = true;
      console.warn(
        "[zuixiangtang] 未设置 SESSION_SECRET，登录会话将在重新部署后失效，请在生产环境配置该变量。"
      );
    }
    return randomBytes(32).toString("hex");
  }
  return DEV_FALLBACK_SECRET;
}

function hmac(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ha = createHashDigest(a);
  const hb = createHashDigest(b);
  return timingSafeEqual(ha, hb);
}

function createHashDigest(value: string): Buffer {
  return createHmac("sha256", "zuixiangtang-eq").update(value).digest();
}

export function createSessionToken(username: string): string {
  const payload = JSON.stringify({
    u: username,
    exp: Date.now() + SESSION_TTL_MS,
  });
  const body = Buffer.from(payload, "utf8").toString("base64url");
  return `${body}.${hmac(body)}`;
}

export function verifySessionToken(
  token: string | undefined | null
): { username: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [body, signature] = parts;

  const expected = Buffer.from(hmac(body), "base64url");
  const provided = Buffer.from(signature, "base64url");
  if (expected.length !== provided.length) return null;
  if (!timingSafeEqual(expected, provided)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as { u?: unknown; exp?: unknown };
    if (typeof payload.u !== "string" || typeof payload.exp !== "number") {
      return null;
    }
    if (payload.exp < Date.now()) return null;
    return { username: payload.u };
  } catch {
    return null;
  }
}

export function getSessionFromRequest(
  request: Request
): { username: string } | null {
  const header = request.headers.get("cookie") ?? "";
  const entry = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  if (!entry) return null;
  const token = entry.slice(SESSION_COOKIE.length + 1);
  return verifySessionToken(decodeURIComponent(token));
}
