# Manga Tracker Profile Splash

เพิ่ม:
- หน้าโหลดก่อนเข้าเว็บแบบ Profile Card รูปใหญ่เกือบเต็มหน้าจอ
- ใช้รูป profile ของแต่ละบัญชี
- ถ้ายังไม่มี profile จะมี modal ให้ตั้งชื่อเล่นและรูปโปรไฟล์
- ปุ่ม Profile อยู่ใน greeting card หลัง login
- ไม่กระทบข้อมูลมังงะเดิม

ต้องรัน SQL เพิ่ม 1 ครั้ง ถ้ายังไม่เคยสร้าง profiles table:
supabase/profile_splash_profiles.sql
