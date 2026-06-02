# Manga Tracker Admin Email

เพิ่มระบบ Admin แบบ B:
- Admin email: erk81246@gmail.com
- Admin แก้ / ลบ / เปลี่ยน Tier ได้ทุกเรื่อง
- User ทั่วไปแก้ / ลบ / เปลี่ยน Tier ได้เฉพาะเรื่องที่ตัวเองเพิ่ม
- User ทุกคนยังเห็นมังงะทั้งหมด และ Favorite/Follow ได้เหมือนเดิม
- ไม่ต้องรัน SQL ใหม่

ถ้าจะเพิ่ม admin ใหม่:
แก้ const ADMIN_EMAILS ใน app/page.tsx แล้ว deploy ใหม่
