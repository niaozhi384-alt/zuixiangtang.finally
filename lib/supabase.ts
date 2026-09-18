import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config, dbMode } from "@/lib/config";

let anonClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

/** 匿名客户端：仅用于公开读取（受 Supabase RLS 策略保护）。 */
export function getSupabase(): SupabaseClient | null {
  if (dbMode() !== "supabase") return null;
  if (!anonClient) {
    anonClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
  }
  return anonClient;
}

/** 服务端密钥客户端：可绕过 RLS，仅在服务端 API 路由中使用。 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (dbMode() !== "supabase" || !config.supabaseServiceKey) return null;
  if (!serviceClient) {
    serviceClient = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return serviceClient;
}
