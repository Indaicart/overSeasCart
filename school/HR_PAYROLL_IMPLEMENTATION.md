# 💼 HR & PAYROLL SYSTEM - IMPLEMENTATION GUIDE

## ✅ Status: Backend Complete, Frontend In Progress

---

## 🎯 What Was Implemented

### **Backend (100% Complete)** ✅

#### **1. Database Tables:**
- **`staff_salaries`** - Salary configuration for each staff member
  - Basic salary + allowances (HRA, DA, TA, Medical, Other)
  - Deductions (PF, ESI, Professional Tax, TDS, Other)
  - Bank details (account number, IFSC, PAN)
  - Effective dates and status
  
- **`salary_payments`** - Monthly salary payment records
  - Payment month/year
  - Gross, deductions, net amounts
  - Payment method (offline_cash, online_transfer)
  - Payment status (pending, partial, paid, failed)
  - Razorpay integration fields
  - Salary breakdown (JSON)
  - Working days, attendance, bonus, penalty

#### **2. Payroll Helper Functions:**
File: `server/utils/payrollHelper.js`
- `calculateGrossSalary()` - Sum of basic + allowances
- `calculateTotalDeductions()` - Sum of all deductions
- `calculateNetSalary()` - Gross - Deductions
- `calculateProRatedSalary()` - Based on working/present days
- `generateSlipNumber()` - Unique salary slip numbers
- `getMonthName()` - Convert month number to name
- `generateSalaryBreakdown()` - Detailed breakdown for slip
- `getPendingMonths()` - Find unpaid months

#### **3. Payroll API Routes:**
File: `server/routes/payroll.js`

**A. Salary Configuration:**
- `POST /api/payroll/salary-config` - Configure staff salary
- `GET /api/payroll/salary-config/:teacherId` - Get salary config

**B. Staff Management:**
- `GET /api/payroll/staff-list` - List all staff with salary info
- `GET /api/payroll/pending-payments` - Get pending salary payments for a month

**C. Payment Processing:**
- `POST /api/payroll/process-offline-payment` - Process cash payment
- `POST /api/payroll/initiate-online-payment` - Start online payment via Razorpay
- `POST /api/payroll/complete-online-payment` - Complete online payment after Razorpay

**D. History & Reports:**
- `GET /api/payroll/payment-history/:teacherId` - Payment history
- `GET /api/payroll/salary-slip/:id` - Get salary slip details

---

### **Frontend (Partial - 1 Component Created)** ⚠️

#### **Created:**
1. ✅ `StaffSalaryList.js` - Main dashboard showing all staff

#### **Still Need to Create:**
2. ❌ `ConfigureSalary.js` - Form to set up salary
3. ❌ `ProcessPayment.js` - Process offline/online payment
4. ❌ `PendingPayments.js` - Monthly payment processing
5. ❌ `PaymentHistory.js` - View payment history
6. ❌ `SalarySlip.js` - View/print salary slip
7. ❌ Routes in App.js
8. ❌ Sidebar navigation

---

## 🔧 **REMAINING FRONTEND COMPONENTS**

### **Component 2: Configure Salary Form**
**File:** `client/src/pages/Payroll/ConfigureSalary.js`

**Features Needed:**
- Form to input salary components
  - Basic salary
  - Allowances (HRA, DA, TA, Medical, Other)
  - Deductions (PF, ESI, Professional Tax, TDS, Other)
- Auto-calculate gross and net salary
- Bank details section
  - Bank name
  - Account number
  - IFSC code
  - Account holder name
  - PAN number
- Payment frequency selector
- Effective date picker
- Submit to `POST /api/payroll/salary-config`

---

### **Component 3: Process Payment**
**File:** `client/src/pages/Payroll/ProcessPayment.js`

**Features Needed:**
- Display staff details and salary info
- Month/Year selector for payment
- Working days and attendance inputs
  - Total working days
  - Present days
  - Leave days
- Bonus and penalty inputs
- Calculated net amount display
- **Two Payment Options:**

**A. Offline Cash Payment:**
- Amount input field
- Notes textarea
- "Pay Cash" button
- Calls `POST /api/payroll/process-offline-payment`

**B. Online Transfer:**
- Display bank details (partially masked)
  - Bank name
  - Account: XXXX1234
  - IFSC code
