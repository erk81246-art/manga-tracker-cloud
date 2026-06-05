# Manga Tracker Sprint 5 UX Clean

แก้ตามที่ขอ:
- มือถือ: ซ่อน Top Navbar ด้านบนทั้งหมด
- มือถือ: Bottom Bar เปลี่ยนปุ่ม เพิ่ม เป็น เมนู
- Desktop/iPad: ลบกล่อง แหล่งอ่านหลัก ออกจากหน้า Collection
- Desktop/iPad: ลบ Search Box เก่า เหลือ Search ใน Top Navbar เท่านั้น
- ลบ Dashboard ออกจาก Navigation และไม่ render หน้า Dashboard แล้ว
- กดอ่านจาก Detail ผ่านปุ่ม กดอ่าน จะ rememberHistory เพื่อให้ขึ้น Continue
- ไม่ต้องรัน SQL ใหม่

ไฟล์หลัก:
app/page.tsx
