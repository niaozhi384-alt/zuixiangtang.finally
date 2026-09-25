import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { dbMode } from "@/lib/config";
import {
  DEFAULT_INTRO_MODULES,
  type IntroModuleInput,
} from "@/lib/intro-modules";
import { getSupabase, getSupabaseAdmin } from "@/lib/supabase";

export type RegistrationChoice = "register" | "skip";

export interface Registration {
  id: string;
  gameName: string;
  choice: RegistrationChoice;
  createdAt: string;
  updatedAt: string;
}

export interface HitokotoRecord {
  text: string;
  from: string;
}

export interface ClanMessage {
  id: string;
  content: string;
  createdAt: string;
}

export interface IntroModule {
  id: string;
  title: string;
  items: string;
  note: string;
  sortOrder: number;
}

interface LocalStore {
  registrations: Registration[];
  hitokoto: Record<string, HitokotoRecord>;
  window: RegistrationWindow | null;
  messages: ClanMessage[];
  siteContent: Record<string, string>;
  introModules: IntroModule[];
}

export interface RegistrationWindow {
  startAt: string | null;
  endAt: string | null;
}

type SupabaseRegistrationRow = {
  id: string;
  game_name: string;
  choice: RegistrationChoice;
  created_at: string;
  updated_at: string;
};

type SupabaseHitokotoRow = {
  date: string;
  hitokoto: string;
  from_who: string;
};

type SupabaseRegistrationSettingsRow = {
  id: number;
  start_at: string | null;
  end_at: string | null;
};

type SupabaseMessageRow = {
  id: string;
  content: string;
  created_at: string;
};

type SupabaseIntroModuleRow = {
  id: string;
  title: string;
  items: string;
  note: string;
  sort_order: number;
};

function mapRow(row: SupabaseRegistrationRow): Registration {
  return {
    id: row.id,
    gameName: row.game_name,
    choice: row.choice,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function storePath(): string {
  return dbMode() === "supabase" || process.env.NODE_ENV === "production"
    ? path.join(os.tmpdir(), "zuixiangtang-demo-store.json")
    : path.join(process.cwd(), ".data", "store.json");
}

async function readLocalStore(): Promise<LocalStore> {
  const file = storePath();
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalStore>;
    return {
      registrations: Array.isArray(parsed.registrations)
        ? parsed.registrations
        : [],
      hitokoto:
        parsed.hitokoto && typeof parsed.hitokoto === "object"
          ? parsed.hitokoto
          : {},
      window:
        parsed.window && typeof parsed.window === "object"
          ? {
              startAt:
                typeof parsed.window.startAt === "string"
                  ? parsed.window.startAt
                  : null,
              endAt:
                typeof parsed.window.endAt === "string"
                  ? parsed.window.endAt
                  : null,
            }
          : null,
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      siteContent:
        parsed.siteContent && typeof parsed.siteContent === "object"
          ? parsed.siteContent
          : {},
      introModules: Array.isArray(parsed.introModules)
        ? parsed.introModules
        : [],
    };
  } catch {
    return {
      registrations: [],
      hitokoto: {},
      window: null,
      messages: [],
      siteContent: {},
      introModules: [],
    };
  }
}

async function writeLocalStore(store: LocalStore): Promise<void> {
  const file = storePath();
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await rename(tmp, file);
}

export async function listRegistrations(options?: {
  all?: boolean;
}): Promise<Registration[]> {
  const db = getSupabase();
  if (db) {
    const query = db
      .from("registrations")
      .select("id, game_name, choice, created_at, updated_at")
      .order("created_at", { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []) as SupabaseRegistrationRow[];
    const mapped = rows.map(mapRow);
    return options?.all
      ? mapped
      : mapped.filter((row) => row.choice === "register");
  }
  const store = await readLocalStore();
  const rows = store.registrations;
  const sorted = [...rows].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
  return options?.all ? sorted : sorted.filter((r) => r.choice === "register");
}

export async function upsertRegistration(
  gameName: string,
  choice: RegistrationChoice
): Promise<{ record: Registration; created: boolean }> {
  const db = getSupabase();
  if (db) {
    const existing = await db
      .from("registrations")
      .select("id")
      .eq("game_name", gameName)
      .maybeSingle();
    if (existing.error) throw existing.error;

    const updatedAt = new Date().toISOString();
    if (existing.data) {
      const { data, error } = await db
        .from("registrations")
        .update({ choice, updated_at: updatedAt })
        .eq("id", existing.data.id)
        .select("id, game_name, choice, created_at, updated_at")
        .single();
      if (error) throw error;
      return { record: mapRow(data as SupabaseRegistrationRow), created: false };
    }

    const { data, error } = await db
      .from("registrations")
      .insert({
        game_name: gameName,
        choice,
        created_at: updatedAt,
        updated_at: updatedAt,
      })
      .select("id, game_name, choice, created_at, updated_at")
      .single();
    if (error) {
      // 并发下可能撞上同名唯一约束，此时按“更新”处理
      if (error.code === "23505") {
        const updated = await db
          .from("registrations")
          .update({ choice, updated_at: updatedAt })
          .eq("game_name", gameName)
          .select("id, game_name, choice, created_at, updated_at")
          .single();
        if (updated.error) throw updated.error;
        return {
          record: mapRow(updated.data as SupabaseRegistrationRow),
          created: false,
        };
      }
      throw error;
    }
    return { record: mapRow(data as SupabaseRegistrationRow), created: true };
  }

  const store = await readLocalStore();
  const now = new Date().toISOString();
  const found = store.registrations.find(
    (r) => r.gameName.toLowerCase() === gameName.toLowerCase()
  );
  if (found) {
    found.choice = choice;
    found.updatedAt = now;
    await writeLocalStore(store);
    return { record: { ...found }, created: false };
  }
  const record: Registration = {
    id: randomUUID(),
    gameName,
    choice,
    createdAt: now,
    updatedAt: now,
  };
  store.registrations.push(record);
  await writeLocalStore(store);
  return { record, created: true };
}

export async function deleteRegistration(id: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data, error } = await admin
      .from("registrations")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }
  const store = await readLocalStore();
  const before = store.registrations.length;
  store.registrations = store.registrations.filter((r) => r.id !== id);
  if (store.registrations.length === before) return false;
  await writeLocalStore(store);
  return true;
}

