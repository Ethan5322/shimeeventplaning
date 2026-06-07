-- ============================================
-- SHIME EVENTS & PLANNING - SIMPLIFIED SCHEMA
-- Copy and paste this entire file into Supabase SQL Editor
-- ============================================

-- ============================================
-- Shime Events: Main Bookings Table
-- ============================================
create table if not exists shime_bookings (
  id uuid default gen_random_uuid() primary key,
  booking_ref text unique not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Client Information
  full_name text not null,
  email text,
  nationality text,
  residency text,
  phone_number text,
  contact_phone text,
  id_number text,
  contact_method text,
  security_pin text,

  -- Preferences
  language text default 'en',

  -- Event Details
  event_type text,
  custom_event_description text,
  plan text,
  plan_deposit numeric,
  event_date date,
  event_time time,
  event_country text,
  event_city text,
  event_location text,

  -- Status Tracking
  terms_accepted boolean default false,
  payment_status text default 'pending',
  booking_status text default 'awaiting_payment'
);

-- ============================================
-- Shime Events: Booked Slots Table
-- (For tracking availability)
-- ============================================
create table if not exists shime_booked_slots (
  id uuid default gen_random_uuid() primary key,
  event_date date not null,
  event_time time,
  booking_ref text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- Shime Events: Packages Table
-- ============================================
create table if not exists shime_packages (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  icon text,
  deposit_amount numeric not null,
  description text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- Shime Events: Payments Table
-- ============================================
create table if not exists shime_payments (
  id uuid default gen_random_uuid() primary key,
  booking_ref text not null references shime_bookings(booking_ref),
  amount numeric not null,
  payment_method text default 'CBE_WALLET',
  payment_status text default 'pending',
  reference_number text,
  payment_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- ============================================
-- Shime Events: QR Codes Table
-- ============================================
create table if not exists shime_qr_codes (
  id uuid default gen_random_uuid() primary key,
  booking_ref text not null references shime_bookings(booking_ref),
  qr_code_data text,
  scans_count integer default 0,
  created_at timestamp with time zone default now()
);

-- ============================================
-- Shime Events: Audit Logs Table
-- ============================================
create table if not exists shime_audit_logs (
  id uuid default gen_random_uuid() primary key,
  booking_ref text references shime_bookings(booking_ref),
  action text not null,
  action_by text,
  details text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- INSERT DEFAULT PACKAGES
-- ============================================
insert into shime_packages (name, icon, deposit_amount, description)
values
  ('Signature', '🎉', 5000, 'Basic event setup, core services'),
  ('Elegance', '⭐', 10000, 'Popular choice, full coordination'),
  ('Premium', '💎', 20000, 'Premium vendors, full décor'),
  ('Exclusive', '👑', 40000, 'Exclusive, bespoke luxury experience')
on conflict (name) do nothing;

-- ============================================
-- INSERT DEMO BLOCKED DATES
-- ============================================
insert into shime_booked_slots (event_date, event_time)
values
  ('2025-12-25', null),
  ('2026-01-01', '14:00'),
  ('2026-02-14', null),
  ('2026-06-15', '10:00'),
  ('2026-07-04', null),
  ('2026-07-10', '10:00'),
  ('2026-08-15', '14:00'),
  ('2026-09-20', '18:00'),
  ('2026-10-05', '19:00');

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
create index if not exists idx_shime_bookings_booking_ref on shime_bookings(booking_ref);
create index if not exists idx_shime_bookings_email on shime_bookings(email);
create index if not exists idx_shime_bookings_event_date on shime_bookings(event_date);
create index if not exists idx_shime_bookings_status on shime_bookings(booking_status);
create index if not exists idx_shime_booked_slots_date on shime_booked_slots(event_date);
create index if not exists idx_shime_payments_booking_ref on shime_payments(booking_ref);
create index if not exists idx_shime_qr_codes_booking_ref on shime_qr_codes(booking_ref);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
alter table shime_bookings enable row level security;
alter table shime_booked_slots enable row level security;
alter table shime_packages enable row level security;
alter table shime_payments enable row level security;
alter table shime_qr_codes enable row level security;
alter table shime_audit_logs enable row level security;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- SHIME BOOKINGS POLICIES
create policy "shime: public can insert booking"
on shime_bookings for insert to anon with check (true);

create policy "shime: public can read bookings"
on shime_bookings for select to anon using (true);

create policy "shime: public can update own booking"
on shime_bookings for update to anon using (true) with check (true);

-- SHIME BOOKED SLOTS POLICIES
create policy "shime: public can read slots"
on shime_booked_slots for select to anon using (true);

create policy "shime: public can insert slot"
on shime_booked_slots for insert to anon with check (true);

-- SHIME PACKAGES POLICIES
create policy "shime: public can read packages"
on shime_packages for select to anon using (true);

-- SHIME PAYMENTS POLICIES
create policy "shime: public can insert payment"
on shime_payments for insert to anon with check (true);

create policy "shime: public can read payments"
on shime_payments for select to anon using (true);

-- SHIME QR CODES POLICIES
create policy "shime: public can insert qr code"
on shime_qr_codes for insert to anon with check (true);

create policy "shime: public can read qr codes"
on shime_qr_codes for select to anon using (true);

-- SHIME AUDIT LOGS POLICIES
create policy "shime: public can insert audit log"
on shime_audit_logs for insert to anon with check (true);

create policy "shime: public can read audit logs"
on shime_audit_logs for select to anon using (true);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up correctly:

-- Check all tables exist
select table_name from information_schema.tables where table_schema = 'public' and table_name like 'shime_%';

-- Check default packages
select * from shime_packages;

-- Check booked slots
select * from shime_booked_slots order by event_date;

-- ============================================
-- DONE! Your database is ready to use.
-- ============================================
