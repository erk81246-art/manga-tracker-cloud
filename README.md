# Manga Tracker Follow System

เพิ่ม:
- ทุก account ที่ login เห็น manga_items ทั้งหมดร่วมกัน
- ปุ่ม Favorite/Follow ในหน้ารายละเอียดแต่ละเรื่อง
- Favorite แยกตามบัญชี ไม่เหมือนกัน
- แสดง badge หัวใจบนปกเรื่องที่ favorite
- เพิ่มปุ่ม Logout ใน bottom bar แนวตั้ง
- ต้องรัน SQL เพิ่ม 1 ครั้ง: `supabase/follow_system.sql`

หมายเหตุ:
ตอนนี้ Favorite sync ผ่าน Supabase แล้ว
ส่วนเว็บอ่านหลักที่เพิ่มเองยังเก็บใน localStorage ของเครื่อง
