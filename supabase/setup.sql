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

-- =============================================
-- ลบ Policy เก่าก่อนทั้งหมด (ป้องกัน error)
-- =============================================

-- Policy: ทุกคนอ่านได้ (public read)
DROP POLICY IF EXISTS "Public read" ON announcements;
DROP POLICY IF EXISTS "Public read" ON shipping_schedules;
DROP POLICY IF EXISTS "Public read" ON promo_images;
DROP POLICY IF EXISTS "Public read" ON gallery_images;
DROP POLICY IF EXISTS "Public read" ON news_articles;
DROP POLICY IF EXISTS "Public read" ON br_pay_configs;
DROP POLICY IF EXISTS "Public read" ON detail_contents;
DROP POLICY IF EXISTS "Public read" ON address_blocks;
DROP POLICY IF EXISTS "Public read" ON nocode_pages;
DROP POLICY IF EXISTS "Public read" ON nocode_blocks;
DROP POLICY IF EXISTS "Public read" ON admin_emails;

-- Policy: Notifications
DROP POLICY IF EXISTS "Auth read notifications" ON notifications;
DROP POLICY IF EXISTS "Auth write notifications" ON notifications;

-- Policy: User Profile
DROP POLICY IF EXISTS "User own profile" ON users;

-- Policy: Admin / Authenticated write
DROP POLICY IF EXISTS "Auth insert announcements" ON announcements;
DROP POLICY IF EXISTS "Auth update announcements" ON announcements;
DROP POLICY IF EXISTS "Auth delete announcements" ON announcements;

DROP POLICY IF EXISTS "Auth write shipping" ON shipping_schedules;
DROP POLICY IF EXISTS "Auth write promo" ON promo_images;
DROP POLICY IF EXISTS "Auth write gallery" ON gallery_images;
DROP POLICY IF EXISTS "Auth write news" ON news_articles;
DROP POLICY IF EXISTS "Auth write brpay" ON br_pay_configs;
DROP POLICY IF EXISTS "Auth write detail" ON detail_contents;
DROP POLICY IF EXISTS "Auth write address" ON address_blocks;
DROP POLICY IF EXISTS "Auth write nocode_pages" ON nocode_pages;
DROP POLICY IF EXISTS "Auth write nocode_blocks" ON nocode_blocks;
DROP POLICY IF EXISTS "Auth write admin_emails" ON admin_emails;

-- =============================================
-- สร้าง Policy ใหม่
-- =============================================

-- ทุกคนอ่านได้ (Public)
CREATE POLICY "Public read" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public read" ON shipping_schedules FOR SELECT USING (true);
CREATE POLICY "Public read" ON promo_images FOR SELECT USING (true);
CREATE POLICY "Public read" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Public read" ON news_articles FOR SELECT USING (true);
CREATE POLICY "Public read" ON br_pay_configs FOR SELECT USING (true);
CREATE POLICY "Public read" ON detail_contents FOR SELECT USING (true);
CREATE POLICY "Public read" ON address_blocks FOR SELECT USING (true);
CREATE POLICY "Public read" ON nocode_pages FOR SELECT USING (true);
CREATE POLICY "Public read" ON nocode_blocks FOR SELECT USING (true);
CREATE POLICY "Public read" ON admin_emails FOR SELECT USING (true);

-- Notifications (เฉพาะผู้ใช้ที่ล็อกอิน)
CREATE POLICY "Auth read notifications" ON notifications 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Auth write notifications" ON notifications 
FOR ALL USING (auth.uid() = user_id);

-- User Profile (แก้ไขข้อมูลตัวเองได้)
CREATE POLICY "User own profile" ON users 
FOR ALL USING (auth.uid() = id);

-- Authenticated users can write (Admin)
CREATE POLICY "Auth insert announcements" ON announcements 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth update announcements" ON announcements 
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth delete announcements" ON announcements 
FOR DELETE USING (auth.role() = 'authenticated');

-- Write policies สำหรับตารางอื่น ๆ
CREATE POLICY "Auth write shipping" ON shipping_schedules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write promo" ON promo_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write gallery" ON gallery_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write news" ON news_articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write brpay" ON br_pay_configs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write detail" ON detail_contents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write address" ON address_blocks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write nocode_pages" ON nocode_pages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write nocode_blocks" ON nocode_blocks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth write admin_emails" ON admin_emails FOR ALL USING (auth.role() = 'authenticated');
-- ======================================================
-- Enable Realtime สำหรับ Announcements และ BrPayConfig
-- ======================================================
alter publication supabase_realtime add table announcements;
alter publication supabase_realtime add table br_pay_configs;
alter publication supabase_realtime add table notifications;
