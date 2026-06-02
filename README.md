# Manga Tracker History Last URL Build Fix

แก้ build error:
- Cannot find name 'continueUrl'
- ปุ่มอ่านต่อใช้ item.last_read_url || item.source_url โดยตรง
- ยังต้องรัน SQL supabase/last_read_fields.sql เหมือนเดิม
