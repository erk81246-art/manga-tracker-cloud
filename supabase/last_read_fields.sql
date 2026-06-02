-- Run once in Supabase SQL Editor
-- เพิ่ม field สำหรับอ่านต่อไปยัง URL ตอนที่อ่านค้างไว้

alter table public.manga_items
add column if not exists last_read_url text,
add column if not exists last_read_chapter text,
add column if not exists last_read_at timestamptz;

-- optional: copy read_chapter เป็น last_read_chapter สำหรับข้อมูลเก่า
update public.manga_items
set last_read_chapter = read_chapter
where last_read_chapter is null
and read_chapter is not null;
