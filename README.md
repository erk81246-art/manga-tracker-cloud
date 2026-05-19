# Manga Tracker Dashboard Fix 2

แก้ตาม feedback:
- แหล่งอ่านหลักเป็นปุ่มเดียว กดแล้วเปิด modal รายชื่อเว็บ
- Guest เห็น Tier List ได้ โดยโหลดข้อมูล public จาก Supabase
- Guest เปิดเว็บอ่าน / เช็กตอนล่าสุด / แก้ไข / ลบไม่ได้
- Sidebar ซ้ายเล็กลง เหลือจำนวนทั้งหมด
- ตัดกล่อง มีตอนใหม่ / กำลังอ่าน / อ่านจบ ออกจาก sidebar
- iPad แนวตั้งกลับมาเป็น layout แนวตั้งเพื่อสัดส่วนไม่แปลก
- Dashboard sidebar ใช้เฉพาะจอกว้างมากขึ้น
- ไม่ต้องรัน SQL ใหม่ ถ้าเคยรัน public preview policy แล้ว

อัปโหลดไฟล์ทั้งหมดทับ repo เดิม แล้ว Vercel จะ deploy
