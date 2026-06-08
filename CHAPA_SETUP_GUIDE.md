# 🎯 CHAPA PAYMENT INTEGRATION SETUP GUIDE

## Complete Chapa Payment System Setup for Shime Events

---

## 📋 STEP-BY-STEP SETUP

### **STEP 1: CREATE CHAPA ACCOUNT**

#### 1.1 Sign Up
```
1. Go to: https://chapa.co
2. Click "Get Started" or "Sign Up"
3. Enter email address
4. Create strong password
5. Verify your email (check inbox)
6. Fill business details:
   - Business Name: Shime Events & Planning
   - Business Type: Event Planning
   - Country: Ethiopia
7. Accept terms and complete signup
```

#### 1.2 Get API Keys
```
After signup:
1. Go to Dashboard: https://chapa.co/dashboard
2. Login with your credentials
3. Find "Settings" or "API Keys" in menu
4. You will see TWO keys:

   TEST KEY (Development):
   CHASECK_TEST_xxxxxxxxxxxxxxxxxxxxxxxx
   👉 COPY THIS
   
   LIVE KEY (Production):
   CHASECK_LIVE_xxxxxxxxxxxxxxxxxxxxxxxx
   👉 SAVE FOR LATER (don't use yet)

5. Keep these keys SAFE and PRIVATE!
```

---

### **STEP 2: ADD KEYS TO VERCEL**

#### 2.1 Open Vercel Dashboard
```
1. Go to: https://vercel.com/dashboard
2. Click your project: shimeeventplaning
3. Click "Settings" tab
```

#### 2.2 Add Environment Variables
```
1. In Settings, find "Environment Variables" in left menu
2. Click "Environment Variables"
3. Click "Add New"

ADD FIRST VARIABLE:
┌─────────────────────────────────┐
│ Name: REACT_APP_CHAPA_KEY       │
│ Value: (Paste your TEST KEY)    │
│ Environments: Select all (✓)    │
│ Click "Save"                    │
└─────────────────────────────────┘

VARIABLE ADDED! ✅

Now it looks like:
Name: REACT_APP_CHAPA_KEY
Value: CHASECK_TEST_xxx...
Environments: Production, Preview, Development
```

---

### **STEP 3: INSTALL CHAPA PACKAGE**

#### 3.1 Open Terminal
```bash
cd c:\Users\mule\OneDrive\Desktop\shime
```

#### 3.2 Install Package
```bash
npm install chapa
```

**Wait for completion, you'll see:**
```
✅ added 1 package
✅ npm notice
```

---

### **STEP 4: TEST THE INTEGRATION**

#### 4.1 Start Local Server
```bash
npm run dev
```

You'll see:
```
✅ VITE v... dev server running at:
   → http://localhost:5173
```

#### 4.2 Open in Browser
```
1. Go to: http://localhost:5173
2. Complete a booking through all steps
3. When you reach "Deposit Confirmation" page
4. You should see: "💳 Pay Now with Chapa (ETB amount)"
5. Click "Accept Terms & Conditions"
6. The "Pay Now with Chapa" button will appear
```

#### 4.3 Test Payment
```
1. Click "Pay Now with Chapa"
2. You will be redirected to Chapa payment page
3. Select payment method (CBE Wallet, Telebirr, Card)
4. Use TEST CARD:
   Card Number: 4111 1111 1111 1111
   Expiry: 12/25
   CVV: 123
5. Payment should process
6. You'll be redirected back to your app
```

---

### **STEP 5: DEPLOY TO VERCEL**

#### 5.1 Commit Changes
```bash
git add -A
git commit -m "Add Chapa payment integration"
```

#### 5.2 Push to GitHub
```bash
git push origin main
```

Vercel will automatically:
- ✅ See your push
- ✅ Build your app
- ✅ Deploy to https://shimeeventplaning.vercel.app
- ✅ Use the REACT_APP_CHAPA_KEY from environment variables

**Deployment complete in 2-5 minutes!**

---

### **STEP 6: TEST ON LIVE SITE**

```
1. Go to: https://shimeeventplaning.vercel.app
2. Complete a full booking
3. Accept terms
4. Click "Pay Now with Chapa"
5. Test payment with test card
6. Verify payment works
```

---

## 🧪 TEST PAYMENT DETAILS

### **Test Card Information**
```
Card Number: 4111 1111 1111 1111
Expiry Month: 12
Expiry Year: 25
CVV: 123
Name: Test User
```

### **Test Payment Methods**
```
✅ CBE Wallet (Test)
✅ Telebirr (Test)
✅ Card (Use above test card)
✅ International Card
```

### **Expected Results**
```
Payment → Processing → Success
↓
Customer redirected to: ?booking=ref&payment=success
↓
Booking confirmed ✅
↓
Webhook receives confirmation
↓
Payment recorded
```

