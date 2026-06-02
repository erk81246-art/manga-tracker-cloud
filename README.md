# Manga Tracker History Open URL

แก้ Reading History:
- กดการ์ดใน "อ่านล่าสุด" แล้วเปิด last_read_url ทันที
- ถ้าไม่มี last_read_url จะเปิด source_url
- ถ้าไม่มี URL เลยค่อยเปิดรายละเอียด
- ยังมีปุ่ม "รายละเอียด" แยกไว้
- เพิ่ม last_read_at ตอนบันทึก last_read_url
- ยังต้องรัน SQL supabase/last_read_fields.sql ถ้ายังไม่ได้รัน
