# 🚀 Razorpay Payment Gateway - Quick Setup Guide

## ⚡ 5-Minute Setup

Follow these steps to get Razorpay payments working:

---

## Step 1: Get Razorpay Test Credentials (2 min)

1. Go to https://razorpay.com
2. Click **"Sign Up"** (it's free!)
3. Complete basic registration
4. Go to **Settings** → **API Keys**
5. Click **"Generate Test Keys"**
6. Copy both keys:
   - `key_id` (looks like: `rzp_test_XXXXXXXXXXXXXXXX`)
   - `key_secret` (looks like: `XXXXXXXXXXXXXXXXXXXXXXXX`)

---

## Step 2: Configure Environment Variables (1 min)

Create or update `server/.env` file:

```env
# Add these lines at the end of your .env file
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

**Replace** the X's with your actual test keys from Step 1.

---

## Step 3: Install Dependencies (1 min)

```bash
cd server
npm install
```

This installs the `razorpay` package that was added to `package.json`.

---

## Step 4: Run Database Migration (30 seconds)

```bash
cd server
npx knex migrate:latest
```

This creates the `payments` table in your database.

---

## Step 5: Start the Application (30 seconds)

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm start
```

---

## 🎉 You're Done!

### Test the Payment Flow:

1. **Login** as a student or parent
2. Click **"Pay Fees"** in the sidebar
3. Click **"Pay Now"** on any pending fee
4. **Razorpay checkout** will open
5. Use this **test card**:
   - Card Number: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: `12/25`
   - Name: Any name
6. Click **"Pay"**
7. See your **receipt**! 🧾

---

## 💳 Test Cards

### **Successful Payment:**
- Card: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

### **Failed Payment:**
- Card: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### **UPI Test:**
- UPI ID: `success@razorpay`

---

## 🔍 Troubleshooting

### Payment not working?

**Check 1:** Are Razorpay credentials correct in `.env`?
```bash
cat server/.env | grep RAZORPAY
```

**Check 2:** Did migration run successfully?
```bash
cd server
npx knex migrate:status
```

**Check 3:** Is server running without errors?
- Check terminal for error messages
- Look for "Server running on port 5000"

**Check 4:** Can you see the Razorpay checkout?
- Check browser console (F12)
- Look for any JavaScript errors

### Still not working?

1. Restart both server and client
2. Clear browser cache
3. Check browser console for errors
4. Verify `.env` file is in `server/` directory
5. Verify `payments` table exists in database

---

## 📚 More Information

For detailed documentation, see:
- **Full Guide:** `RAZORPAY_PAYMENT_GATEWAY_COMPLETE.md`
- **Razorpay Docs:** https://razorpay.com/docs

---

## ✅ Quick Checklist

- [ ] Signed up for Razorpay account
- [ ] Got test API keys
- [ ] Added keys to `server/.env`
- [ ] Ran `npm install` in server directory
- [ ] Ran database migration
- [ ] Started server (no errors)
- [ ] Started client
- [ ] Can login to application
- [ ] Can see "Pay Fees" in sidebar
- [ ] Razorpay checkout opens
- [ ] Test payment successful
- [ ] Receipt displays correctly

---

**That's it! You now have a fully functional payment gateway! 🎊**

**Remember:** This is TEST MODE - no real money is charged! 💸

