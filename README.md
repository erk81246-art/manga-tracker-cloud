# Manga Tracker Dashboard Rewrite

เวอร์ชัน B: rewrite layout ใหม่แบบปลอดภัย

สิ่งที่เปลี่ยน:
- มือถือ/แนวตั้ง: ยังเป็น layout เรียงลงล่าง
- iPad/Desktop: sidebar ซ้าย + content ขวา
- Sidebar มี stats, tab, filter, add, logout
- Main มี greeting, search, source bar, manga grid
- แหล่งอ่านหลักกลับมาเฉพาะหน้า main
- หน้ารายละเอียดไม่มีแหล่งอ่านหลัก
- ใช้ Supabase เดิม
- ไม่ต้องรัน SQL ใหม่

วิธีใช้:
อัปโหลดไฟล์ทั้งหมดทับ repo เดิมใน GitHub แล้ว Vercel จะ redeploy
