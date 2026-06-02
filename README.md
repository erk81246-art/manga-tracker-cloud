# Manga Tracker Hero onRead Prop Fix

แก้ build error:
- HeroCarousel ต้องการ prop onRead
- เพิ่ม onRead={openReading} ตอนเรียก HeroCarousel แล้ว
- ไม่ต้องรัน SQL เพิ่ม ถ้ารัน last_read_fields.sql แล้ว
