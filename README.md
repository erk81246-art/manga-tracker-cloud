# Manga Tracker Multi-site + iPad Landscape

เพิ่มจากเวอร์ชันเดิม:
- เช็กตอนล่าสุดจาก Go-Manga ด้วย parser เดิม
- รองรับเว็บอื่นด้วย generic parser เบื้องต้น
- ถ้าเว็บอื่นดึงไม่ได้ แอพจะแจ้งว่าต้องทำ parser เฉพาะเว็บนั้น
- ปรับหน้า Collection ให้รองรับ iPad แนวนอน / จอกว้าง
- Collection แสดงจำนวนคอลัมน์มากขึ้นบน iPad และ desktop
- Tier List แสดงรูปได้มากขึ้นในแนวนอน
- Detail modal และ Edit modal กว้างขึ้นบน iPad

## วิธีอัปเดต

อัปโหลดไฟล์ทั้งหมดทับ repo เดิม แล้ว Vercel จะ redeploy

ไม่ต้องรัน SQL ใหม่  
ใช้ Supabase database เดิมได้เลย


## stable-ui-tabs-check
- ถอย UI หนักจาก premium motion/drag ออกเพื่อแก้อาการแท็บค้างบนมือถือ
- ก่อนและหลัง Login เห็นทั้ง Tier List และ Collection
- Tier List อยู่ซ้าย / Collection อยู่ขวา
- คืนปุ่มเช็กตอนล่าสุดในหน้ารายละเอียดและผูกฟังก์ชันกลับเข้ากับ checkLatest
