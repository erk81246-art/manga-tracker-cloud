# Manga Tracker Guest Login Bottom Scope Fix

แก้ build error:
- Cannot find name 'authOpen'
- ใส่ const [authOpen, setAuthOpen] ใน App component แล้ว
- ย้าย auth modal ให้อยู่ใน scope ของ App
- Guest ยังเข้าแอปได้ก่อน แล้วค่อยกดเข้าสู่ระบบจากแถบล่าง/เมนู
- ไม่ต้องรัน SQL ใหม่
