-- Supabase Schema for Shime Events & Planning
-- Copy and paste these SQL queries into Supabase SQL Editor

-- ============================================
-- 1. USERS/CLIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20) NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  residency VARCHAR(100) NOT NULL,
  id_number VARCHAR(50) NOT NULL UNIQUE,
  contact_phone VARCHAR(20) NOT NULL,
  contact_method VARCHAR(50) NOT NULL, -- 'Telegram' or 'WhatsApp'
  security_pin VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  booking_reference VARCHAR(50) NOT NULL UNIQUE,
  event_type VARCHAR(100) NOT NULL, -- 'Wedding', 'Birthday', etc.
  package_type VARCHAR(50) NOT NULL, -- 'Signature', 'Elegance', 'Premium', 'Exclusive'
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  event_country VARCHAR(100) NOT NULL,
  event_city VARCHAR(100) NOT NULL,
  event_location VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'paid', 'completed', 'cancelled'
  deposit_amount DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  language VARCHAR(10) DEFAULT 'en', -- 'en' or 'am'
  terms_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3. PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'Signature', 'Elegance', 'Premium', 'Exclusive'
  icon VARCHAR(10) NOT NULL,
  deposit_amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 4. PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- 'CBE_WALLET', 'BANK_TRANSFER', etc.
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  reference_number VARCHAR(100),
  payment_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 5. QR CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  qr_code_data TEXT NOT NULL,
  qr_image_url TEXT,
  scans_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 6. AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', 'terms_accepted', 'payment_received'
  action_by VARCHAR(255) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 7. BOOKED_SLOTS TABLE (For availability)
-- ============================================
CREATE TABLE IF NOT EXISTS booked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_date DATE NOT NULL,
  booking_time TIME,
  is_fully_booked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 8. EMAIL_TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 9. SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Index on clients
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone_number);

-- Index on bookings
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON bookings(event_date);

-- Index on payments
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- Index on QR codes
CREATE INDEX IF NOT EXISTS idx_qr_codes_booking_id ON qr_codes(booking_id);

-- Index on audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_booking_id ON audit_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Index on booked slots
CREATE INDEX IF NOT EXISTS idx_booked_slots_date ON booked_slots(booking_date);

-- ============================================
-- INSERT DEFAULT PACKAGES
-- ============================================
INSERT INTO packages (name, icon, deposit_amount, description) VALUES
('Signature', '🎉', 5000, 'Basic event setup, core services'),
('Elegance', '⭐', 10000, 'Popular choice, full coordination'),
('Premium', '💎', 20000, 'Premium vendors, full décor'),
('Exclusive', '👑', 40000, 'Exclusive, bespoke luxury experience')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- INSERT DEFAULT SETTINGS
-- ============================================
INSERT INTO settings (setting_key, setting_value, description) VALUES
('company_name', 'Shime Events & Planning', 'Company name'),
('whatsapp_number', '+251912345678', 'WhatsApp contact number'),
('telegram_handle', '@ShimeEvents', 'Telegram handle'),
('bank_account', '1000XXXXXXXX', 'CBE Wallet account number'),
('bank_name', 'CBE WALLET', 'Payment method name'),
('currency', 'ETB', 'Currency code'),
('payment_terms', '14', 'Days until full payment is due')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View: Active Bookings
CREATE OR REPLACE VIEW active_bookings AS
SELECT
  b.id,
  b.booking_reference,
  c.full_name,
  c.email,
  b.event_type,
  b.package_type,
  b.event_date,
  b.event_city,
  b.status,
  b.created_at
FROM bookings b
JOIN clients c ON b.client_id = c.id
WHERE b.status IN ('pending', 'confirmed', 'paid')
ORDER BY b.event_date ASC;

-- View: Revenue Summary
CREATE OR REPLACE VIEW revenue_summary AS
SELECT
  DATE_TRUNC('month', b.created_at)::DATE as month,
  COUNT(DISTINCT b.id) as total_bookings,
  SUM(b.deposit_amount) as total_deposits,
  SUM(b.total_amount) as total_value,
  COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END) as completed_payments
FROM bookings b
LEFT JOIN payments p ON b.id = p.booking_id
GROUP BY DATE_TRUNC('month', b.created_at)
ORDER BY month DESC;

-- View: Upcoming Events
CREATE OR REPLACE VIEW upcoming_events AS
SELECT
  b.booking_reference,
  c.full_name,
  c.contact_phone,
  b.event_type,
  b.event_date,
  b.event_time,
  b.event_city,
  b.event_location
FROM bookings b
JOIN clients c ON b.client_id = c.id
WHERE b.event_date >= CURRENT_DATE
AND b.status IN ('confirmed', 'paid')
ORDER BY b.event_date ASC;

-- ============================================
-- STORED PROCEDURES
-- ============================================

-- Function: Generate Booking Reference
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SE-' || TO_CHAR(NOW(), 'YYYYMMDDHHmmss');
END;
$$ LANGUAGE plpgsql;

-- Function: Update Updated_At Timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create Triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at BEFORE UPDATE ON qr_codes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (Optional but Recommended)
-- ============================================

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies (optional - customize based on your auth needs)
-- These are examples - adjust based on your authentication strategy

-- ============================================
-- END OF SCHEMA
-- ============================================
