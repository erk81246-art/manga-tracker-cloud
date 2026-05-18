# Manga Tracker Guest Tier Only

เวอร์ชันนี้ปรับ Guest Mode:
- ก่อน Login เห็นเฉพาะหน้า Tier List
- ก่อน Login กดดูรายละเอียดพื้นฐานได้
- ก่อน Login ไม่เห็น/ไม่เข้า Collection
- ก่อน Login เปิดเว็บอ่าน เช็กตอน เพิ่ม แก้ไข ลบ ไม่ได้
- หลัง Login ใช้งานทุกอย่างเหมือนเดิม

ใช้ Supabase database เดิมได้เลย
ไม่ต้องรัน SQL ใหม่ ถ้าเคยเปิด guest read policy แล้ว


## Premium UI update
- Swipe down เพื่อปิดหน้ารายละเอียดบนมือถือ
- Floating action button ใหม่
- iPad/Desktop master-detail: กดรูปแล้วรายละเอียดอยู่ด้านขวา
- Detail modal แบบ hero พร้อม background blur เบา ๆ
- Guest เห็นเฉพาะ preview และต้อง login เพื่อใช้งานเต็ม