- "Pay via Razorpay" button
- Integrates with Razorpay checkout
- Calls `POST /api/payroll/initiate-online-payment`
- On success: calls `POST /api/payroll/complete-online-payment`

**Flow:**
```javascript
// Offline Payment
const handleOfflinePayment = async () => {
  const response = await fetch('/api/payroll/process-offline-payment', {
    method: 'POST',
    body: JSON.stringify({
      teacher_id,
      payment_month,
      payment_year,
      paid_amount,
      working_days,
      present_days,
      leave_days,
      bonus,
      penalty,
      notes
    })
  });
  // Show success, redirect to history
};

// Online Payment
const handleOnlinePayment = async () => {
  // Step 1: Initiate payment
  const orderResponse = await fetch('/api/payroll/initiate-online-payment', {
    method: 'POST',
    body: JSON.stringify({
      teacher_id,
      payment_month,
      payment_year,
      working_days,
      present_days,
      leave_days,
      bonus,
      penalty
    })
  });
  const orderData = await orderResponse.json();
  
  // Step 2: Open Razorpay
  const options = {
    key: orderData.data.key,
    amount: orderData.data.amount * 100,
    currency: 'INR',
    order_id: orderData.data.orderId,
    name: 'Salary Payment',
    description: `Salary for ${orderData.data.teacher.name}`,
    notes: {
      bank_name: orderData.data.bank_details.bank_name,
      account: orderData.data.bank_details.account_number
    },
    handler: async function(response) {
      // Step 3: Complete payment
      await fetch('/api/payroll/complete-online-payment', {
        method: 'POST',
        body: JSON.stringify({
          salary_payment_id: orderData.data.salaryPaymentId,
          razorpay_payment_id: response.razorpay_payment_id
        })
      });
      // Show success
    }
  };
  
  const rzp = new window.Razorpay(options);
  rzp.open();
};
```

---

### **Component 4: Pending Payments Dashboard**
**File:** `client/src/pages/Payroll/PendingPayments.js`

**Features Needed:**
- Month/Year selector (default: current month)
- Fetch data from `GET /api/payroll/pending-payments?month=X&year=Y`
- Display table of all staff for selected month:
  - Staff name
  - Net salary
  - Payment status (Pending/Paid/Partial)
  - Bank details status (Has/Missing)
  - Action buttons:
    - "Pay" (if pending)
    - "View Slip" (if paid)
- Filter by status
- Bulk payment option (future enhancement)

---

### **Component 5: Payment History**
**File:** `client/src/pages/Payroll/PaymentHistory.js`

**Features Needed:**
- Fetch from `GET /api/payroll/payment-history/:teacherId`
- Display payment records:
  - Month & year
  - Gross amount
  - Deductions
  - Net amount
  - Paid amount
  - Payment status
  - Payment method (Cash/Online)
  - Payment date
  - "View Slip" button
- Filter by year
- Filter by status
- Export to Excel (future)

---

### **Component 6: Salary Slip**
**File:** `client/src/pages/Payroll/SalarySlip.js`

**Features Needed:**
- Fetch from `GET /api/payroll/salary-slip/:id`
- Professional salary slip design:
  - School header
  - Staff details (name, employee ID, designation, DOJ)
  - Payment month & year
  - Salary breakdown table:
    ```
    Earnings              | Amount    | Deductions         | Amount
    ---------------------|-----------|-------------------|--------
    Basic Salary         | 30,000    | PF                | 3,600
    HRA                  | 10,000    | ESI               | 1,000
    DA                   | 5,000     | Professional Tax  | 200
    TA                   | 2,000     | TDS               | 2,500
    Medical Allowance    | 1,000     | Other Deductions  | 0
    Other Allowances     | 2,000     |                   |
    Bonus                | 1,000     | Penalty           | 0
    ---------------------|-----------|-------------------|--------
    Total Earnings       | 51,000    | Total Deductions  | 7,300
    ```
  - Net salary (in words and figures)
  - Attendance details (working/present/leave days)
  - Bank details
  - Payment details (method, date, transaction ID)
  - Slip number
  - Generated date
  - "This is computer generated, no signature required"
- Print functionality
- Download as PDF (future)

---

## 🎨 **UI/UX Requirements**

### **Colors:**
- Paid status: Green
- Pending status: Yellow/Orange
- Failed status: Red
- Partial payment: Blue

