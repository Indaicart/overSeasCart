# 💰 PAYROLL SYSTEM - QUICK REFERENCE CARD

## 🚀 Quick Start (3 Steps)

### 1️⃣ Run Migration
```bash
cd server
npx knex migrate:latest
```

### 2️⃣ Start Servers
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm start
```

### 3️⃣ Access Payroll
```
Login as Admin → Sidebar → "Staff Payroll"
```

---

## 📋 Main Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/payroll` | Staff List | Admin |
| `/payroll/configure/:id` | Configure Salary | Admin |
| `/payroll/process-payment/:id` | Process Payment | Admin |
| `/payroll/pending-payments` | Pending Payments | Admin |
| `/payroll/payment-history/:id` | Payment History | Admin |
| `/payroll/salary-slip/:id` | Salary Slip | Admin, Teacher |

---

## 🎯 Common Tasks

### Configure Staff Salary
```
Staff Payroll → Find Staff → Configure Salary
→ Enter Basic Salary: 30000
→ Add Allowances: HRA (10000), DA (5000), etc.
→ Add Deductions: PF (3600), TDS (2500), etc.
→ Add Bank Details
→ Save
```

### Pay Salary (Offline)
```
Pending Payments → Select Month
→ Click "Pay Now"
→ Enter Attendance (26 working days, 24 present)
→ Add Bonus: 2000 (if any)
→ Select "Offline Cash"
→ Enter Amount: 45000
→ Pay Cash
```

### Pay Salary (Online)
```
Staff Payroll → Click "Pay Salary"
→ Enter Attendance
→ Select "Online Transfer"
→ Pay via Razorpay
→ Use Test Card: 4111 1111 1111 1111
→ Complete Payment
```

### Print Salary Slip
```
Staff Payroll → Payment History
→ Click "View Slip"
→ Click "Print Slip"
→ Save as PDF or Print
```

---

## 🧪 Test Data

### Test Card (Razorpay)
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
```

### Sample Salary Configuration
```
Basic Salary: 30,000
HRA: 10,000
DA: 5,000
TA: 2,000
Medical: 1,000
--------------------
Gross: 48,000

PF: 3,600
ESI: 1,000
TDS: 2,500
--------------------
Deductions: 7,100

Net Salary: 40,900
```

---

## 📊 Status Indicators

| Symbol | Meaning |
|--------|---------|
| 🟢 | Configured / Paid |
| 🟡 | Pending |
| 🔴 | Not Configured |
| 💵 | Cash Payment |
| 💳 | Online Payment |
| ✓ | Full Payment |
| ⚠️ | Partial Payment |

---

## 🔐 Access Control

- ✅ **Admin:** All payroll features
- ✅ **Teacher:** Own salary slip only
- ❌ **Others:** No access

---

## 📱 Sidebar Links (Admin)

- **Staff Payroll** → Main dashboard
- **Pending Payments** → Month-wise pending view

---

## 🎨 Key Features

### Real-Time Calculations ⚡
- Gross Salary = Sum of all earnings
- Total Deductions = Sum of all deductions
- Net Salary = Gross - Deductions
- Pro-rated = (Net / Working Days) × Present Days

### Payment Methods 💳
1. **Offline:** Cash, Cheque, Bank Transfer (manual)
2. **Online:** Razorpay (automatic verification)

### Salary Components 💰
**Earnings:**
- Basic Salary ⭐ (required)
- HRA, DA, TA, Medical, Others

**Deductions:**
- PF, ESI, Professional Tax, TDS, Others

**Adjustments:**
- Bonus (add)
- Penalty (deduct)

---

## 🐛 Troubleshooting

### "Salary not configured"
→ Go to Configure Salary and add salary structure

### "Bank details not configured"
→ Edit salary config and add bank details

### "Payment failed"
→ Check Razorpay test mode credentials

### Component not found
→ Check import path: `./pages/Payroll/StaffSalaryList`

---

## 📚 Files Created

### Frontend:
- `client/src/pages/Payroll/StaffSalaryList.js` (Main)
- `client/src/pages/Payroll/ConfigureSalary.js`
- `client/src/pages/Payroll/ProcessPayment.js`
- `client/src/pages/Payroll/PendingPayments.js`
- `client/src/pages/Payroll/PaymentHistory.js`
- `client/src/pages/Payroll/SalarySlip.js`

### Backend:
- `server/routes/payroll.js`
- `server/migrations/031_create_staff_salaries.js`
- `server/migrations/032_create_salary_payments.js`

### Documentation:
- `PAYROLL_SYSTEM_SUMMARY.md` (Complete guide)
- `PAYROLL_FRONTEND_COMPLETE.md` (Frontend details)
- `PAYROLL_API_COMPLETE.md` (Backend API)
- `PAYROLL_QUICK_REFERENCE.md` (This file)

---

## 🎯 Quick Actions Cheatsheet

```javascript
// Navigate to payroll
navigate('/payroll')

// Configure salary for teacher ID 5
navigate('/payroll/configure/5')

// Process payment for teacher ID 5
navigate('/payroll/process-payment/5')

// View payment history for teacher ID 5
navigate('/payroll/payment-history/5')

// View salary slip ID 10
navigate('/payroll/salary-slip/10')

// View pending payments
navigate('/payroll/pending-payments')
```

---

## ✅ Implementation Status

| Feature | Status |
|---------|--------|
| Database Tables | ✅ Complete |
| Backend API | ✅ Complete |
| Frontend Components | ✅ Complete |
| Razorpay Integration | ✅ Complete |
| Routes & Navigation | ✅ Complete |
| Offline Payments | ✅ Complete |
| Online Payments | ✅ Complete |
| Salary Slips | ✅ Complete |
| Print Functionality | ✅ Complete |
| Role-Based Access | ✅ Complete |

**🎉 ALL FEATURES: 100% COMPLETE!**

---

## 🚀 Next Actions

1. ✅ Test with real staff data
2. ✅ Configure Razorpay live keys (when ready)
3. ✅ Train admins on the system
4. ✅ Generate test salary slips
5. ✅ Set up email notifications (optional)

---

## 💡 Pro Tips

1. **Configure salaries at the start of the academic year**
2. **Process all payments before month-end**
3. **Keep digital copies of salary slips**
4. **Use online payments for faster processing**
5. **Print slips immediately after payment**

---

## 📞 Support Resources

- **System Guide:** `PAYROLL_SYSTEM_SUMMARY.md`
- **API Docs:** `PAYROLL_API_COMPLETE.md`
- **Frontend Guide:** `PAYROLL_FRONTEND_COMPLETE.md`
- **Razorpay Docs:** `RAZORPAY_PAYMENT_GATEWAY_COMPLETE.md`

---

**🎊 Enjoy your new Payroll System!** 💰✨

