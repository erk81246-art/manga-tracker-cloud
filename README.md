# Manga Tracker Open Reading History

แก้ตามที่ขอ:
- กดดูรายละเอียด จะไม่เข้า "อ่านล่าสุด" แล้ว
- เฉพาะกด "อ่านต่อ" เท่านั้นถึงจะบันทึก Reading History
- เพิ่ม openReading(item) แยกจาก openDetail(item)
- openReading จะพยายามเปิด:
  1) last_read_url ถ้ามี
  2) ถ้าไม่มี จะสร้างจาก source_url + /chapter-{read_chapter}
  3) ถ้าไม่มี chapter จะเปิด source_url
- เหมาะกับเว็บที่ URL เป็นแพทเทิร์น เช่น /chapter-124
- ยังต้องรัน SQL last_read_fields.sql ถ้ายังไม่ได้รัน
