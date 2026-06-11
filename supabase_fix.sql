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
