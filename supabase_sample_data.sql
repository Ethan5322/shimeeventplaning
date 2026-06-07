-- ============================================
-- SUPABASE SAMPLE DATA FOR SHIME EVENTS
-- Copy and paste these into Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. INSERT SAMPLE CLIENTS
-- ============================================
INSERT INTO clients (full_name, email, phone_number, nationality, residency, id_number, contact_phone, contact_method, security_pin)
VALUES
('Abebe Kebede', 'abebe.kebede@email.com', '+251911234567', 'Ethiopian', 'Ethiopia', 'EP123456', '+251912345678', 'WhatsApp', 'abc123456'),
('Sara Mohammed', 'sara.mohammed@email.com', '+251922334455', 'Ethiopian', 'Ethiopia', '123456789012', '+251933445566', 'Telegram', 'def789012'),
('John Smith', 'john.smith@email.com', '+254712345678', 'Kenyan', 'Kenya', 'KE987654', '+254723456789', 'WhatsApp', 'ghi345678'),
('Amara Tekle', 'amara.tekle@email.com', '+251944556677', 'Eritrean', 'Ethiopia', 'ER456789', '+251955667788', 'Telegram', 'jkl901234'),
('Fatima Hassan', 'fatima.hassan@email.com', '+251966778899', 'Somali', 'Ethiopia', 'SO234567', '+251977889900', 'WhatsApp', 'mno567890'),
('David Johnson', 'david.johnson@email.com', '+256701234567', 'Ugandan', 'Uganda', 'UG654321', '+256712345678', 'Telegram', 'pqr123456'),
('Aster Alemu', 'aster.alemu@email.com', '+251988990011', 'Ethiopian', 'Ethiopia', 'ET567890', '+251999001122', 'WhatsApp', 'stu789012'),
('Michael Brown', 'michael.brown@email.com', '+255754321098', 'Tanzanian', 'Tanzania', 'TZ987654', '+255765432109', 'Telegram', 'vwx456789');

-- ============================================
-- 2. INSERT SAMPLE PACKAGES (DEFAULT DATA)
-- ============================================
INSERT INTO packages (name, icon, deposit_amount, description)
VALUES
('Signature', '🎉', 5000, 'Basic event setup with core services'),
('Elegance', '⭐', 10000, 'Popular choice with full coordination'),
('Premium', '💎', 20000, 'Premium vendors with full décor'),
('Exclusive', '👑', 40000, 'Exclusive bespoke luxury experience')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. INSERT SAMPLE BOOKINGS
-- ============================================
INSERT INTO bookings (client_id, booking_reference, event_type, package_type, event_date, event_time, event_country, event_city, event_location, status, deposit_amount, total_amount, language, terms_accepted)
VALUES
(
  (SELECT id FROM clients WHERE email = 'abebe.kebede@email.com'),
  'SE-20260801120000',
  'Wedding',
  'Premium',
  '2026-08-15',
  '14:00',
  'Ethiopia',
  'Addis Ababa',
  'Hilton Hotel - Grand Ballroom',
  'confirmed',
  20000,
  100000,
  'en',
  true
),
(
  (SELECT id FROM clients WHERE email = 'sara.mohammed@email.com'),
  'SE-20260802120000',
  'Birthday',
  'Elegance',
  '2026-09-20',
  '18:00',
  'Ethiopia',
  'Addis Ababa',
  'Djibouti Hall - Downtown',
  'pending',
  10000,
  50000,
  'am',
  true
),
(
  (SELECT id FROM clients WHERE email = 'john.smith@email.com'),
  'SE-20260803120000',
  'Graduation',
  'Signature',
  '2026-07-10',
  '10:00',
  'Kenya',
  'Nairobi',
  'Safari Park Hotel',
  'paid',
  5000,
  30000,
  'en',
  true
),
(
  (SELECT id FROM clients WHERE email = 'amara.tekle@email.com'),
  'SE-20260804120000',
  'Anniversary',
  'Premium',
  '2026-10-05',
  '19:00',
  'Ethiopia',
  'Dire Dawa',
  'Ethiopia Hotel',
  'confirmed',
  20000,
  120000,
  'en',
  true
),
(
  (SELECT id FROM clients WHERE email = 'fatima.hassan@email.com'),
  'SE-20260805120000',
  'Wedding',
  'Exclusive',
  '2026-12-25',
  '16:00',
  'Ethiopia',
  'Addis Ababa',
  'Sheraton Addis - Presidential Ballroom',
  'pending',
  40000,
  200000,
  'am',
  false
),
(
  (SELECT id FROM clients WHERE email = 'david.johnson@email.com'),
  'SE-20260806120000',
  'Corporate Event',
  'Premium',
  '2026-09-15',
  '09:00',
  'Uganda',
  'Kampala',
  'Kampala Serena Hotel',
  'confirmed',
  20000,
  80000,
  'en',
  true
),
(
  (SELECT id FROM clients WHERE email = 'aster.alemu@email.com'),
  'SE-20260807120000',
  'Birthday',
  'Signature',
  '2026-07-30',
  '15:00',
  'Ethiopia',
  'Adama',
  'Adama Hotel',
  'paid',
  5000,
  25000,
  'en',
  true
),
(
  (SELECT id FROM clients WHERE email = 'michael.brown@email.com'),
  'SE-20260808120000',
  'Wedding',
  'Elegance',
  '2026-08-28',
  '17:00',
  'Tanzania',
  'Dar es Salaam',
  'Dar es Salaam City Centre Hotel',
  'confirmed',
  10000,
  60000,
  'en',
  true
);

