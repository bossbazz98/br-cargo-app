-- ======================================================
-- BR CARGO — Supabase Database Setup
-- วิธีใช้: เปิด Supabase Dashboard → SQL Editor → วาง SQL ทั้งหมดนี้แล้วกด Run
-- ======================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Users (profile เพิ่มเติมจาก Supabase Auth) ──────────
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  picture_url text,
  line_user_id text,
  role text default 'user',
  created_at timestamptz default now()
);

-- ─── Admin Emails ─────────────────────────────────────────
create table if not exists admin_emails (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  created_at timestamptz default now()
);

-- ─── Announcements ────────────────────────────────────────
create table if not exists announcements (
  id uuid primary key default uuid_generate_v4(),
  title text,
  message text,
  is_active boolean default true,
  icon_kind text,
  emoji text,
  icon_name text,
  tone text,
  created_at timestamptz default now()
);

-- ─── Notifications ────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  title text,
  message text,
  type text,
  is_read boolean default false,
  icon_kind text,
  emoji text,
  icon_name text,
  tone text,
  created_at timestamptz default now()
);

-- ─── Shipping Schedules ───────────────────────────────────
create table if not exists shipping_schedules (
  id uuid primary key default uuid_generate_v4(),
  month_label text,
  year int,
  month int,
  "order" int default 0,
  air_lots jsonb default '[]',
  sea_lots jsonb default '[]',
  created_at timestamptz default now()
);

-- ─── Promo Images ─────────────────────────────────────────
create table if not exists promo_images (
  id uuid primary key default uuid_generate_v4(),
  image_url text,
  link_url text,
  "order" int default 0,
  created_at timestamptz default now()
);

-- ─── Gallery Images ───────────────────────────────────────
create table if not exists gallery_images (
  id uuid primary key default uuid_generate_v4(),
  image_url text,
  caption text,
  "order" int default 0,
  created_at timestamptz default now()
);

-- ─── News Articles ────────────────────────────────────────
create table if not exists news_articles (
  id uuid primary key default uuid_generate_v4(),
  title text,
  content text,
  image_url text,
  category text,
  created_at timestamptz default now()
);

-- ─── BR Pay Config ────────────────────────────────────────
create table if not exists br_pay_configs (
  id uuid primary key default uuid_generate_v4(),
  qr_image_url text,
  bank_name text,
  account_number text,
  account_name text,
  created_at timestamptz default now()
);

-- ─── Detail Contents ──────────────────────────────────────
create table if not exists detail_contents (
  id uuid primary key default uuid_generate_v4(),
  title text,
  content text,
  image_url text,
  "order" int default 0,
  created_at timestamptz default now()
);

-- ─── Address Blocks ───────────────────────────────────────
create table if not exists address_blocks (
  id uuid primary key default uuid_generate_v4(),
  title text,
  content text,
  "order" int default 0,
  created_at timestamptz default now()
);

-- ─── NoCode Pages ─────────────────────────────────────────
create table if not exists nocode_pages (
  id uuid primary key default uuid_generate_v4(),
  title text,
  description text,
  created_at timestamptz default now()
);

-- ─── NoCode Blocks ────────────────────────────────────────
create table if not exists nocode_blocks (
  id uuid primary key default uuid_generate_v4(),
  page_id uuid references nocode_pages(id) on delete cascade,
  type text,
  content jsonb,
  "order" int default 0,
  created_at timestamptz default now()
);

-- ======================================================
-- Row Level Security (RLS) — เปิดให้อ่านได้สาธารณะ
-- ======================================================
alter table users enable row level security;
alter table admin_emails enable row level security;
alter table announcements enable row level security;
alter table notifications enable row level security;
alter table shipping_schedules enable row level security;
alter table promo_images enable row level security;
alter table gallery_images enable row level security;
alter table news_articles enable row level security;
alter table br_pay_configs enable row level security;
alter table detail_contents enable row level security;
alter table address_blocks enable row level security;
alter table nocode_pages enable row level security;
alter table nocode_blocks enable row level security;

-- Policy: ทุกคนอ่านได้ (public read)
create policy "Public read" on announcements for select using (true);
create policy "Public read" on shipping_schedules for select using (true);
create policy "Public read" on promo_images for select using (true);
create policy "Public read" on gallery_images for select using (true);
create policy "Public read" on news_articles for select using (true);
create policy "Public read" on br_pay_configs for select using (true);
create policy "Public read" on detail_contents for select using (true);
create policy "Public read" on address_blocks for select using (true);
create policy "Public read" on nocode_pages for select using (true);
create policy "Public read" on nocode_blocks for select using (true);
create policy "Public read" on admin_emails for select using (true);

-- Policy: เฉพาะ user ที่ login แล้วอ่าน-เขียน notifications ของตัวเอง
create policy "Auth read notifications" on notifications for select using (auth.role() = 'authenticated');
create policy "Auth write notifications" on notifications for all using (auth.role() = 'authenticated');

-- Policy: เฉพาะ user ที่ login แล้วอ่าน-แก้ไขข้อมูลตัวเอง
create policy "User own profile" on users for all using (auth.uid() = id);

-- Policy: authenticated users write ทุก table (admin จะกรอง logic ใน app)
create policy "Auth insert announcements" on announcements for insert with check (auth.role() = 'authenticated');
create policy "Auth update announcements" on announcements for update using (auth.role() = 'authenticated');
create policy "Auth delete announcements" on announcements for delete using (auth.role() = 'authenticated');

create policy "Auth write shipping" on shipping_schedules for all using (auth.role() = 'authenticated');
create policy "Auth write promo" on promo_images for all using (auth.role() = 'authenticated');
create policy "Auth write gallery" on gallery_images for all using (auth.role() = 'authenticated');
create policy "Auth write news" on news_articles for all using (auth.role() = 'authenticated');
create policy "Auth write brpay" on br_pay_configs for all using (auth.role() = 'authenticated');
create policy "Auth write detail" on detail_contents for all using (auth.role() = 'authenticated');
create policy "Auth write address" on address_blocks for all using (auth.role() = 'authenticated');
create policy "Auth write nocode_pages" on nocode_pages for all using (auth.role() = 'authenticated');
create policy "Auth write nocode_blocks" on nocode_blocks for all using (auth.role() = 'authenticated');
create policy "Auth write admin_emails" on admin_emails for all using (auth.role() = 'authenticated');

-- ======================================================
-- Enable Realtime สำหรับ Announcements และ BrPayConfig
-- ======================================================
alter publication supabase_realtime add table announcements;
alter publication supabase_realtime add table br_pay_configs;
alter publication supabase_realtime add table notifications;
