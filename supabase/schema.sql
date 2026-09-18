-- =============================================================
-- 醉乡堂部落 · 联赛报名数据库结构（Supabase / PostgreSQL）
-- 使用方法：Supabase 控制台 → SQL Editor → 粘贴全文 → Run
-- =============================================================

create extension if not exists pgcrypto;

-- 联赛报名表：同一游戏名称唯一，重复提交时更新状态
create table if not exists registrations (
  id uuid primary key default gen_random_uuid(),
  game_name text not null unique,
  choice text not null check (choice in ('register', 'skip')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 每日一言缓存表：以日期为主键，每天只抓取一次
create table if not exists hitokoto_cache (
  date date primary key,
  hitokoto text not null,
  from_who text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists idx_registrations_choice
  on registrations (choice);
create index if not exists idx_registrations_created
  on registrations (created_at);

-- 行级安全（RLS）
alter table registrations enable row level security;
alter table hitokoto_cache enable row level security;

-- 成员端（匿名密钥）权限：可读、可提交、可修改；不可删除
drop policy if exists "public can read registrations" on registrations;
create policy "public can read registrations"
  on registrations for select
  using (true);

drop policy if exists "public can insert registrations" on registrations;
create policy "public can insert registrations"
  on registrations for insert
  with check (true);

drop policy if exists "public can update registrations" on registrations;
create policy "public can update registrations"
  on registrations for update
  using (true) with check (true);

-- 一言缓存：所有人可读（写入由服务端密钥客户端完成，自动绕过 RLS）
drop policy if exists "public can read hitokoto cache" on hitokoto_cache;
create policy "public can read hitokoto cache"
  on hitokoto_cache for select
  using (true);

-- 说明：服务端使用 SERVICE_ROLE_KEY，具备最高权限，可删除记录，
-- 因此匿名成员无法通过公开接口删除任何报名数据。
