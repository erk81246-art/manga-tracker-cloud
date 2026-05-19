# Manga Tracker Dashboard Layout Safe

เวอร์ชันแก้ build:
- ปรับ layout เป็น dashboard บน iPad/Desktop
- Header สีดำกลายเป็น sidebar ซ้ายบนจอกว้าง
- Main area มี greeting + source bar + search + grid
- เอาแหล่งอ่านหลักกลับมาเฉพาะหน้า main
- ไม่ใส่แหล่งอ่านหลักในหน้ารายละเอียด
- ไม่ต้องรัน SQL ใหม่
- ใช้ Supabase เดิม ข้อมูลเดิมไม่หาย

อัปโหลดไฟล์ทั้งหมดทับ repo เดิม แล้ว Vercel จะ redeploy
