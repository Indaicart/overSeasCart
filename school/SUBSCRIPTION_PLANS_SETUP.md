# Subscription Plans Setup Guide

## 📋 Overview

Yes! I've now added **real subscription plans** stored in the database. Previously, they were hardcoded in the API. Now you have:

✅ **Database table** for subscription plans
✅ **Seed data** with 4 pre-configured plans
✅ **Updated API** to fetch from database
✅ **Easy management** - update plans in database

---

## 🎯 Subscription Plans Included

### 1. **Basic Plan** 💚
**Price:** $99/month or $950/year (save ~20%)

**Capacity:**
- 200 Students
- 20 Teachers
- 10GB Storage

**Features:**
- Student Management
- Teacher Management
- Class & Subject Management
- Attendance Tracking
- Grade Management
- Basic Reports
- Parent Portal Access
- Email Notifications
- Document Storage (10GB)
- Email Support

**Best For:** Small schools and educational centers

---

### 2. **Standard Plan** 💙 (Most Popular)
**Price:** $299/month or $2,400/year (save ~33%)

**Capacity:**
- 500 Students
- 50 Teachers
- 50GB Storage

**Features:**
- Everything in Basic
- Advanced Analytics & Reports
- Fee Management & Billing
- Timetable Management
- Exam & Assessment Tools
- Parent-Teacher Communication
- SMS Notifications
- Document Storage (50GB)
- Priority Email Support
- Mobile App Access

**Best For:** Growing schools with expanding needs

---

### 3. **Premium Plan** 💜
**Price:** $599/month or $4,800/year (save ~33%)

**Capacity:**
- 1,000 Students
- 100 Teachers
- 200GB Storage

**Features:**
- Everything in Standard
- Custom Branding & Logo
- API Access for Integrations
- Multi-Campus Support
- Advanced Role Management
- Custom Reports Builder
- Library Management
- Transport Management
- Hostel Management
- Document Storage (200GB)
- Phone Support
- Dedicated Account Manager

**Best For:** Established schools seeking comprehensive solutions

---

### 4. **Enterprise Plan** 🌟
**Price:** $999/month or $8,000/year (save ~33%)

**Capacity:**
- **Unlimited Students**
- **Unlimited Teachers**
- 1TB Storage

**Features:**
- Everything in Premium
- Unlimited Students & Teachers
- Unlimited Storage (1TB+)
- Custom Feature Development
- White-Label Solution
- Advanced Security & Compliance
- SSO Integration
- Custom Integrations
- Dedicated Server Option
- On-Premise Deployment
- 24/7 Priority Support
- Dedicated Technical Team
- Quarterly Business Reviews
- Training & Onboarding

**Best For:** Large institutions with unlimited requirements

---

## 🚀 Setup Instructions

### Step 1: Run the Migration

This creates the `subscription_plans` table:

```bash
cd server
npm run migrate
```

Expected output:
```
Batch 25 run: 1 migration
025_create_subscription_plans_table.js
```

### Step 2: Seed the Plans

This populates the table with the 4 plans:

```bash
npm run seed
```

Expected output:
```
Ran 4 seed files
004_seed_subscription_plans.js
✅ Subscription plans seeded successfully!
```

### Step 3: Verify in Database

Check that plans were created:

```sql
SELECT name, monthly_price, annual_price, max_students, max_teachers 
FROM subscription_plans 
ORDER BY display_order;
```

Expected result:
```
name        | monthly_price | annual_price | max_students | max_teachers
------------|---------------|--------------|--------------|-------------
Basic       | 99.00         | 950.00       | 200          | 20
Standard    | 299.00        | 2400.00      | 500          | 50
Premium     | 599.00        | 4800.00      | 1000         | 100
Enterprise  | 999.00        | 8000.00      | 999999       | 999999
```

### Step 4: Test the API

Fetch plans from the API:

```bash
curl http://localhost:5000/api/subscriptions/plans
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "Basic",
      "description": "Perfect for small schools and educational centers",
      "monthly_price": 99,
      "annual_price": 950,
      "max_students": 200,
      "max_teachers": 20,
      "storage_gb": 10,
      "features": "[\"Student Management\", ...]"
    },
    ...
  ]
}
```

---

## 🎨 How It Works

### 1. **School Registration Page Fetches Plans**

When a school visits `/school-registration`:
1. Page loads
2. Fetches plans from `GET /api/subscriptions/plans`
3. Displays all active plans in card format
4. School selects their preferred plan
5. Proceeds to payment

### 2. **Plan Selection**

Schools see:
- Plan name and description
- Monthly and annual pricing
- Capacity limits (students, teachers, storage)
- Complete feature list
- Visual comparison cards

### 3. **Payment Processing**

