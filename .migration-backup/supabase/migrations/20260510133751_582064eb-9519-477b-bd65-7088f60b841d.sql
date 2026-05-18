
create table public.drill_scores (
  user_id uuid not null,
  drill text not null,
  score int not null default 0,
  total int not null default 0,
  played_at timestamptz not null default now()
);
alter table public.drill_scores enable row level security;
create policy "drill read own" on public.drill_scores for select using (auth.uid() = user_id);
create policy "drill insert own" on public.drill_scores for insert with check (auth.uid() = user_id);
create index drill_scores_user_idx on public.drill_scores(user_id, drill, played_at desc);

create table public.review_schedule (
  user_id uuid not null,
  mission_slug text not null,
  due_at timestamptz not null,
  interval_days int not null default 1,
  ease int not null default 0,
  primary key (user_id, mission_slug)
);
alter table public.review_schedule enable row level security;
create policy "rev read own" on public.review_schedule for select using (auth.uid() = user_id);
create policy "rev upsert own" on public.review_schedule for insert with check (auth.uid() = user_id);
create policy "rev update own" on public.review_schedule for update using (auth.uid() = user_id);
create index review_due_idx on public.review_schedule(user_id, due_at);
