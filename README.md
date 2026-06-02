# Manga Tracker Guest Login Bottom Real Fix

แก้จริงตามที่ขอ:
1. Guest
- เอา AuthBox ออกจากหน้าแรกแล้ว
- Guest เห็น Collection / Tier / เว็บอ่าน ก่อน
- ปุ่มเข้าสู่ระบบอยู่ที่แถบล่าง และในเมนู

2. Reading History
- กดรายละเอียดไม่เข้าอ่านล่าสุด
- ปุ่มอ่านต่อใน Detail เรียก onRead/openReading แล้ว
- กดอ่านต่อจะบันทึกอ่านล่าสุดก่อนเปิดเว็บ

ไม่ต้องรัน SQL ใหม่
