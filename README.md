# Manga Tracker Reading Syntax Fix

แก้จากไฟล์ก่อนหน้าที่มี syntax error:
- กลับไปใช้ฐาน history-direct-url-clean แล้วใส่ openReading แบบปลอดภัยใหม่
- กดรายละเอียดไม่เข้าอ่านล่าสุด
- กดอ่านต่อถึงเข้าอ่านล่าสุด
- อ่านต่อจะเปิด last_read_url ก่อน ถ้าไม่มีสร้างจาก source_url + /chapter-{read_chapter}
- เอา Continue Reading ออก
- ยังต้องรัน SQL last_read_fields.sql ถ้ายังไม่ได้รัน