### **Icons:**
- CurrencyDollarIcon - Salary/payments
- UserGroupIcon - Staff list
- CheckCircleIcon - Paid status
- ClockIcon - Pending status
- XCircleIcon - Failed/missing
- DocumentTextIcon - Salary slip
- BanknotesIcon - Cash payment
- CreditCardIcon - Online payment

### **Responsive Design:**
- Mobile: Stack cards vertically
- Tablet: 2-column grid
- Desktop: 3-4 column grid
- Tables: Horizontal scroll on mobile

---

## 📊 **Salary Calculation Example**

### **Input:**
```
Basic Salary: 30,000
HRA: 10,000
DA: 5,000
TA: 2,000
Medical: 1,000
Other Allowances: 2,000

PF (12%): 3,600
ESI: 1,000
Professional Tax: 200
TDS: 2,500
Other Deductions: 0

Bonus: 1,000
Penalty: 0

Working Days: 26
Present Days: 24
```

### **Calculation:**
```
Gross Salary = 30,000 + 10,000 + 5,000 + 2,000 + 1,000 + 2,000 = 50,000
Total Deductions = 3,600 + 1,000 + 200 + 2,500 + 0 = 7,300
Base Net = 50,000 - 7,300 = 42,700

Pro-rated Net = (42,700 / 26) * 24 = 39,477
Final Net = 39,477 + 1,000 (bonus) - 0 (penalty) = 40,477
```

---

## 🔄 **Payment Flows**

### **Offline Cash Payment Flow:**
```
1. Admin selects staff member
2. Admin clicks "Process Payment"
3. Select month/year
4. Enter working days, attendance
5. Enter bonus/penalty if any
6. View calculated net amount
7. Choose "Offline Cash"
8. Enter paid amount
9. Add notes (optional)
10. Click "Pay Cash"
11. System creates payment record
12. If full amount: status = "paid"
13. If partial: status = "partial"
14. Generate salary slip
15. Show success message
```

### **Online Transfer Flow:**
```
1. Admin selects staff member
2. Admin clicks "Process Payment"
3. Select month/year
4. Enter working days, attendance
5. Enter bonus/penalty if any
6. View calculated net amount
7. Choose "Online Transfer"
8. View bank details (partially masked)
9. Click "Pay via Razorpay"
10. System creates Razorpay order
11. Razorpay checkout opens
12. Admin completes payment
13. Razorpay returns success
14. System verifies payment
15. Update salary payment status to "paid"
16. Generate salary slip
17. Show success message
```

---

## 🗄️ **Database Schema**

### **staff_salaries Table:**
```sql
- id (Primary Key)
- school_id (Foreign Key → schools)
- teacher_id (Foreign Key → teachers)
- basic_salary (Decimal)
- hra, da, ta, medical_allowance, other_allowances (Decimal)
- pf, esi, professional_tax, tds, other_deductions (Decimal)
- gross_salary (Calculated)
- net_salary (Calculated)
- payment_frequency (monthly/weekly/bi-weekly)
- pay_day (1-31)
- effective_from, effective_to (Date)
- bank_name, account_number, ifsc_code, account_holder_name, pan_number
- is_active (Boolean)
- notes
- timestamps
```

### **salary_payments Table:**
```sql
- id (Primary Key)
- school_id (Foreign Key → schools)
- teacher_id (Foreign Key → teachers)
- staff_salary_id (Foreign Key → staff_salaries)
- payment_month (1-12)
- payment_year (YYYY)
- gross_amount, deductions, net_amount, paid_amount, pending_amount
- payment_method (offline_cash/online_transfer)
- payment_status (pending/partial/paid/failed)
- payment_date
- paid_by (Foreign Key → users)
- offline_notes, receipt_number
- payment_id (Foreign Key → payments)
- razorpay_order_id, razorpay_payment_id
- salary_breakdown (JSONB)
- slip_number
- working_days, present_days, leave_days
- bonus, penalty
- notes
- timestamps
```

---

## 🎯 **Features Summary**

### **Implemented (Backend):**
- ✅ Salary configuration with all components
- ✅ Gross/Net salary calculation
- ✅ Pro-rated salary for partial months
- ✅ Offline cash payment processing
- ✅ Online payment via Razorpay
- ✅ Payment history tracking
- ✅ Salary slip generation
- ✅ Bank details management
- ✅ Bonus and penalty support
- ✅ Attendance-based calculation

