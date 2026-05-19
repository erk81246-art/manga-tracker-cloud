# Manga Tracker Orientation Dashboard

แก้ iPad แนวนอน:
- iPad แนวตั้งยังใช้ bottom bar แบบเดิม
- iPad แนวนอนจะสลับเป็น dashboard/sidebar จริง
- ใช้ CSS orientation media query ไม่พึ่ง xl breakpoint อย่างเดียว
- Desktop ยังใช้ dashboard เหมือนเดิม
- ไม่ต้องรัน SQL ใหม่
- ข้อมูลเดิมไม่หาย

หลัง deploy:
- เปิด iPad แนวนอนแล้ว refresh
- ถ้าใช้ PWA แล้วยังไม่เปลี่ยน ให้ลบ icon แล้ว Add to Home Screen ใหม่
