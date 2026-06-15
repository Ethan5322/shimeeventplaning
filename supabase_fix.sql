-- ============================================================
-- SHIME EVENTS - Database Fix
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add missing columns to shime_bookings (safe: IF NOT EXISTS)
ALTER TABLE shime_bookings ADD COLUMN IF NOT EXISTS verification_pin text;
ALTER TABLE shime_bookings ADD COLUMN IF NOT EXISTS deposit_amount numeric DEFAULT 0;
ALTER TABLE shime_bookings ADD COLUMN IF NOT EXISTS calendar_type text DEFAULT 'gregorian';
ALTER TABLE shime_bookings ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false;

-- 2. Drop old RLS policies that may block inserts (ignore errors if they don't exist)
DROP POLICY IF EXISTS "shime: public can insert booking" ON shime_bookings;
DROP POLICY IF EXISTS "shime: public can read bookings" ON shime_bookings;
DROP POLICY IF EXISTS "shime: public can update own booking" ON shime_bookings;

-- 3. Make sure RLS is enabled
ALTER TABLE shime_bookings ENABLE ROW LEVEL SECURITY;

-- 4. Re-create clean policies
CREATE POLICY "allow_anon_insert" ON shime_bookings
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "allow_anon_select" ON shime_bookings
  FOR SELECT TO anon USING (true);

CREATE POLICY "allow_anon_update" ON shime_bookings
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 5. Verify - should show all columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'shime_bookings'
ORDER BY ordinal_position;

-- ============================================================
-- 6. BLOCKED DATES TABLE (for admin "Block / Unblock Dates" feature)
-- ============================================================
CREATE TABLE IF NOT EXISTS shime_blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL UNIQUE,
  reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shime_blocked_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blocked_anon_select" ON shime_blocked_dates;
DROP POLICY IF EXISTS "blocked_anon_insert" ON shime_blocked_dates;
DROP POLICY IF EXISTS "blocked_anon_delete" ON shime_blocked_dates;

-- Public can READ blocked dates (so the booking calendar can hide them)
CREATE POLICY "blocked_anon_select" ON shime_blocked_dates
  FOR SELECT TO anon USING (true);

-- Admin panel uses the anon key, so allow insert/delete from anon.
-- (For tighter security later, move these behind an authenticated role.)
CREATE POLICY "blocked_anon_insert" ON shime_blocked_dates
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "blocked_anon_delete" ON shime_blocked_dates
  FOR DELETE TO anon USING (true);
