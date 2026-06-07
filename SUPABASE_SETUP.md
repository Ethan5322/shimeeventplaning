# Supabase Setup Guide for Shime Events

## 📋 Prerequisites

- Supabase account (free at https://supabase.com)
- Node.js installed
- Your booking application ready to connect

---

## 🚀 Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Project name**: `shime-events`
   - **Database password**: Create a strong password
   - **Region**: Choose closest to your users
4. Click **"Create new project"** (wait 2-3 minutes)

---

## 📊 Step 2: Create Database Tables

1. In Supabase dashboard, click **"SQL Editor"**
2. Click **"New Query"**
3. Copy the entire content from `supabase_schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"** button
6. Wait for confirmation "Success"

**Result**: All tables, indexes, and views are created!

---

## 🔑 Step 3: Get Your API Keys

1. Go to **Settings** → **API**
2. Copy these credentials:

```
📌 PROJECT URL: https://your-project.supabase.co
🔐 ANON KEY: eyJhbGc...
🔒 SERVICE ROLE KEY: eyJhbGc...
```

---

## 🔧 Step 4: Update Environment Variables

Create/Update `.env.production` in your project:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
VITE_APP_NAME=Shime Events & Planning
VITE_API_URL=https://shime-events.vercel.app

# Contact Information
VITE_WHATSAPP_NUMBER=251912345678
VITE_TELEGRAM_HANDLE=ShimeEvents

# Environment
NODE_ENV=production
```

---

## 📦 Step 5: Install Supabase Client

```bash
cd c:\Users\mule\OneDrive\Desktop\shime
npm install @supabase/supabase-js
```

---

## 📝 Step 6: Database Tables Overview

### **clients** - Customer Information
```sql
- id (UUID) - Primary Key
- full_name - Customer name
- email - Email address
- phone_number - Phone with country code
- nationality - Customer nationality
- residency - Country of residence
- id_number - ID or Passport number
- contact_phone - Contact number
- contact_method - Telegram or WhatsApp
- security_pin - Hashed PIN
- created_at, updated_at - Timestamps
```

### **bookings** - Event Bookings
```sql
- id (UUID) - Primary Key
- client_id (FK) - Link to clients
- booking_reference - Unique reference (SE-timestamp)
- event_type - Wedding, Birthday, etc.
- package_type - Signature, Elegance, Premium, Exclusive
- event_date - Event date
- event_time - Event time
- event_country - Event location country
- event_city - Event location city
- event_location - Specific venue
- status - pending, confirmed, paid, completed
- deposit_amount - Deposit required
- total_amount - Total event cost
- language - en or am
- terms_accepted - Boolean
- created_at, updated_at
```

### **packages** - Event Packages
```sql
- id (UUID) - Primary Key
- name - Package name
- icon - Emoji icon
- deposit_amount - Required deposit
- description - Package details
- created_at, updated_at
```

### **payments** - Payment Records
```sql
- id (UUID) - Primary Key
- booking_id (FK) - Link to booking
- amount - Payment amount
- payment_method - CBE_WALLET, BANK_TRANSFER, etc.
- payment_status - pending, completed, failed
- reference_number - Payment reference
- payment_date - When payment was made
- created_at, updated_at
```

### **qr_codes** - QR Code Storage
```sql
- id (UUID) - Primary Key
- booking_id (FK) - Link to booking
- qr_code_data - QR code image data
- qr_image_url - URL to QR image
- scans_count - Number of times scanned
- created_at, updated_at
```

### **audit_logs** - Activity Log
```sql
- id (UUID) - Primary Key
- booking_id (FK) - Link to booking
- action - created, updated, payment_received, etc.
- action_by - Who performed the action
- details - Additional details
- ip_address - IP address of action
- created_at
```

### **booked_slots** - Availability
```sql
- id (UUID) - Primary Key
- booking_date - Date
- booking_time - Time (if specific slot)
- is_fully_booked - Boolean
- created_at
```

---

## 🔐 Step 7: Enable Row Level Security (Optional)

For production, enable RLS:

```sql
-- Go to Authentication → Policies
-- Set up policies to control who can view/edit data

-- Example: Clients can only view their own bookings
CREATE POLICY "Clients view own bookings" ON bookings
FOR SELECT USING (auth.uid()::text = client_id::text);
```

---

## 💾 Step 8: Create Backups

1. Go to **Database** → **Backups**
2. Enable **"Automatic backups"**
3. Choose backup frequency (Daily recommended)

---

## 🧪 Step 9: Test the Connection

Run this in your React app:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

// Test query
const { data, error } = await supabase
  .from('packages')
  .select('*')

console.log(data) // Should show your packages
```

---

## 📊 Useful Queries

### Get All Bookings
```sql
SELECT * FROM bookings 
ORDER BY created_at DESC
LIMIT 100;
```

### Get Revenue Summary
```sql
SELECT * FROM revenue_summary;
```

### Get Upcoming Events
```sql
SELECT * FROM upcoming_events;
```

### Get Active Bookings
```sql
SELECT * FROM active_bookings;
```

### Find Booked Dates
```sql
SELECT * FROM booked_slots
WHERE booking_date BETWEEN NOW() AND NOW() + INTERVAL '3 months'
ORDER BY booking_date;
```

---

## 🔄 Common Operations

### Insert a Booking
```sql
INSERT INTO bookings (
  client_id,
  booking_reference,
  event_type,
  package_type,
  event_date,
  event_time,
  event_country,
  event_city,
  event_location,
  deposit_amount,
  total_amount
) VALUES (
  'client-uuid',
  'SE-20260607123456',
  'Wedding',
  'Premium',
  '2026-12-25',
  '14:00',
  'Ethiopia',
  'Addis Ababa',
  'Hilton Hotel',
  20000,
  100000
);
```

### Update Booking Status
```sql
UPDATE bookings 
SET status = 'paid', updated_at = NOW()
WHERE booking_reference = 'SE-20260607123456';
```

### Record a Payment
```sql
INSERT INTO payments (
  booking_id,
  amount,
  payment_method,
  payment_status,
  payment_date
) VALUES (
  'booking-uuid',
  20000,
  'CBE_WALLET',
  'completed',
  NOW()
);
```

---

## 🚨 Troubleshooting

### Connection Error
**Problem**: Can't connect to Supabase
**Solution**:
1. Check your API key is correct
2. Check your URL is correct
3. Ensure RLS policies allow anonymous access

### Table Not Found
**Problem**: "relation does not exist"
**Solution**:
1. Run the schema SQL again
2. Check table name spelling (case-sensitive)
3. Refresh Supabase dashboard

### Permission Denied
**Problem**: "permission denied"
**Solution**:
1. Check RLS policies
2. Use SERVICE_ROLE_KEY for admin operations
3. Disable RLS if testing (enable in production)

---

## 📈 Monitoring & Analytics

### Check Row Count
```sql
SELECT 
  'clients' as table_name, COUNT(*) as row_count FROM clients
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;
```

### Monitor Storage
Go to **Database** → **Database** tab to see storage usage

### View Real-time Activity
Go to **Database** → **Webhooks** to set up event triggers

---

## 🎯 Next Steps

1. ✅ Create Supabase project
2. ✅ Run SQL schema
3. ✅ Get API keys
4. ✅ Update environment variables
5. ✅ Install Supabase client
6. ✅ Test connection
7. ✅ Enable backups
8. ✅ Set up RLS (production)
9. ✅ Configure webhooks (optional)
10. ✅ Deploy to Vercel

---

## 📞 Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.io
- Your booking app support: contact@shimeeventplaning.com

---

## 🔗 Important Links

- **Supabase Dashboard**: https://supabase.com/dashboard
- **API Documentation**: https://supabase.com/docs/reference/javascript
- **SQL Editor**: In your project dashboard → SQL Editor

---

**You're all set!** Your Shime Events booking system is now connected to a professional PostgreSQL database. 🎉