-- ============================================
-- 4. INSERT SAMPLE PAYMENTS
-- ============================================
INSERT INTO payments (booking_id, amount, payment_method, payment_status, reference_number, payment_date, notes)
VALUES
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260801120000'),
  20000,
  'CBE_WALLET',
  'completed',
  'PAYMENT-001-ABEBE',
  NOW(),
  'Deposit paid for wedding event'
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260803120000'),
  5000,
  'CBE_WALLET',
  'completed',
  'PAYMENT-002-JOHN',
  NOW(),
  'Full deposit paid for graduation'
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260804120000'),
  20000,
  'CBE_WALLET',
  'completed',
  'PAYMENT-003-AMARA',
  NOW(),
  'Deposit for anniversary celebration'
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260807120000'),
  5000,
  'CBE_WALLET',
  'completed',
  'PAYMENT-004-ASTER',
  NOW(),
  'Birthday party deposit'
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260808120000'),
  10000,
  'CBE_WALLET',
  'completed',
  'PAYMENT-005-MICHAEL',
  NOW(),
  'Wedding deposit payment'
);

-- ============================================
-- 5. INSERT SAMPLE BOOKED SLOTS
-- ============================================
INSERT INTO booked_slots (booking_date, booking_time, is_fully_booked)
VALUES
('2025-12-25', NULL, true),           -- Fully booked day
('2026-01-01', '14:00', false),       -- Specific time booked
('2026-02-14', NULL, true),           -- Valentine's Day - fully booked
('2026-06-15', '10:00', false),       -- Specific time booked
('2026-07-04', NULL, true),           -- Independence Day - fully booked
('2026-07-10', '10:00', false),       -- Graduation event time
('2026-07-30', '15:00', false),       -- Birthday event time
('2026-08-15', '14:00', false),       -- Wedding event time
('2026-08-28', '17:00', false),       -- Wedding event time
('2026-09-15', '09:00', false),       -- Corporate event time
('2026-09-20', '18:00', false),       -- Birthday event time
('2026-10-05', '19:00', false),       -- Anniversary event time
('2026-12-25', '16:00', false);       -- Christmas wedding

-- ============================================
-- 6. INSERT SAMPLE SETTINGS
-- ============================================
INSERT INTO settings (setting_key, setting_value, description)
VALUES
('company_name', 'Shime Events & Planning', 'Official company name'),
('company_email', 'contact@shimeeventplaning.com', 'Company email address'),
('whatsapp_number', '+251912345678', 'Main WhatsApp contact number'),
('telegram_handle', '@ShimeEvents', 'Telegram business handle'),
('bank_account_number', '1000XXXXXXXX', 'CBE Wallet account number'),
('bank_account_name', 'Shime Events & Planning', 'Bank account holder name'),
('bank_name', 'CBE WALLET', 'Bank/Payment method name'),
('currency', 'ETB', 'Currency code (Ethiopian Birr)'),
('currency_symbol', 'ብር', 'Currency symbol'),
('payment_terms_days', '14', 'Days for full payment deadline'),
('support_email', 'support@shimeeventplaning.com', 'Customer support email'),
('support_phone', '+251911234567', 'Customer support phone'),
('business_address', 'Addis Ababa, Ethiopia', 'Physical business address'),
('business_hours', 'Monday-Friday 9AM-6PM', 'Business operating hours'),
('tax_id', 'ETH-123456789', 'Tax identification number'),
('refund_policy', 'No refunds on non-refundable deposits', 'Refund policy description')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- 7. INSERT SAMPLE EMAIL TEMPLATES
-- ============================================
INSERT INTO email_templates (name, subject, body, language)
VALUES
(
  'booking_confirmation',
  'Your Shime Events Booking is Confirmed!',
  'Dear {{client_name}},

Thank you for booking with Shime Events & Planning!

Your Booking Details:
- Reference: {{booking_reference}}
- Event Type: {{event_type}}
- Date: {{event_date}} at {{event_time}}
- Location: {{event_city}}, {{event_country}}
- Package: {{package_type}}
- Deposit Amount: ETB {{deposit_amount}}

Next Steps:
1. Complete payment via CBE WALLET (Account: 1000XXXXXXXX)
2. Send proof of payment via WhatsApp: +251912345678
3. Our team will contact you within 24 hours to confirm

Best regards,
Shime Events & Planning Team
📱 WhatsApp: +251912345678
✉️ Email: contact@shimeeventplaning.com',
  'en'
),
(
  'payment_received',
  'Payment Received - {{booking_reference}}',
  'Dear {{client_name}},

We have received your payment of ETB {{amount}} for your booking.

Your booking is now confirmed!
- Booking Reference: {{booking_reference}}
- Event Date: {{event_date}}
- Status: PAID

Our team will be in touch soon to finalize arrangements.

Thank you for choosing Shime Events & Planning!

Best regards,
Shime Events & Planning Team',
  'en'
),
(
  'event_reminder',
  'Reminder: Your Event is in 7 Days - {{booking_reference}}',
  'Dear {{client_name}},

Your event is coming up soon!

Event Details:
- Date: {{event_date}} at {{event_time}}
- Location: {{event_location}}, {{event_city}}
- Reference: {{booking_reference}}

Please confirm final details and contact us if you have any last-minute changes.

📱 WhatsApp: +251912345678
✉️ Email: contact@shimeeventplaning.com

Looking forward to making your event amazing!

Best regards,
Shime Events & Planning Team',
  'en'
),
(
  'booking_confirmation_am',
  'በ Shime Events ግዜ ዝግጅትዎ ተረጋግጧል!',
  'ውድ {{client_name}},

በ Shime Events & Planning ላይ ዝግጅትዎ ለማቅረብ ምስጋና!

የዝግጅትዎ ዝርዝሮች:
- ሐውልት: {{booking_reference}}
- ዓይነት: {{event_type}}
- ቀን: {{event_date}} {{event_time}}
- ቦታ: {{event_city}}, {{event_country}}
- ሚና: {{package_type}}
- ክፍያ: ብር {{deposit_amount}}

ቀጣይ ደረጃ:
1. ለ CBE WALLET ክፍያ ይሙሉ
2. ማስረጃ ወደ WhatsApp ይላኩ: +251912345678
3. ቡድናችን በ 24 ሰዓቶች ውስጥ ይገናኝዎታል

ከኢትዮጵያ ወደ ዜና,
Shime Events & Planning Team',
  'am'
)
ON CONFLICT (name, language) DO NOTHING;

