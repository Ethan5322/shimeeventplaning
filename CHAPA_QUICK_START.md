# 🚀 CHAPA QUICK START - DO THIS NOW!

## **3 SIMPLE STEPS TO ACTIVATE PAYMENTS**

---

## **STEP 1: CREATE CHAPA ACCOUNT (5 minutes)**

### Go to: https://chapa.co

```
1. Click "Sign Up" or "Get Started"
2. Enter your email
3. Create password
4. Verify email (check inbox)
5. Fill in:
   - Business Name: Shime Events & Planning
   - Type: Event Planning
   - Country: Ethiopia
6. Done! ✅
```

---

## **STEP 2: GET YOUR API KEY (2 minutes)**

### Go to: https://chapa.co/dashboard

```
1. Login to your account
2. Look for "Settings" or "API Keys"
3. Find your TEST KEY (looks like):
   CHASECK_TEST_xxxxxxxxxxxxxxxxxxxxxxxx

4. COPY THIS KEY (the long text)
5. Save it somewhere safe
```

---

## **STEP 3: ADD KEY TO VERCEL (3 minutes)**

### Go to: https://vercel.com/dashboard

```
1. Click your project: shimeeventplaning
2. Click "Settings" tab
3. Find "Environment Variables" in left menu
4. Click "Add New"
5. Fill in:
   Name: REACT_APP_CHAPA_KEY
   Value: (Paste your TEST KEY here)
   Environments: ✅ Select all
6. Click "Save"
7. Done! ✅
```

---

## **THAT'S IT! YOUR PAYMENT SYSTEM IS NOW ACTIVE! 🎉**

---

## **NOW TEST IT**

### **Option A: Test Locally**

```bash
npm run dev
```

Then:
1. Go to http://localhost:5173
2. Complete a booking
3. Accept terms
4. Click "💳 Pay Now with Chapa"
5. Test with card: 4111 1111 1111 1111
6. Payment should work! ✅

### **Option B: Test on Live Site**

```
Already deployed! Your changes are live at:
https://shimeeventplaning.vercel.app

Just:
1. Go to the site
2. Complete a booking
3. Click "Pay Now with Chapa"
4. Test payment
```

---

## **WHAT CUSTOMERS WILL SEE**

```
┌─────────────────────────────────────┐
│      BOOKING CONFIRMATION           │
├─────────────────────────────────────┤
│                                     │
│  Booking Fee (Non-Refundable)       │
│  ETB 5,000                          │
│                                     │
│  ✅ Accept Terms & Conditions       │
│                                     │
│  💳 Pay Now with Chapa (ETB 5,000)  │ ← NEW!
│                                     │
│  📄 Download Contract (PDF)         │
│  📱 Share via WhatsApp              │
│  ✈️  Share via Telegram              │
│                                     │
└─────────────────────────────────────┘

When they click "Pay Now with Chapa":
↓
Redirected to Chapa payment page
↓
Choose payment method:
- CBE Wallet
- Telebirr
- Bank Card
- International Card
↓
Enter payment details
↓
Payment processed
↓
Redirected back with confirmation
↓
Booking confirmed automatically ✅
```

---

## **TEST PAYMENT DETAILS**

```
Use this FAKE card for testing:

Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
Name: Test User

This card will ALWAYS work in test mode.
Real money is NOT charged! ✅
```

---

## **PAYMENT METHODS AVAILABLE**

When customer clicks "Pay Now with Chapa", they can choose:

```
✅ CBE Wallet (Most popular in Ethiopia)
   - Direct bank payment
   - Instant confirmation

✅ Telebirr (Mobile money)
   - Works on any phone
   - No smartphone needed (SMS option)

✅ Bank Cards
   - Visa/MasterCard
   - Local and international

✅ Other Methods
   - More options in Chapa
```

---

## **FEES**

```
You pay: 3-5% per transaction
Customer pays: Nothing extra

Example:
Customer pays: ETB 10,000
Fee: ETB 300-500
You receive: ETB 9,500-9,700
```

---

## **WHAT HAPPENS WHEN CUSTOMER PAYS**

```
1. Customer clicks "Pay Now with Chapa"
   ↓
2. Goes to Chapa payment page
   ↓
3. Selects payment method (CBE/Telebirr/Card)
   ↓
4. Enters payment details
   ↓
5. Pays ETB 5,000 (or your amount)
   ↓
6. Chapa processes payment (instant)
   ↓
7. Customer redirected back to your site
   ↓
8. Booking marked as PAID ✅
   ↓
9. Confirmation shown
   ↓
10. PDF & sharing options ready
```

---

## **WHAT YOU GET**

```
✅ Automatic payment processing
✅ Real-time confirmation
✅ Customer payment history
✅ No manual verification needed
✅ Professional payment experience
✅ Secure transactions
✅ Instant money transfer
✅ Dashboard to track payments
```

---

## **GOING LIVE WITH REAL MONEY**

```
Right now: Using TEST mode
- ✅ Test payments only
- ❌ No real money transfers

When you want REAL MONEY:
1. Get LIVE KEY from Chapa dashboard
2. Replace TEST KEY in Vercel
3. Redeploy
4. Start accepting real payments!

Switch takes 5 minutes! ⚡
```

---

## **NEXT STEP: FOLLOW THESE INSTRUCTIONS**

### **Have you created a Chapa account yet?**

If NO:
```
1. Go to https://chapa.co
2. Sign up (5 minutes)
3. Come back here
```

If YES:
```
1. Get your TEST KEY from dashboard
2. Go to Vercel
3. Add environment variable
4. Test on your site
5. Done! 🎉
```

---

## **HELP & SUPPORT**

If something doesn't work:

```
1. Check CHAPA_SETUP_GUIDE.md for detailed steps
2. Verify API key is correct
3. Check Vercel environment variables
4. Test locally first
5. Check browser console for errors

Chapa Support: https://chapa.co/contact
```

---

## **SUMMARY**

```
✅ Code already added
✅ Payment button ready
✅ Webhook configured
✅ Just need API key from Chapa
✅ Add to Vercel environment
✅ Test and go live!

3 minutes to activate payments! ⚡
```

---

**YOU'RE 90% DONE! Just need to add your API key and you're live! 🚀**

Follow the 3 steps above and your payment system will be working in minutes!
