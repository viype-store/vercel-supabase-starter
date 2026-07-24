create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  name text,
  email text not null unique,
  idea text,
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

drop policy if exists "public can insert waitlist rows" on public.waitlist;

create policy "public can insert waitlist rows"
on public.waitlist
for insert
to anon, authenticated
with check (true);
