# Manga Tracker Guest Mode

เวอร์ชันนี้เพิ่ม Guest Mode ก่อน Login:
- คนไม่ล็อกอินดู Collection ได้
- ดู Tier List ได้
- กดดูรายละเอียดพื้นฐานได้
- ไม่เห็น/ไม่ใช้ปุ่มเปิดเว็บอ่าน
- ไม่เห็นจำนวนตอนล่าสุด/อ่านถึง
- เช็กตอนล่าสุดไม่ได้
- เพิ่ม/แก้ไข/ลบ/เปลี่ยน Tier ไม่ได้

หลัง Login ใช้งานเต็มเหมือนเดิม

## สำคัญ: ต้องเปิด Public Read ใน Supabase

เพราะตอนนี้ Supabase ใช้ RLS ถ้าไม่เปิด policy นี้ Guest จะมองไม่เห็นข้อมูล

ไปที่ Supabase > SQL Editor แล้วรันไฟล์:

supabase/guest_read_policy.sql

หรือรันคำสั่งนี้:

```sql
create policy if not exists "Public can preview manga"
on public.manga_items for select
to anon
using (true);
```

คำสั่งนี้ไม่ลบข้อมูลเดิม แต่จะทำให้คนที่เข้าเว็บโดยไม่ Login อ่านข้อมูลในตาราง manga_items ได้
ตัวแอพจะซ่อนลิงก์อ่านและจำนวนตอนใน UI สำหรับ Guest

## Deploy
อัปโหลดไฟล์ทั้งหมดทับ repo เดิม แล้ว Vercel จะ redeploy
ไม่ต้องแก้ Environment Variables
