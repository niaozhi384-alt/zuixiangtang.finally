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

-- 报名时间设置表：仅一行（id=1），由首领后台维护
create table if not exists registration_settings (
  id smallint primary key default 1 check (id = 1),
  start_at timestamptz,
  end_at timestamptz,
  updated_at timestamptz not null default now()
);

-- 匿名留言表：仅首领（服务端密钥）可读
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  created_at timestamptz not null default now()
);

-- 站点内容表：支持首领在线修改首页内容（如部落介绍）
create table if not exists site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- 部落介绍模块表：每个小模块一行，可增删改与排序
create table if not exists intro_modules (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  items text not null default '',
  note text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_registrations_choice
  on registrations (choice);
create index if not exists idx_registrations_created
  on registrations (created_at);

-- 行级安全（RLS）
alter table registrations enable row level security;
alter table hitokoto_cache enable row level security;
alter table registration_settings enable row level security;
alter table messages enable row level security;
alter table site_content enable row level security;
alter table intro_modules enable row level security;

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

-- 报名时间设置：所有人可读（用于页面显示报名状态），写入由服务端密钥完成
drop policy if exists "public can read registration settings" on registration_settings;
create policy "public can read registration settings"
  on registration_settings for select
  using (true);

-- 匿名留言：任何人可提交，读取仅服务端密钥
drop policy if exists "public can insert messages" on messages;
create policy "public can insert messages"
  on messages for insert
  with check (true);

-- 站点内容：所有人可读，写入由服务端密钥完成
drop policy if exists "public can read site content" on site_content;
create policy "public can read site content"
  on site_content for select
  using (true);

-- 部落介绍模块：所有人可读，写入由服务端密钥完成
drop policy if exists "public can read intro modules" on intro_modules;
create policy "public can read intro modules"
  on intro_modules for select
  using (true);

insert into registration_settings (id, start_at, end_at)
values (1, null, null)
on conflict (id) do nothing;

insert into site_content (key, value)
values ('clan_intro', '')
on conflict (key) do nothing;

-- 仅当表为空时写入默认五个介绍模块
insert into intro_modules (id, title, items, note, sort_order)
select * from (values
  (gen_random_uuid(), '部落活动', E'部落战 · 联赛 · 竞赛\n十级都城', '有奶🍼 兼顾休闲娱乐', 1),
  (gen_random_uuid(), '晋升之阶', E'捐兵一千 · 长老\n捐兵两千 · 副首', '', 2),
  (gen_random_uuid(), '奖励机制', E'竞赛第一：5 元 🧧\n联赛第一：8.88', '并列第一看捐兵数与活跃度', 3),
  (gen_random_uuid(), '职位增幅', E'长老：奖励增幅 0.05\n副首：奖励增幅 0.25', '仅群成员有效', 4),
  (gen_random_uuid(), '联赛纪律', E'挂绿牌未打、乱打者\n有职位降职 · 无职位 ✈', '', 5)
) as v(id, title, items, note, sort_order)
where not exists (select 1 from intro_modules);

-- 说明：服务端使用 SERVICE_ROLE_KEY，具备最高权限，可删除记录，
-- 因此匿名成员无法通过公开接口删除任何报名数据。
