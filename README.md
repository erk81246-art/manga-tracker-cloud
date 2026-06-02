# Manga Tracker Detail Cinematic Polish

แก้ตามที่ขอ:
1. หน้ารายละเอียดนิ่งขึ้น
- ใช้ h-[92dvh] และ overscroll-contain
- ลดการขยับของ modal ตอน scroll

2. ปุ่มอ่านต่อไม่ซ้ำ
- เอาปุ่มอ่านต่อด้านบนออก
- เหลืออ่านต่อใน bottom action bar จุดเดียว

3. ปุ่มแก้ไขกลับมา
- Bottom bar มีปุ่ม อ่านต่อ / แก้ไข / ลบ
- ปุ่มแก้ไขแสดงเมื่อ canManage

4. แถบอ่านล่าสุดกลับหน้าหลัก
- เพิ่ม/คืน ReadingHistoryRow ใต้ Hero
- ไม่ต้องรัน SQL ใหม่