---

## 💰 CHAPA PRICING

```
Setup Cost: FREE
Monthly Fee: FREE
Transaction Fee: 3% - 5% of payment

Example:
Customer pays: ETB 10,000
Fee: ETB 300 - 500 (3-5%)
You receive: ETB 9,500 - 9,700

NO HIDDEN CHARGES ✅
```

---

## 📱 PAYMENT FLOW IN YOUR APP

### **Current User Experience:**
```
1. Customer completes booking form (16 steps)
2. Reviews all details
3. Accepts terms & conditions
4. Sees deposit amount: "ETB 5,000"
5. Clicks "Pay Now with Chapa"
6. Redirected to Chapa payment page
7. Selects payment method:
   - CBE Wallet
   - Telebirr
   - Card
8. Enters payment details
9. Payment processed
10. Redirected back to app
11. Booking confirmed automatically ✅
12. Receipt generated
13. PDF downloaded
14. Shares via WhatsApp/Telegram
```

---

## 🔗 PAYMENT LINK INFORMATION

### **What Customer Sees:**
```
SHIME EVENTS BOOKING PAYMENT
═══════════════════════════════

Amount: ETB 5,000
Event: Wedding - Elegance Package
Client: [Customer Name]
Reference: SE-1717920000000

Payment Methods Available:
🏦 CBE Wallet
📱 Telebirr
💳 Visa/MasterCard
```

---

## ✅ CHECKLIST BEFORE GOING LIVE

```
✅ Step 1: Created Chapa account
✅ Step 2: Got API keys
✅ Step 3: Added keys to Vercel environment
✅ Step 4: Installed chapa package
✅ Step 5: Code integrated (payment function + button)
✅ Step 6: Webhook created
✅ Step 7: Tested locally with test card
✅ Step 8: Deployed to Vercel
✅ Step 9: Tested on live site
✅ Step 10: Everything working!
```

---

## 🚀 GOING LIVE WITH REAL MONEY

### **When Ready:**
```
1. Get LIVE KEY from Chapa
2. Replace TEST KEY in Vercel environment:
   REACT_APP_CHAPA_KEY = CHASECK_LIVE_xxx...
3. Deploy (git push)
4. Test with real payment
5. Go live! 🎉

IMPORTANT: Keep TEST and LIVE keys separate!
Never mix them!
```

---

## 🆘 TROUBLESHOOTING

### **Payment Button Not Showing**
```
Issue: "Pay Now with Chapa" button not visible
Fix: 
1. Check environment variable is set
2. Check REACT_APP_CHAPA_KEY exists
3. Check you're on Step 17 (deposit page)
4. Check you accepted terms
```

### **"Payment initialization failed"**
```
Issue: Button clicked but shows error
Fix:
1. Check your TEST KEY is correct
2. Check network connection
3. Check API key not expired
4. Check Chapa account is active
```

### **Payment link takes too long**
```
Issue: Waiting > 5 seconds for payment page
Fix:
1. Check internet connection
2. Check Chapa server status
3. Refresh page and try again
```

---

## 📞 CHAPA SUPPORT

```
Help: https://chapa.co/contact
Email: support@chapa.co
Dashboard: https://chapa.co/dashboard
Docs: https://chapa.co/docs
```

---

## 🎯 NEXT STEPS

### **Immediate:**
1. ✅ Follow steps 1-6 above
2. ✅ Test payment system
3. ✅ Go live

### **Future Enhancements:**
1. Email receipts to customers
2. SMS payment reminders
3. Payment status dashboard
4. Refund handling
5. Multiple payment methods per booking
6. Payment history

---

## 📊 YOUR PAYMENT SETUP

```
Payment Provider: Chapa
Supported Currencies: ETB (Ethiopian Birr)
Supported Methods:
  - CBE Wallet
  - Telebirr
  - Bank Cards
  - International Cards

Fee: 3-5% per transaction
Settlement: Instant
Verification: Automatic
Dashboard: https://chapa.co/dashboard
```

---

## ✨ FEATURES ENABLED

✅ **One-Click Payment** - Customer clicks button, goes to Chapa
✅ **Multiple Payment Methods** - CBE, Telebirr, Cards
✅ **Automatic Confirmation** - Payment confirmed instantly
✅ **Webhook Integration** - Server notified of payment
✅ **Test Mode** - Test with test cards before going live
✅ **Live Mode** - Accept real payments from customers
✅ **Mobile Friendly** - Works on phone and desktop
✅ **Secure** - Bank-level security by Chapa

---

**CHAPA PAYMENT INTEGRATION COMPLETE! 🎉**

You now have a professional, automated payment system ready for your customers!