-- ============================================
-- 8. INSERT SAMPLE AUDIT LOGS
-- ============================================
INSERT INTO audit_logs (booking_id, action, action_by, details, ip_address)
VALUES
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260801120000'),
  'created',
  'abebe.kebede@email.com',
  'Booking created through web form',
  '196.168.1.100'
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260801120000'),
  'terms_accepted',
  'abebe.kebede@email.com',
  'Client accepted terms and conditions',
  '196.168.1.100'
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260801120000'),
  'payment_received',
  'admin@shimeeventplaning.com',
  'Deposit of ETB 20,000 received via CBE WALLET',
  '196.168.1.50'
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260803120000'),
  'created',
  'john.smith@email.com',
  'Booking created through web form',
  '196.168.2.100'
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260803120000'),
  'payment_received',
  'admin@shimeeventplaning.com',
  'Payment of ETB 5,000 received',
  '196.168.1.50'
);

-- ============================================
-- 9. INSERT SAMPLE QR CODES
-- ============================================
-- Note: QR codes would typically be generated programmatically,
-- but here's a placeholder for future QR data
INSERT INTO qr_codes (booking_id, qr_code_data, scans_count)
VALUES
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260801120000'),
  'https://shimeeventplaning.com?booking=SE-20260801120000',
  5
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260803120000'),
  'https://shimeeventplaning.com?booking=SE-20260803120000',
  2
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260804120000'),
  'https://shimeeventplaning.com?booking=SE-20260804120000',
  8
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260807120000'),
  'https://shimeeventplaning.com?booking=SE-20260807120000',
  3
),
(
  (SELECT id FROM bookings WHERE booking_reference = 'SE-20260808120000'),
  'https://shimeeventplaning.com?booking=SE-20260808120000',
  1
);

-- ============================================
-- VERIFICATION QUERIES - Run these to verify data was inserted
-- ============================================

-- Show all clients
SELECT 'Clients' as table_name, COUNT(*) as count FROM clients;

-- Show all bookings with client names
SELECT
  b.booking_reference,
  c.full_name,
  b.event_type,
  b.package_type,
  b.event_date,
  b.status,
  COUNT(p.id) as payment_count
FROM bookings b
JOIN clients c ON b.client_id = c.id
LEFT JOIN payments p ON b.id = p.booking_id
GROUP BY b.id, b.booking_reference, c.full_name, b.event_type, b.package_type, b.event_date, b.status
ORDER BY b.created_at DESC;

-- Show revenue summary
SELECT
  COUNT(DISTINCT b.id) as total_bookings,
  SUM(b.deposit_amount) as total_deposits,
  SUM(CASE WHEN b.status = 'paid' THEN b.deposit_amount ELSE 0 END) as paid_deposits,
  COUNT(CASE WHEN p.payment_status = 'completed' THEN 1 END) as completed_payments
FROM bookings b
LEFT JOIN payments p ON b.id = p.booking_id;

-- Show upcoming events
SELECT
  b.booking_reference,
  c.full_name,
  b.event_type,
  b.event_date,
  b.event_city,
  b.status
FROM bookings b
JOIN clients c ON b.client_id = c.id
WHERE b.event_date >= CURRENT_DATE
ORDER BY b.event_date ASC;

-- ============================================
-- END OF SAMPLE DATA
-- ============================================
