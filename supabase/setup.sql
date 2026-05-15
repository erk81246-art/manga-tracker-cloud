create extension if not exists "pgcrypto";
create table if not exists public.manga_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  cover text default '',
  source_url text default '',
  read_chapter text default '',
  latest_chapter text default '',
  status text default 'reading',
  tier text default 'A',
  note text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.manga_items enable row level security;
drop policy if exists "Users can read own manga" on public.manga_items;
create policy "Users can read own manga" on public.manga_items for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own manga" on public.manga_items;
create policy "Users can insert own manga" on public.manga_items for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own manga" on public.manga_items;
create policy "Users can update own manga" on public.manga_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own manga" on public.manga_items;
create policy "Users can delete own manga" on public.manga_items for delete using (auth.uid() = user_id);
insert into storage.buckets (id, name, public) values ('manga-covers', 'manga-covers', true) on conflict (id) do nothing;
drop policy if exists "Users can upload covers" on storage.objects;
create policy "Users can upload covers" on storage.objects for insert to authenticated with check (bucket_id = 'manga-covers' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can update own covers" on storage.objects;
create policy "Users can update own covers" on storage.objects for update to authenticated using (bucket_id = 'manga-covers' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Users can delete own covers" on storage.objects;
create policy "Users can delete own covers" on storage.objects for delete to authenticated using (bucket_id = 'manga-covers' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Anyone can view covers" on storage.objects;
create policy "Anyone can view covers" on storage.objects for select using (bucket_id = 'manga-covers');
