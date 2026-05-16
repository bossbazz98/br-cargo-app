# BR CARGO — วิธีติดตั้งหลังแก้โค้ดเสร็จ

## ขั้นตอนที่ 1 — ตั้งค่า Supabase Database

1. เปิด https://supabase.com → เข้า Project ของคุณ
2. คลิก **SQL Editor** (ไอคอนฐานข้อมูล ด้านซ้าย)
3. คลิก **New query**
4. เปิดไฟล์ `supabase/setup.sql` แล้ว copy ทั้งหมด วางในช่อง SQL Editor
5. กด **Run** (หรือ Ctrl+Enter)
6. ควรเห็น "Success" — ตาราง database ถูกสร้างแล้วทั้งหมด

---

## ขั้นตอนที่ 2 — เปิด Email Auth ใน Supabase

1. ใน Supabase → **Authentication** → **Providers**
2. ตรวจสอบว่า **Email** เปิดอยู่ (toggle สีเขียว)
3. ปิด "Confirm email" ถ้าต้องการให้ login ได้ทันทีโดยไม่ต้องกด confirm

---

## ขั้นตอนที่ 3 — Deploy Edge Functions (LINE Login + Send Email)

เปิด Terminal แล้วรันคำสั่งต่อไปนี้:

```bash
# ติดตั้ง Supabase CLI
brew install supabase/tap/supabase

# เข้า folder โปรเจกต์
cd path/to/your/project

# Login Supabase
supabase login

# Link กับ project ของคุณ (หา Project ID ได้จาก Supabase Dashboard → Settings → General)
supabase link --project-ref ohybaapjlbsxtiumdggb

# Deploy LINE Login function
supabase functions deploy lineLogin

# Deploy Send Email function
supabase functions deploy send-email
```

---

## ขั้นตอนที่ 4 — ตั้งค่า Secret สำหรับ Send Email

1. สมัคร https://resend.com (ฟรี 3,000 emails/เดือน)
2. ไปที่ API Keys → Create API Key → copy key
3. ใน Supabase Dashboard → **Settings** → **Edge Functions** → **Add new secret**
   - Name: `RESEND_API_KEY`
   - Value: (วาง key จาก Resend)
4. แก้ไขไฟล์ `supabase/functions/send-email/index.ts` บรรทัด from:
   ```
   from: 'BR CARGO <noreply@yourdomain.com>'
   ```
   เปลี่ยนเป็น domain ที่คุณ verify ใน Resend

---

## ขั้นตอนที่ 5 — ตั้งค่า Firebase Storage CORS

เปิด Terminal แล้วรัน:

```bash
# ติดตั้ง Firebase CLI (ถ้ายังไม่มี)
npm install -g firebase-tools

# Login
firebase login

# สร้างไฟล์ cors.json
echo '[{"origin": ["*"], "method": ["GET", "POST", "PUT"], "maxAgeSeconds": 3600}]' > cors.json

# Apply CORS (เปลี่ยน log-in-1-1b44f เป็น storageBucket ของคุณ)
gsutil cors set cors.json gs://log-in-1-1b44f.firebasestorage.app
```

---

## ขั้นตอนที่ 6 — รันโปรเจกต์

```bash
# เข้า folder โปรเจกต์
cd path/to/your/project

# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev
```

เปิด browser ไปที่ http://localhost:5173

---

## ขั้นตอนที่ 7 — Deploy ขึ้น Vercel

```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Deploy (ทำครั้งแรก)
vercel

# ทำตามคำถาม:
# - Set up and deploy? → Y
# - Which scope? → เลือก account ของคุณ
# - Link to existing project? → N
# - Project name? → br-cargo (หรือชื่อที่ต้องการ)
# - Directory? → ./  (กด Enter)
# - Override settings? → N
```

หลัง deploy เสร็จ จะได้ URL เช่น https://br-cargo.vercel.app

---

## LINE Login — ตั้งค่า Redirect URI

หลังได้ URL จาก Vercel แล้ว:

1. เปิด https://developers.line.biz → Channel ของคุณ
2. **LINE Login** → **Callback URL**
3. เพิ่ม: `https://your-app.vercel.app/`
4. บันทึก

---

## สรุป Stack

| ส่วน | บริการ |
|---|---|
| Database | Supabase (PostgreSQL) |
| Auth (Email/Password) | Supabase Auth |
| Auth (Google) | Firebase Auth |
| Auth (LINE) | Supabase Edge Function |
| File Upload | Firebase Storage |
| Email (OTP) | Resend + Supabase Edge Function |
| Hosting | Vercel |
