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


## guest-load-fix
- แก้ Guest Mode ให้โหลดข้อมูล public จาก Supabase ได้
- ถ้า Guest ยังไม่เห็นข้อมูล ให้รัน policy public select ใน Supabase:
  drop policy if exists "Public can preview manga" on public.manga_items;
  create policy "Public can preview manga" on public.manga_items for select to anon using (true);


## guest-viewonly
- Guest Mode ดูได้อย่างเดียว
- Guest ไม่เห็นตอนล่าสุด/อ่านถึง
- Guest เปิดเว็บอ่านไม่ได้
- Guest เช็กตอนล่าสุดไม่ได้
- Guest แก้ไข/ลบ/จัด Tier ไม่ได้


## guest-viewonly-fix2
- แก้ locked reference ที่หลุดนอก DetailModal เพื่อให้ build ผ่าน
