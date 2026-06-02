# Manga Tracker Google Login

ปรับโค้ด:
- ปุ่ม Continue with Google ใช้ Supabase OAuth
- เพิ่ม prompt เลือกบัญชี Google
- แสดง error ถ้า OAuth ไม่สำเร็จ

ต้องตั้งค่าใน Supabase:
1. Authentication > Providers > Google > Enable
2. ใส่ Google Client ID และ Client Secret
3. ตั้ง Redirect URL ใน Google Cloud เป็น callback URL ของ Supabase
4. ตั้ง Site URL / Redirect URLs ใน Supabase ให้ตรงกับ Vercel URL
