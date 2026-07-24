create table if not exists public.customer_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  riot_id text,
  preferred_contact_channel text,
  preferred_contact_value text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  riot_id text not null,
  service_id text not null,
  payment_method text not null,
  subtotal_dzd integer not null,
  fee_amount_dzd integer not null,
  total_dzd integer not null,
  contact_channel text not null,
  contact_value text not null,
  notes text,
  receipt_path text,
  order_items jsonb not null default '[]'::jsonb,
  status text not null default 'awaiting_review',
  created_at timestamptz not null default now()
);

create table if not exists public.support_threads (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  order_id bigint references public.orders (id) on delete set null,
  thread_type text not null default 'ticket',
  subject text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id bigint generated always as identity primary key,
  thread_id bigint not null references public.support_threads (id) on delete cascade,
  sender_user_id uuid references auth.users (id) on delete set null,
  sender_role text not null default 'customer',
  body text not null,
  attachment_path text,
  created_at timestamptz not null default now()
);

alter table public.customer_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.support_threads enable row level security;
alter table public.support_messages enable row level security;

drop policy if exists "users can view own profile" on public.customer_profiles;
drop policy if exists "users can insert own profile" on public.customer_profiles;
drop policy if exists "users can update own profile" on public.customer_profiles;
drop policy if exists "users can view own orders" on public.orders;
drop policy if exists "users can insert own orders" on public.orders;
drop policy if exists "users can view own threads" on public.support_threads;
drop policy if exists "users can insert own threads" on public.support_threads;
drop policy if exists "users can update own threads" on public.support_threads;
drop policy if exists "users can view own messages" on public.support_messages;
drop policy if exists "users can insert own messages" on public.support_messages;

create policy "users can view own profile"
on public.customer_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert own profile"
on public.customer_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own profile"
on public.customer_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can view own orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert own orders"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can view own threads"
on public.support_threads
for select
to authenticated
using (auth.uid() = user_id);

create policy "users can insert own threads"
on public.support_threads
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "users can update own threads"
on public.support_threads
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users can view own messages"
on public.support_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.support_threads
    where public.support_threads.id = support_messages.thread_id
      and public.support_threads.user_id = auth.uid()
  )
);

create policy "users can insert own messages"
on public.support_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.support_threads
    where public.support_threads.id = support_messages.thread_id
      and public.support_threads.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-receipts',
  'payment-receipts',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "users can upload own receipts" on storage.objects;
drop policy if exists "users can view own receipts" on storage.objects;

create policy "users can upload own receipts"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payment-receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can view own receipts"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);
