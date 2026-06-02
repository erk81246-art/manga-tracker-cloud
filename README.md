# Manga Tracker History Direct URL Clean

แก้ตามที่ขอ:
1. การ์ด "อ่านล่าสุด"
- กดการ์ดแล้วเปิด last_read_url ทันที
- ถ้าไม่มี last_read_url จะเปิด source_url
- ถ้าไม่มีทั้งคู่ค่อยเปิดรายละเอียด

2. แนวนอน
- เอาแถบ Continue Reading / อ่านต่อ ออกแล้ว
- เหลือ Reading History / อ่านล่าสุด เป็นหลัก ไม่ซ้ำซ้อน

3. Last Read URL
- ช่องอ่านต่อ URL ควรใส่ลิงก์ chapter โดยตรง เช่น
  https://speed-manga.net/manga/solo-leveling/chapter-124

ต้องรัน SQL supabase/last_read_fields.sql ถ้ายังไม่ได้รัน

Checks: {'ReadingHistoryRow': True, 'ContinueReading_usage': False, 'last_read_url': True}
