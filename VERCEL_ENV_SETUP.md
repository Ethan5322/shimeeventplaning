# 🚀 VERCEL ENVIRONMENT VARIABLES SETUP

This guide shows how to configure environment variables in Vercel for your Shime Events app.

---

## 📋 QUICK START

Your app needs **3 environment variables** in Vercel:

1. `VITE_SUPABASE_URL` - Your Supabase project URL
2. `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
3. `VITE_CHAPA_PUBLIC_KEY` - Your Chapa payment gateway public key

---

## 🔧 STEP 1: GET YOUR CREDENTIALS

### Supabase Credentials

1. Go to: https://supabase.com/dashboard
2. Click your project
3. Go to **Settings → API**
4. Copy these values:
   - **Project URL** (e.g., `https://xxxx.supabase.co`)
   - **Anon Key** (starts with `eyJ...`)

### Chapa Credentials

1. Go to: https://chapa.co/dashboard
2. Click **Settings** or **API Keys**
3. Find your **PUBLIC KEY** (looks like: `CHASECK_TEST_xxx...` or `CHASECK_LIVE_xxx...`)
4. Copy it

---

## 🌐 STEP 2: ADD TO VERCEL

### Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Click your project: **shimeeventplaning**
3. Click **Settings** tab
4. Find **Environment Variables** in the left menu
5. You'll add 3 new variables

### Add Variable 1: Supabase URL

```
Name:          VITE_SUPABASE_URL
Value:         (paste your Supabase Project URL)
Environments:  ✅ Production
               ✅ Preview
               ✅ Development
```

Click **Save** ✓

### Add Variable 2: Supabase Key

```
Name:          VITE_SUPABASE_ANON_KEY
Value:         (paste your Supabase Anon Key)
Environments:  ✅ Production
               ✅ Preview
               ✅ Development
```

Click **Save** ✓

### Add Variable 3: Chapa Public Key

```
Name:          VITE_CHAPA_PUBLIC_KEY
Value:         (paste your Chapa PUBLIC KEY)
Environments:  ✅ Production
               ✅ Preview
               ✅ Development
```

Click **Save** ✓

---

## ⏳ WAIT FOR DEPLOYMENT

Vercel will automatically redeploy your app (2-3 minutes).

You'll see:
- **Deployments** tab shows new deployment
- Green checkmark = deployment successful
- App is now live with your env vars

---

## ✅ VERIFY IT WORKS

### Test on Live App

1. Go to: https://shimeeventplaning.vercel.app
2. Complete a booking to **Step 17 (Payment)**
3. Accept terms
4. Click **"💳 Pay Deposit Now"** button
5. Should redirect to Chapa payment page
6. Complete payment
7. Should redirect back with **✅ Success message**

### Test in Browser Console

1. Open app in browser
2. Press **F12** (Developer Tools)
3. Click **Console** tab
4. Type this and press Enter:

```javascript
import.meta.env.VITE_SUPABASE_URL
```

Should show your Supabase URL (not `undefined`)

---

## 🔄 LOCAL DEVELOPMENT

### For testing locally before Vercel

1. Open `.env.local` file in your project
2. Add your credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_CHAPA_PUBLIC_KEY=CHASECK_TEST_xxxx
```

3. Run locally:

```bash
npm run dev
```

4. Test at `http://localhost:3000`

---

## 🧪 TESTING CHAPA PAYMENT

### Use Test Card

In test mode, use this fake card:

```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
Name: Test User
```

This card will ALWAYS work in test mode, no real money charged ✅

### Payment Methods

Customers can choose from:
- CBE Wallet
- Telebirr (mobile money)
- Visa/MasterCard
- Other methods enabled in Chapa

---

## 🔐 GOING LIVE WITH REAL MONEY

When you're ready to accept REAL payments:

1. Log in to Chapa dashboard
2. Get your **LIVE KEY** (not TEST key)
3. Update Vercel env var `VITE_CHAPA_PUBLIC_KEY` with LIVE key
4. That's it! You're accepting real payments now

⚠️ **Important:** Make sure you switch to LIVE key, not TEST key!

---

## 🆘 TROUBLESHOOTING

### Environment variables not loading?

1. Check Vercel dashboard → Environment Variables
2. Verify variable names are EXACTLY:
   - `VITE_SUPABASE_URL` (not REACT_APP_SUPABASE_URL)
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_CHAPA_PUBLIC_KEY`
3. Wait 3-5 minutes after adding for deployment to complete
4. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

### "Payment system not configured" error?

1. Check `VITE_CHAPA_PUBLIC_KEY` is set in Vercel
2. Verify the key is complete (no cut-off)
3. Redeploy manually from Vercel dashboard
4. Clear browser cache

### Database not saving bookings?

1. Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
2. Verify Supabase tables exist (shime_bookings, shime_payments, etc.)
3. Check Supabase RLS policies allow public insert/update
4. Open Supabase dashboard → Table Editor to see if booking was saved

### Still having issues?

Check the browser console (F12):
1. Look for any red error messages
2. Check network tab for failed requests
3. Screenshot the error
4. Contact support with error details

---

## 📊 WHAT TO EXPECT AFTER SETUP

### Bookings
- ✅ Bookings saved to Supabase automatically when customer accepts terms
- ✅ Can view all bookings in Supabase dashboard

### Payments
- ✅ Customers can pay via Chapa hosted checkout
- ✅ Payment status updated automatically
- ✅ Booking status marked as "deposit_paid"
- ✅ Success confirmation shown to customer

### Database
- View all bookings at: Supabase Dashboard → Table Editor → shime_bookings
- See all payments at: Supabase Dashboard → Table Editor → shime_payments
- Run SQL queries to analyze data

---

## 🎯 SUMMARY

```
Setup Time:    10 minutes
Testing:       5 minutes
Live Status:   Immediate after deployment

Result:
✅ Fully functional booking system
✅ Payment processing via Chapa
✅ Database storage with Supabase
✅ Ready for customers!
```

---

## 📞 HELP

- **Supabase Help:** https://supabase.com/docs
- **Chapa Help:** https://chapa.co/contact
- **Vercel Help:** https://vercel.com/support

---

**Your payment system is ready! Deploy and start accepting bookings! 🎉**
