-- Booking Page Builder: schema + Row Level Security
-- Paste into Supabase > SQL Editor > New query > Run

create extension if not exists btree_gist;

-- TABLES -------------------------------------------------------

create table vendors (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text,
  created_at timestamptz default now()
);

create table services (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null default 0,
  duration_min int not null check (duration_min > 0),
  created_at timestamptz default now()
);

create table availability (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

create table bookings (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references vendors(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  start_time timestamptz not null,
  end_time timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now(),
  check (end_time > start_time),
  -- prevents double booking at the database level
  constraint no_overlap exclude using gist (
    vendor_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status <> 'cancelled')
);

create index on services (vendor_id);
create index on availability (vendor_id);
create index on bookings (vendor_id, start_time);

-- ROW LEVEL SECURITY -------------------------------------------

alter table vendors enable row level security;
alter table services enable row level security;
alter table availability enable row level security;
alter table bookings enable row level security;

-- vendors: anyone can read (public booking page), owner can write
create policy "vendors are public" on vendors
  for select using (true);
create policy "owner inserts vendor" on vendors
  for insert with check (id = auth.uid());
create policy "owner updates vendor" on vendors
  for update using (id = auth.uid());

-- services: anyone can read, owner manages
create policy "services are public" on services
  for select using (true);
create policy "owner manages services" on services
  for all using (vendor_id = auth.uid())
  with check (vendor_id = auth.uid());

-- availability: anyone can read, owner manages
create policy "availability is public" on availability
  for select using (true);
create policy "owner manages availability" on availability
  for all using (vendor_id = auth.uid())
  with check (vendor_id = auth.uid());

-- bookings: customers can only INSERT; only the vendor can read/edit
create policy "anyone can book" on bookings
  for insert with check (status = 'pending' and start_time > now());
create policy "vendor reads bookings" on bookings
  for select using (vendor_id = auth.uid());
create policy "vendor updates bookings" on bookings
  for update using (vendor_id = auth.uid());
create policy "vendor deletes bookings" on bookings
  for delete using (vendor_id = auth.uid());

-- PUBLIC FUNCTION: taken slots without exposing customer data ---

create or replace function get_booked_slots(p_vendor uuid, p_from timestamptz, p_to timestamptz)
returns table (start_time timestamptz, end_time timestamptz)
language sql
security definer
set search_path = public
as $$
  select b.start_time, b.end_time
  from bookings b
  where b.vendor_id = p_vendor
    and b.status <> 'cancelled'
    and b.start_time >= p_from
    and b.start_time < p_to;
$$;

grant execute on function get_booked_slots(uuid, timestamptz, timestamptz) to anon, authenticated;
