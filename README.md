# Manga Tracker State Final Fix

แก้จากโค้ดจริงที่ส่งมา:
- saveItem ตอนแก้ไขมังงะไม่ใช้ data จาก Supabase แล้ว
- เพราะ update แบบไม่ select จะได้ data = null
- เปลี่ยนเป็น setItems ด้วย { ...item, ...next }
- แก้ safeItems reference ที่ทำให้ build fail
- เพิ่ม guard กัน item เป็น null ใน filter/stats
- ไม่ต้องรัน SQL ใหม่

ตรวจสอบ:
- ยังเหลือ "(data as MangaItem)" ในไฟล์ไหม: False
- ยังเหลือ "safeItems" ในไฟล์ไหม: False
- update(next) ยังมี .select ตามหลังไหม: False