When school completes registration:
1. Selected plan is passed to registration API
2. Plan details fetched from database
3. Subscription created with plan pricing
4. Payment recorded
5. School activated

---

## 🔧 Managing Plans

### View All Plans

```sql
SELECT * FROM subscription_plans ORDER BY display_order;
```

### Update Plan Pricing

```sql
UPDATE subscription_plans 
SET monthly_price = 149.00, annual_price = 1200.00
WHERE name = 'Basic';
```

### Add New Features to a Plan

```sql
UPDATE subscription_plans 
SET features = '[
  "Student Management",
  "Teacher Management",
  "NEW FEATURE HERE",
  ...
]'
WHERE name = 'Standard';
```

### Change Capacity Limits

```sql
UPDATE subscription_plans 
SET max_students = 300, max_teachers = 30
WHERE name = 'Basic';
```

### Deactivate a Plan

```sql
UPDATE subscription_plans 
SET is_active = false
WHERE name = 'Enterprise';
```

### Create New Plan

```sql
INSERT INTO subscription_plans (
  name, description, monthly_price, annual_price,
  max_students, max_teachers, storage_gb, features,
  is_active, display_order
) VALUES (
  'Starter',
  'Perfect for very small schools',
  49.00,
  470.00,
  50,
  5,
  5,
  '["Basic Features", "Email Support"]',
  true,
  0
);
```

---

## 📊 Database Schema

### `subscription_plans` Table

```sql
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2) NOT NULL,
  max_students INTEGER NOT NULL,
  max_teachers INTEGER NOT NULL,
  storage_gb INTEGER NOT NULL,
  has_advanced_analytics BOOLEAN DEFAULT FALSE,
  has_custom_branding BOOLEAN DEFAULT FALSE,
  has_api_access BOOLEAN DEFAULT FALSE,
  has_priority_support BOOLEAN DEFAULT FALSE,
  features JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🎯 Benefits of Database Plans

### Before (Hardcoded):
❌ Plans locked in code
❌ Changing prices requires code update
❌ Can't add/remove plans easily
❌ No ability to deactivate plans
❌ No plan history tracking

### Now (Database):
✅ Plans stored in database
✅ Update prices with SQL
✅ Add/remove plans anytime
✅ Activate/deactivate plans
✅ Track plan changes
✅ Easy to manage via admin panel (future)

---

## 🔄 Integration Points

### 1. Registration Page
```javascript
// Fetches plans from database
const response = await fetch('http://localhost:5000/api/subscriptions/plans');
const data = await response.json();
setPlans(data.data);
```

### 2. Registration API
```javascript
// Looks up plan by name
const plan = await db('subscription_plans')
  .where({ name: subscription.plan_name })
  .first();

// Uses plan pricing for subscription
const amount = subscription.billing_cycle === 'annual' 
  ? plan.annual_price 
  : plan.monthly_price;
```

---

## 🧪 Testing

### Test Plan Fetching

1. **Start server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Visit registration page:**
   ```
   http://localhost:3000/school-registration
   ```

3. **Verify plans appear:**
   - Should see 4 plan cards
   - Toggle monthly/annual billing
   - Prices should update

### Test Plan Selection

1. Select a plan (card highlights)
2. Click "Next"
3. Enter payment details
4. Complete registration
5. Verify subscription created with correct plan

---

## 📈 Future Enhancements

### Admin Dashboard for Plan Management
Create an admin interface to:
- [ ] View all plans
- [ ] Create new plans
- [ ] Edit existing plans
- [ ] Change pricing
- [ ] Activate/deactivate plans
- [ ] Track plan popularity
- [ ] View plan revenue

### Dynamic Features
- [ ] Add custom feature flags
- [ ] Per-feature pricing
- [ ] Add-on features
- [ ] Plan upgrades/downgrades
- [ ] Promo pricing

### Analytics
- [ ] Most popular plans
- [ ] Revenue by plan
- [ ] Churn by plan
- [ ] Conversion rates

---

## ✅ Summary

**Yes, subscription models are now added!** 🎉

You have:
1. ✅ **4 Pre-configured Plans** - Basic, Standard, Premium, Enterprise
2. ✅ **Database Storage** - Easy to manage and update
3. ✅ **API Integration** - Registration page fetches real plans
4. ✅ **Flexible Pricing** - Monthly and annual options
5. ✅ **Clear Features** - Each plan has detailed feature list
6. ✅ **Capacity Limits** - Students, teachers, storage defined
7. ✅ **Active Management** - Enable/disable plans as needed

**To use:**
```bash
npm run migrate  # Create table
npm run seed     # Add plans
npm run dev      # Start server
```

Then visit `/school-registration` to see the plans in action!

---

**Created:** September 29, 2025  
**Version:** 1.0.0  
**Status:** ✅ Ready to Use
