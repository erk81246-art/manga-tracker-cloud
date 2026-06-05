create table if not exists public.user_manga_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  manga_id uuid not null references public.manga_items(id) on delete cascade,
  read_chapter text,
  last_read_url text,
  last_read_chapter text,
  last_read_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (user_id, manga_id)
);

alter table public.user_manga_progress enable row level security;

drop policy if exists "Users can read own progress" on public.user_manga_progress;
create policy "Users can read own progress"
on public.user_manga_progress for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own progress" on public.user_manga_progress;
create policy "Users can insert own progress"
on public.user_manga_progress for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own progress" on public.user_manga_progress;
create policy "Users can update own progress"
on public.user_manga_progress for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own progress" on public.user_manga_progress;
create policy "Users can delete own progress"
on public.user_manga_progress for delete to authenticated
using (auth.uid() = user_id);

insert into public.user_manga_progress (user_id, manga_id, read_chapter, last_read_chapter, last_read_url, last_read_at)
select user_id, id, read_chapter, coalesce(last_read_chapter, read_chapter), last_read_url, last_read_at
from public.manga_items
where user_id is not null
on conflict (user_id, manga_id) do nothing;
