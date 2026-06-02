# Manga Tracker Detail No Horizontal Scroll

แก้ปัญหาหน้ารายละเอียดขยับซ้ายขวา:
- Modal ล็อกความกว้างไม่เกิน 100vw บนมือถือ
- ซ่อน overflow-x ใน detail content
- เอา float layout ที่ทำให้เนื้อหาหลุดจอออก
- ชื่อเรื่อง/โน้ตบังคับตัดบรรทัด ไม่ดันหน้ากว้าง
- Bottom action bar ไม่ล้นจอ
- ไม่ต้องรัน SQL ใหม่
