# Manga Tracker Cloud Sync

เพิ่ม:
- Login / Sign up ด้วยอีเมล
- Login ด้วย Google ถ้าตั้งค่า Provider ใน Supabase
- Cloud Sync ผ่าน Supabase Database
- Upload รูปปกจากมือถือผ่าน Supabase Storage

## ตั้งค่า Supabase

1. สร้าง Project ที่ supabase.com
2. ไปที่ SQL Editor
3. คัดลอกโค้ดจาก `supabase/setup.sql` ไปรัน
4. ไปที่ Project Settings > API
5. เอา Project URL และ anon public key ไปใส่ใน Vercel Environment Variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
6. Redeploy

## Google Login
ต้องเปิด Google Provider ใน Supabase Auth ก่อน ถ้ายังไม่เปิด ใช้ email/password ได้เลย
