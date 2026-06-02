# Manga Tracker Last Read At Null Fix

แก้ปัญหาเพิ่มมังงะไม่ได้:
- Error: invalid input syntax for type timestamp with time zone: ""
- สาเหตุ: last_read_at ถูกส่งเป็น string ว่าง ""
- แก้ให้ส่งเป็น null หรือ ISO date เท่านั้น

สิ่งที่แก้:
- emptyForm last_read_at = null
- sanitize payload ก่อน insert/update
- last_read_url / last_read_chapter ว่าง จะเป็น null
- ไม่ต้องรัน SQL ใหม่ ถ้ารัน last_read_fields.sql แล้ว
