export type DbMode = "supabase" | "local";

function env(key: string): string {
  return (process.env[key] ?? "").trim();
}

export const config = {
  supabaseUrl: env("SUPABASE_URL"),
  supabaseAnonKey: env("SUPABASE_ANON_KEY"),
  supabaseServiceKey: env("SUPABASE_SERVICE_ROLE_KEY"),
  adminUsername: env("ADMIN_USERNAME") || "首领",
  adminPassword: env("ADMIN_PASSWORD"),
  sessionSecret: env("SESSION_SECRET"),
  siteUrl:
    env("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "") ||
    "https://zuixiangtang.vercel.app",
};

/**
 * 线上环境使用 Supabase 免费数据库；
 * 未配置环境变量时自动降级为本地演示模式（JSON 文件存储），便于本地预览。
 */
export function dbMode(): DbMode {
  return config.supabaseUrl && config.supabaseAnonKey ? "supabase" : "local";
}
