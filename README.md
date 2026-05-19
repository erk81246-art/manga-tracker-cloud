# Manga Tracker Phase 2 Profile

เพิ่มจาก Phase 1:
- เอา "แหล่งอ่านหลัก" ออกจากหน้ารายละเอียดของแต่ละเรื่อง
- เพิ่ม Profile Card หลัง Login
- เพิ่ม nickname / avatar / theme
- เพิ่ม Splash Loading Screen แบบ Manga ID Card
- เพิ่ม Mini Stats ใน profile card: Collection / New / S Tier
- เพิ่มหน้าแก้ไข Profile
- ใช้ Supabase database เดิมได้ ข้อมูลมังงะเดิมไม่หาย

ต้องรัน SQL เพิ่ม 1 ครั้ง:
`supabase/phase2_profiles.sql`

Deploy:
อัปโหลดไฟล์ทั้งหมดทับ repo เดิม แล้ว Vercel จะ redeploy
