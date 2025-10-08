# Quick Start: School Self-Service Registration

## 🚀 Get Started in 5 Minutes

### Prerequisites
1. Node.js server running on port 5000
2. React client running on port 3000
3. PostgreSQL database with latest migrations

### Step 1: Run Migrations

```bash
cd server
npm run migrate
```

### Step 2: Start the Application

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm install
npm start
```

### Step 3: Access School Registration

Open your browser and navigate to:
```
http://localhost:3000/school-registration
```

Or click "Register Your School" button on the login page.

---

## 📝 Complete a Test Registration

### Step 1: School Information

Fill in the school details:

```
School Name:          ABC International School
School Email:         contact@abcschool.com
School Phone:         +1 (555) 123-4567
School Address:       123 Education Street, City, State, ZIP
Estimated Students:   500
Estimated Teachers:   50

Admin First Name:     John
Admin Last Name:      Doe
Admin Email:          john.doe@abcschool.com
Admin Password:       SecurePass123
Confirm Password:     SecurePass123
```

Click **"Next"**

### Step 2: Choose Your Plan

1. Toggle to **"Annual"** billing (saves 20%)
2. Select the **"Standard"** plan
3. Click **"Next"**

### Step 3: Payment

Fill in payment details (test card):

```
Card Number:          4111 1111 1111 1111
Cardholder Name:      John Doe
Expiry Date:          12/25
CVV:                  123
```

Click **"Complete Registration"**

### Step 4: Success! 🎉

You'll see:
- ✅ Success message
- ✅ Welcome screen
- ✅ Next steps guide
- ✅ "Go to Login" button

---

## 🔑 Login as School Admin

1. Click **"Go to Login"**
2. Enter credentials:
   ```
   Email:    john.doe@abcschool.com
   Password: SecurePass123
   ```
3. You're in! 🎊

---

## 👥 Add Internal Admins

Once logged in as school admin:

1. Look for **"Internal Admins"** in sidebar
2. Click **"+ Add Internal Admin"**
3. Fill in details:
   ```
   First Name:   Jane
   Last Name:    Smith
   Email:        jane@abcschool.com
   Password:     SecurePass123
   ```
4. Select permissions (checkboxes)
5. Click **"Create"**
6. Done! Jane can now login with her credentials

---

## 🎯 What You Can Do Now

### As School Admin:
✅ Add teachers and students
✅ Create classes and subjects
✅ Track attendance
✅ Manage grades and fees
✅ Add internal administrators
✅ Configure school settings
✅ View reports and analytics

### Internal Admins:
✅ Access based on assigned permissions
✅ Help manage school operations
✅ Collaborate with primary admin
✅ View relevant data and reports

---

## 🧪 Testing Different Plans

Try registering with different plans to see the differences:

### Basic Plan ($99/month or $950/year)
- 200 students
- 20 teachers
- 10GB storage

### Standard Plan ($299/month or $2,400/year)
- 500 students
- 50 teachers
- 50GB storage

### Premium Plan ($599/month or $4,800/year)
- 1000 students
- 100 teachers
- 200GB storage

### Enterprise Plan ($999/month or $8,000/year)
- Unlimited students
- Unlimited teachers
- 1TB storage

---

## 🎴 Test Cards

**Success:**
```
4111 1111 1111 1111 - Visa
5555 5555 5555 4444 - Mastercard
3782 822463 10005   - American Express
```

**Decline:**
```
4000 0000 0000 0000 - Will be declined
```

---

## 🔍 Verify Registration

Check that everything was created:

### In Database:
```sql
-- Check school
SELECT * FROM schools WHERE email = 'contact@abcschool.com';

-- Check admin user
SELECT * FROM users WHERE email = 'john.doe@abcschool.com';

-- Check subscription
SELECT * FROM subscriptions WHERE school_id = 'YOUR_SCHOOL_ID';

-- Check payment
SELECT * FROM payments WHERE school_id = 'YOUR_SCHOOL_ID';
```

### In Server Console:
Look for the welcome email output showing:
- School name
- Admin name
- Plan details
- Login URL

---

## ❓ Troubleshooting

### "Email already exists"
→ Use a different email address or delete the existing school/user

### "Payment failed"
→ Check if you're using test card ending in 0000 (designed to fail)
→ Use card 4111 1111 1111 1111 instead

### Can't see Internal Admins
→ Make sure you're logged in as school admin (not super admin)
→ Check sidebar for "Internal Admins" menu item

### Registration not working
→ Check that both backend and frontend are running
→ Verify database migrations are up to date
→ Check browser console for errors

---

## 🎉 Next Steps

1. **Customize Subscription Plans:**
   - Edit plans in database
   - Update pricing
   - Modify features list

2. **Setup Real Payment Gateway:**
   - Integrate Stripe
   - Or integrate PayPal
   - Configure webhooks

3. **Configure Email Service:**
   - Setup SendGrid
   - Or use AWS SES
   - Create email templates

4. **Add More Features:**
   - Trial periods
   - Discount codes
   - Referral program
   - Billing portal

---

## 📚 Documentation

- **Full Documentation:** `SCHOOL_SELF_SERVICE_REGISTRATION.md`
- **API Reference:** See API Endpoints section
- **Database Schema:** See migrations folder
- **UI Components:** Check React components

---

## 🎊 You're All Set!

You now have a fully functional school self-service registration system where:
- ✅ Schools can register themselves
- ✅ They choose their own subscription plans
- ✅ Payment is processed automatically
- ✅ Accounts are activated instantly
- ✅ They can add internal administrators
- ✅ They can start using the system immediately

**Happy School Management!** 🏫📚👨‍🎓
