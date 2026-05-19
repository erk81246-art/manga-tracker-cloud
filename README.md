# Manga Tracker Portrait Bottom Nav Fix

แก้ breakpoint:
- iPad แนวตั้งจะใช้ layout แบบ bottom bar แล้ว
- dashboard/sidebar จะใช้เฉพาะจอกว้างระดับ xl เช่น iPad แนวนอน/desktop
- ซ่อนกล่องใหญ่ด้านบนในแนวตั้ง
- bottom bar มี Collection / Tier / เว็บอ่าน / เพิ่ม
- ไม่ต้องรัน SQL ใหม่
- ข้อมูลเดิมไม่หาย

สำคัญ:
หลังอัปโหลดทับ GitHub แล้วต้องรอ Vercel deploy ใหม่ และ refresh แบบล้าง cache บน iPad
