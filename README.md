# Manga Tracker Reading Safe Fix

แก้ปุ่มอ่าน:
- กดอ่านต่อได้แน่นอน
- openReading ไม่ await Supabase ก่อนเปิดเว็บแล้ว จึงไม่ค้าง
- ถ้า save history ลง Supabase fail จะ warn เฉย ๆ ไม่บล็อกการอ่าน
- ถ้าไม่มี last_read_url จะสร้างจาก source_url + /chapter-{read_chapter}
- ถ้าสร้างไม่ได้ จะเปิด source_url เดิม
- กดรายละเอียดไม่เข้าอ่านล่าสุด
- เฉพาะกดอ่านต่อถึงเข้าอ่านล่าสุด
