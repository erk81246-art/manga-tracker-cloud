# Manga Tracker JS Landscape Dashboard

แก้ iPad แนวนอนแบบชัวร์กว่าเดิม:
- ใช้ JavaScript ตรวจ window width/height
- ถ้าจอกว้าง >= 900 และ width > height จะเข้า dashboard/sidebar
- ถ้าแนวตั้ง จะใช้ bottom bar
- ไม่พึ่ง Tailwind breakpoint อย่างเดียว
- ไม่ต้องรัน SQL ใหม่

หลัง deploy:
- เปิดเว็บบน iPad แล้ว refresh
- ถ้าเป็น PWA และยัง cache ให้ลบ icon แล้ว Add to Home Screen ใหม่
