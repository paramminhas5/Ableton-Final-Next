
-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

-- Progress (one row per user)
create table public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  streak_days integer not null default 0,
  last_day date,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
create policy "progress read own" on public.progress for select using (auth.uid() = user_id);
create policy "progress insert own" on public.progress for insert with check (auth.uid() = user_id);
create policy "progress update own" on public.progress for update using (auth.uid() = user_id);

-- Mission completions
create table public.mission_completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_slug text not null,
  score numeric not null default 0,
  completed_at timestamptz not null default now(),
  primary key (user_id, mission_slug)
);
alter table public.mission_completions enable row level security;
create policy "mc read own" on public.mission_completions for select using (auth.uid() = user_id);
create policy "mc insert own" on public.mission_completions for insert with check (auth.uid() = user_id);
create policy "mc update own" on public.mission_completions for update using (auth.uid() = user_id);

-- Badges
create table public.badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_slug text not null,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_slug)
);
alter table public.badges enable row level security;
create policy "badges read own" on public.badges for select using (auth.uid() = user_id);
create policy "badges insert own" on public.badges for insert with check (auth.uid() = user_id);

-- Auto-create profile + empty progress on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  insert into public.progress (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
