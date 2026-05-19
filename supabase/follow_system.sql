-- Run once in Supabase SQL Editor
-- ทำให้ทุก account อ่าน manga_items ทั้งหมดได้ และเพิ่ม Favorite/Follow แยกตามบัญชี

-- ให้ทุกคนที่ login แล้วอ่าน manga_items ทั้งหมดได้
drop policy if exists "Authenticated can read all manga" on public.manga_items;
create policy "Authenticated can read all manga"
on public.manga_items for select
to authenticated
using (true);

-- ถ้าต้องการให้ guest เห็น preview ด้วย คง policy anon เดิมไว้ได้

create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  manga_id uuid not null references public.manga_items(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, manga_id)
);

alter table public.user_favorites enable row level security;

drop policy if exists "Users can read own favorites" on public.user_favorites;
create policy "Users can read own favorites"
on public.user_favorites for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own favorites" on public.user_favorites;
create policy "Users can insert own favorites"
on public.user_favorites for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own favorites" on public.user_favorites;
create policy "Users can delete own favorites"
on public.user_favorites for delete
to authenticated
using (auth.uid() = user_id);
