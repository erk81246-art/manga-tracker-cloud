# Manga Tracker Manga Pass Local Cycle

อัปเดต Manga Pass:
- จำรูป Pass ล่าสุดไว้ใน localStorage
- เปิดรอบต่อไปใช้รูปเดิมขึ้นทันที
- หลังโหลด Favorite แล้วจะวนรูป Favorite ทีละเรื่องแบบ B
- Preload รูปใหม่ก่อนค่อย fade-in
- ถ้าไม่มี Favorite ใช้เรื่องแรกที่มีปก
- ไม่ต้องรัน SQL ใหม่