export async function getHitokotoCache(
  date: string
): Promise<HitokotoRecord | null> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data, error } = await admin
      .from("hitokoto_cache")
      .select("hitokoto, from_who")
      .eq("date", date)
      .maybeSingle();
    if (error) throw error;
    const row = data as SupabaseHitokotoRow | null;
    return row ? { text: row.hitokoto, from: row.from_who } : null;
  }
  const store = await readLocalStore();
  return store.hitokoto[date] ?? null;
}

export async function saveHitokotoCache(
  date: string,
  text: string,
  from: string
): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { error } = await admin.from("hitokoto_cache").upsert(
      { date, hitokoto: text, from_who: from, updated_at: new Date().toISOString() },
      { onConflict: "date" }
    );
    if (error) throw error;
    return;
  }
  const store = await readLocalStore();
  store.hitokoto[date] = { text, from };
  await writeLocalStore(store);
}

export async function getRegistrationWindow(): Promise<RegistrationWindow> {
  const db = getSupabase();
  if (db) {
    const { data, error } = await db
      .from("registration_settings")
      .select("start_at, end_at")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw error;
    const row = data as SupabaseRegistrationSettingsRow | null;
    return {
      startAt: row?.start_at ?? null,
      endAt: row?.end_at ?? null,
    };
  }
  const store = await readLocalStore();
  return store.window ?? { startAt: null, endAt: null };
}

export async function setRegistrationWindow(
  startAt: string | null,
  endAt: string | null
): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { error } = await admin.from("registration_settings").upsert(
      {
        id: 1,
        start_at: startAt,
        end_at: endAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) throw error;
    return;
  }
  const store = await readLocalStore();
  store.window = { startAt, endAt };
  await writeLocalStore(store);
}

export async function getSiteContent(key: string): Promise<string> {
  const db = getSupabase();
  if (db) {
    const { data, error } = await db
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    return (data as { value: string } | null)?.value ?? "";
  }
  const store = await readLocalStore();
  return store.siteContent[key] ?? "";
}

export async function setSiteContent(key: string, value: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { error } = await admin.from("site_content").upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );
    if (error) throw error;
    return;
  }
  const store = await readLocalStore();
  store.siteContent[key] = value;
  await writeLocalStore(store);
}

export async function addMessage(content: string): Promise<ClanMessage> {
  const db = getSupabase();
  if (db) {
    // 匿名身份对 messages 无读取权限，插入不带 RETURNING，避免触发行级安全限制
    const { error } = await db.from("messages").insert({ content });
    if (error) throw error;
    return {
      id: randomUUID(),
      content,
      createdAt: new Date().toISOString(),
    };
  }
  const store = await readLocalStore();
  const record: ClanMessage = {
    id: randomUUID(),
    content,
    createdAt: new Date().toISOString(),
  };
  store.messages.push(record);
  await writeLocalStore(store);
  return record;
}

export async function listMessages(): Promise<ClanMessage[]> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data, error } = await admin
      .from("messages")
      .select("id, content, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as SupabaseMessageRow[]).map((row) => ({
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
    }));
  }
  const store = await readLocalStore();
  return [...store.messages].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export async function deleteMessage(id: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data, error } = await admin
      .from("messages")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }
  const store = await readLocalStore();
  const before = store.messages.length;
  store.messages = store.messages.filter((message) => message.id !== id);
  if (store.messages.length === before) return false;
  await writeLocalStore(store);
  return true;
}

export async function listIntroModules(): Promise<IntroModule[]> {
  const db = getSupabase();
  if (db) {
    const { data, error } = await db
      .from("intro_modules")
      .select("id, title, items, note, sort_order")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return ((data ?? []) as SupabaseIntroModuleRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      items: row.items,
      note: row.note,
      sortOrder: row.sort_order,
    }));
  }
  const store = await readLocalStore();
  if (store.introModules.length > 0) return store.introModules;
  const defaults = DEFAULT_INTRO_MODULES.map((module, index) => ({
    id: randomUUID(),
    title: module.title,
    items: module.items,
    note: module.note,
    sortOrder: index + 1,
  }));
  store.introModules = defaults;
  await writeLocalStore(store);
  return defaults;
}

export async function replaceIntroModules(
  inputs: IntroModuleInput[]
): Promise<IntroModule[]> {
  const rows = inputs.map((input, index) => ({
    id:
      input.id && /^[\w-]{1,64}$/.test(input.id)
        ? input.id
        : randomUUID(),
    title: input.title,
    items: input.items,
    note: input.note,
    sort_order: index + 1,
  }));

  const admin = getSupabaseAdmin();
  if (admin) {
    const { error: deleteError } = await admin
      .from("intro_modules")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (deleteError) throw deleteError;
    const { error } = await admin.from("intro_modules").insert(rows);
    if (error) throw error;
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      items: row.items,
      note: row.note,
      sortOrder: row.sort_order,
    }));
  }

  const store = await readLocalStore();
  store.introModules = rows.map((row) => ({
    id: row.id,
    title: row.title,
    items: row.items,
    note: row.note,
    sortOrder: row.sort_order,
  }));
  await writeLocalStore(store);
  return store.introModules;
}
