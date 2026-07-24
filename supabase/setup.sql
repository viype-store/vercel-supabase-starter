create table if not exists public.order_requests (
  id bigint generated always as identity primary key,
  full_name text not null,
  email text not null,
  riot_id text not null,
  region text not null,
  product_category text not null,
  offer_name text not null,
  quantity integer not null default 1,
  preferred_contact text not null,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.order_requests enable row level security;

drop policy if exists "public can insert order request rows" on public.order_requests;

create policy "public can insert order request rows"
on public.order_requests
for insert
to anon, authenticated
with check (true);
