# Manga Tracker Null After Save Fix

แก้ปัญหา:
- หลังบันทึกแล้วหน้า crash
- Console: Cannot read properties of null (reading 'title')
- สาเหตุ: update สำเร็จเป็น 204 แต่โค้ดเอา data=null ไปใส่ใน items

แก้แล้ว:
- หลัง update สำเร็จ ใช้ payload อัปเดต state แทน data จาก Supabase
- เพิ่ม safeItems กัน null ใน list/filter/hero
- ยังเก็บ fix เดิมที่ลบ select=* หลัง update
- ไม่ต้องรัน SQL ใหม่

ยังพบ pattern ? data : item เหลือไหม: False
