# Manga Tracker History + Last Read URL + Clean Landscape

ทำทั้งหมด:
1. Reading History
- แสดง "อ่านล่าสุด" ทั้งแนวตั้งและแนวนอน
- กดเปิดรายละเอียดเรื่องไหน จะบันทึก history
- เก็บใน localStorage แยกตาม user id

2. Clean Landscape
- เอาการ์ด Good evening / erk81246 / คำอธิบายออก
- ย้ายข้อมูลบัญชีไปอยู่ในเมนู drawer

3. Last Read URL
- เพิ่ม field:
  - last_read_url
  - last_read_chapter
  - last_read_at
- ในฟอร์มแก้ไข เพิ่มช่อง "อ่านต่อ URL" และ "อ่านล่าสุดถึงตอน"
- ปุ่มอ่านต่อจะเปิด last_read_url ก่อน ถ้าไม่มีจึงใช้ source_url

ต้องรัน SQL เพิ่ม 1 ครั้ง:
supabase/last_read_fields.sql

เกี่ยวกับ localStorage:
- เก็บแค่ history id list เล็กมาก ไม่กินพื้นที่
- URL อ่านต่อเก็บใน Supabase เพื่อให้ข้ามเครื่องได้

Checks: {'history_state': True, 'history_component': True, 'openDetail': True, 'last_read_url': True, 'good_evening_present': False}
