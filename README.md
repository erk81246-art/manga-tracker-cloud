# Manga Tracker OnRead Build Fix

แก้ build error:
- Cannot find name 'onRead'
- ปุ่มอ่านต่อในหน้ารายละเอียดใช้ window.open โดยตรงแล้ว
- Reading History ยังทำงานผ่านปุ่มอ่านต่อหลัก/การ์ดอ่านล่าสุด
- ยังต้องรัน SQL last_read_fields.sql ถ้ายังไม่ได้รัน