### **Partially Implemented (Frontend):**
- ✅ Staff salary list dashboard
- ⏳ Salary configuration form (needs creation)
- ⏳ Payment processing UI (needs creation)
- ⏳ Pending payments dashboard (needs creation)
- ⏳ Payment history view (needs creation)
- ⏳ Salary slip view (needs creation)

---

## 📱 **Routes Needed**

Add to `client/src/App.js`:

```javascript
import StaffSalaryList from './pages/Payroll/StaffSalaryList';
import ConfigureSalary from './pages/Payroll/ConfigureSalary';
import ProcessPayment from './pages/Payroll/ProcessPayment';
import PendingPayments from './pages/Payroll/PendingPayments';
import PaymentHistory from './pages/Payroll/PaymentHistory';
import SalarySlip from './pages/Payroll/SalarySlip';

// Inside Routes:
<Route path="payroll" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <StaffSalaryList />
  </ProtectedRoute>
} />

<Route path="payroll/configure/:teacherId" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <ConfigureSalary />
  </ProtectedRoute>
} />

<Route path="payroll/process-payment/:teacherId" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <ProcessPayment />
  </ProtectedRoute>
} />

<Route path="payroll/pending-payments" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <PendingPayments />
  </ProtectedRoute>
} />

<Route path="payroll/payment-history/:teacherId" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <PaymentHistory />
  </ProtectedRoute>
} />

<Route path="payroll/salary-slip/:id" element={
  <ProtectedRoute allowedRoles={['admin', 'teacher']}>
    <SalarySlip />
  </ProtectedRoute>
} />
```

---

## 🎨 **Sidebar Navigation**

Add to `client/src/components/Layout/Sidebar.js`:

```javascript
// In navigation array:
{ 
  name: 'HR & Payroll', 
  href: '/payroll', 
  icon: CurrencyDollarIcon, 
  roles: ['admin'] 
},
```

---

## 🧪 **Testing Checklist**

### **Database:**
- [ ] Run migrations
- [ ] Verify tables created
- [ ] Test foreign key constraints

### **Salary Configuration:**
- [ ] Configure salary for a teacher
- [ ] Verify gross/net calculation
- [ ] Update salary configuration
- [ ] Add bank details
- [ ] Verify salary in teacher profile

### **Offline Payment:**
- [ ] Process full payment
- [ ] Process partial payment
- [ ] Add bonus
- [ ] Add penalty
- [ ] Pro-rate for absent days
- [ ] Verify payment record created
- [ ] Verify status updates

### **Online Payment:**
- [ ] Initiate online payment
- [ ] Razorpay checkout opens
- [ ] Complete test payment
- [ ] Verify payment record
- [ ] Check bank details displayed
- [ ] Verify Razorpay integration

### **History & Slips:**
- [ ] View payment history
- [ ] Filter by month/year
- [ ] View salary slip
- [ ] Print salary slip
- [ ] Verify all calculations

---

## 🚀 **Next Steps**

### **Immediate:**
1. Create remaining 5 frontend components
2. Add routes to App.js
3. Add sidebar navigation
4. Test offline payment flow
5. Test online payment flow

### **Future Enhancements:**
- Bulk salary payment processing
- Email salary slips to staff
- SMS notifications on payment
- Payroll reports and analytics
- Tax calculation (Form 16)
- Leave management integration
- Loan/advance management
- Provident Fund reports
- ESI reports
- Annual bonus calculation
- Increment management

---

## 📝 **Summary**

**What's Complete:**
- ✅ Complete backend API (100%)
- ✅ Database schema (100%)
- ✅ Salary calculation logic (100%)
- ✅ Offline payment processing (100%)
- ✅ Online payment via Razorpay (100%)
- ✅ 1 frontend component (20%)

**What's Remaining:**
- ❌ 5 more frontend components
- ❌ Routes and navigation
- ❌ End-to-end testing

**Estimated Time to Complete:**
- Frontend components: 4-5 hours
- Testing: 1-2 hours
- **Total:** 5-7 hours

---

Would you like me to:
1. Complete all remaining frontend components now?
2. Create a specific component (which one)?
3. Move to a different feature?
4. Something else?

Let me know! 🚀

