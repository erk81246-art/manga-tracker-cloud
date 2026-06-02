# Manga Tracker Admin Update Fix

แก้ปัญหา:
- กดบันทึกแก้ไขมังงะแล้วขึ้น 406
- Error: Cannot coerce the result to a single JSON object

สาเหตุ:
- โค้ด update manga_items ยังเรียก .select().single()
- พอ RLS/Shared Library ทำให้ update สำเร็จแต่ select row กลับมาไม่ได้ จึงเกิด 406

แก้แล้ว:
- ลบ .select().single() / .maybeSingle() หลัง update manga_items
- ให้เช็กแค่ error จาก update
- ไม่ต้องรัน SQL ใหม่

จำนวนจุดที่ patch ได้โดยตรง: 1
