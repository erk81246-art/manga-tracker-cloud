# Manga Tracker User Progress Props Fix

แก้ build error:
- Cannot find name 'onSaveProgress'
- เพิ่ม onSaveProgress / onOpenMainSource เข้า DetailModal props แล้ว
- ส่ง saveProgress / openMainSource ตอนเรียก DetailModal แล้ว
- ยังต้องรัน SQL: supabase/user_progress.sql
