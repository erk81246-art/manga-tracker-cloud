-- Guest Mode: เปิดให้คนไม่ล็อกอินเห็น Collection / Tier / Detail ได้แบบอ่านอย่างเดียว
-- รันใน Supabase SQL Editor แค่ครั้งเดียว
-- คำสั่งนี้ไม่ลบข้อมูลเดิม

create policy if not exists "Public can preview manga"
on public.manga_items for select
to anon
using (true);
