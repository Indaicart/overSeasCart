# 🔄 Backend Switching Guide - Node.js ↔ Spring Boot

## 📋 **Table of Contents**
1. [Current Status](#current-status)
2. [Architecture Overview](#architecture-overview)
3. [Switching Prerequisites](#switching-prerequisites)
4. [How to Switch Backends](#how-to-switch-backends)
5. [Spring Boot Completion Checklist](#spring-boot-completion-checklist)
6. [Step-by-Step Migration Plan](#step-by-step-migration-plan)
7. [API Endpoint Mapping](#api-endpoint-mapping)
8. [Testing Guide](#testing-guide)

---

## 📊 **Current Status**

### **Backend Implementations:**

| Feature | Node.js Backend | Spring Boot Backend |
|---------|----------------|---------------------|
| **Status** | ✅ 100% Complete | ⚠️ ~20% Complete |
| **Production Ready** | ✅ Yes | ❌ No |
| **Lines of Code** | ~10,000+ | ~2,000 |
| **API Endpoints** | 100+ | 2 |
| **Database Migrations** | 39 | 0 |

### **What's Complete:**

#### **Node.js Backend (100%):** ✅
- ✅ All authentication & authorization
- ✅ All CRUD operations (Students, Teachers, Classes, etc.)
- ✅ Attendance & Grades management
- ✅ Fee management with payment gateway
- ✅ **HR & Payroll system (complete)**
- ✅ **Leave management system (complete)**
- ✅ **Razorpay payment integration**
- ✅ Surveys & Quizzes
- ✅ Bulk operations (CSV import/export)
- ✅ Reports & Analytics
- ✅ Activity logs
- ✅ Password reset
- ✅ Session management
- ✅ All 100+ endpoints

#### **Spring Boot Backend (~20%):** ⚠️
- ✅ Basic project structure
- ✅ JWT authentication (basic)
- ✅ 10 entity models
- ✅ Basic repositories
- ✅ Health check endpoint
- ❌ Only 2 controllers implemented
- ❌ Missing 95% of business logic
- ❌ No payment integration
- ❌ No payroll system
- ❌ No leave management
- ❌ No reports
- ❌ No bulk operations

---

## 🏗️ **Architecture Overview**

### **Current Setup:**

```
┌─────────────────────────────────────┐
│        React Frontend               │
│     (Port 3000)                     │
│                                     │
│  Hardcoded API URLs:                │
│  http://localhost:5000/api/*        │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│     Node.js/Express Backend ✅      │
│     (Port 5000)                     │
│                                     │
│  - 100+ API Endpoints               │
│  - Complete Features                │
│  - Production Ready                 │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│      PostgreSQL Database            │
│      (Port 5432)                    │
│                                     │
│  - 39 Migrations                    │
│  - 35+ Tables                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│    Spring Boot Backend ⚠️           │
│    (Port 8080)                      │
│                                     │
│  - Basic Structure Only             │
│  - 2 Controllers                    │
│  - NOT Production Ready             │
└─────────────────────────────────────┘
```

### **Target Setup (After Environment Variables):**

```
┌─────────────────────────────────────┐
│        React Frontend               │
│     (Port 3000)                     │
│                                     │
│  Environment Variable:              │
│  REACT_APP_API_URL (configurable)   │
└─────────────┬───────────────────────┘
              │
              ▼
        ┌─────────┐
        │  .env   │ ← ONE LINE TO CHANGE!
        └─────────┘
              │
         ┌────┴────┐
         ▼         ▼
    ┌────────┐  ┌────────────┐
    │Node.js │  │Spring Boot │
    │ :5000  │  │   :8080    │
    └────┬───┘  └─────┬──────┘
         │            │
         └─────┬──────┘
               ▼
    ┌─────────────────┐
    │   PostgreSQL    │
    └─────────────────┘
```

---

## ✅ **Switching Prerequisites**

Before you can switch between backends, ensure:

### **1. Frontend Environment Variables Setup:**
- [ ] Update all API calls to use environment variables
- [ ] Create `.env` configuration files
- [ ] Test with both backend URLs

### **2. Spring Boot Backend Completion:**
- [ ] Implement all 100+ API endpoints
- [ ] Add all business logic
- [ ] Integrate payment gateway
- [ ] Implement payroll system
- [ ] Implement leave management
- [ ] Add all security features
- [ ] Create database migrations
- [ ] Complete testing

### **3. Database Compatibility:**
- [ ] Both backends use same PostgreSQL database
- [ ] Same schema (39 migrations)
- [ ] Same table structures
- [ ] Same data types

---

## 🔄 **How to Switch Backends**

### **Prerequisites:**
1. Frontend must use environment variables (needs setup)
2. Spring Boot backend must be complete (currently NOT)
3. Both backends must be running

### **Step 1: Configure Environment Variables**

#### **For Node.js Backend:**
Create/edit `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

#### **For Spring Boot Backend:**
Create/edit `client/.env`:
```env
REACT_APP_API_URL=http://localhost:8080
```

### **Step 2: Restart Frontend**
```bash
cd client
npm start
```

### **Step 3: Start Appropriate Backend**

#### **Option A: Node.js Backend**
```bash
cd server
npm start
# Running on http://localhost:5000
```

#### **Option B: Spring Boot Backend**
```bash
cd spring-backend
./mvnw spring-boot:run
# Running on http://localhost:8080
```

---

## 📋 **Spring Boot Completion Checklist**

To make Spring Boot backend production-ready, implement:

### **Phase 1: Core Features (Priority: Critical)**

#### **Authentication & Authorization:**
- [ ] Register endpoint with validation
- [ ] Login with JWT generation
- [ ] Password reset flow (3-step)
- [ ] Session management
- [ ] Role-based access control
- [ ] Token refresh mechanism

#### **Student Management:**
- [ ] Create student
- [ ] Get all students (with filters)
- [ ] Get student by ID
- [ ] Update student
- [ ] Delete student
- [ ] Student profile upload
- [ ] Bulk import (CSV)

#### **Teacher Management:**
- [ ] Create teacher
- [ ] Get all teachers
- [ ] Get teacher by ID
- [ ] Update teacher
- [ ] Delete teacher
- [ ] Assign to classes
- [ ] Assign to subjects

#### **Class & Subject Management:**
- [ ] CRUD for classes
- [ ] CRUD for subjects
- [ ] Class-subject mapping
- [ ] Teacher assignments

#### **Attendance Management:**
- [ ] Mark attendance (class-wise)
- [ ] Mark attendance (subject-wise)
- [ ] Get attendance by date
- [ ] Get attendance by student
- [ ] Attendance reports
- [ ] Bulk attendance import
- [ ] Import from class teacher

#### **Grade Management:**
- [ ] Add grades
- [ ] Update grades
- [ ] Get grades by student
- [ ] Get grades by class
- [ ] Grade reports
- [ ] Bulk grade import

#### **Fee Management:**
- [ ] Configure fee structure
- [ ] Record payments (offline)
- [ ] Record payments (online)
- [ ] Payment history
- [ ] Fee receipts
- [ ] Outstanding fees report

### **Phase 2: Advanced Features (Priority: High)**

#### **Payment Gateway Integration:**
- [ ] Razorpay configuration
- [ ] Create order endpoint
- [ ] Verify payment endpoint
- [ ] Webhook handling
- [ ] Payment history
- [ ] Receipt generation

#### **HR & Payroll System:**
- [ ] Salary structure configuration
- [ ] Staff salary CRUD
- [ ] Process offline payment
- [ ] Process online payment (Razorpay)
- [ ] Salary slip generation
- [ ] Payment history
- [ ] Pending payments list

#### **Leave Management System:**
- [ ] Leave type configuration
- [ ] Leave balance initialization
- [ ] Leave application submission
- [ ] Approve/reject leaves
- [ ] Leave calendar
- [ ] Leave history
- [ ] **Calculate unpaid leave days**
- [ ] **Auto-deduct from salary**

#### **Reports & Analytics:**
- [ ] Student dashboard
- [ ] Parent dashboard
- [ ] Teacher dashboards
- [ ] Admin dashboard
- [ ] Attendance reports
- [ ] Grade reports
- [ ] Fee reports
- [ ] Enrollment analytics

### **Phase 3: Additional Features (Priority: Medium)**

#### **Surveys & Quizzes:**
- [ ] Create survey/quiz
- [ ] Submit responses
- [ ] Auto grading
- [ ] Manual grading
- [ ] Results & analytics
- [ ] Response visualization

#### **Bulk Operations:**
- [ ] CSV import (students)
- [ ] CSV import (teachers)
- [ ] CSV import (grades)
- [ ] CSV import (attendance)
- [ ] CSV export (reports)
- [ ] Template download
- [ ] Validation & error handling

#### **Parent Portal:**
- [ ] Get my children
- [ ] Get child grades
- [ ] Get child attendance
- [ ] Get child fees
- [ ] Multi-child management

#### **Activity Logs:**
- [ ] Log all actions
- [ ] Get activity logs
- [ ] Filter by user/date/action
- [ ] Admin dashboard

---

## 📝 **Step-by-Step Migration Plan**

### **Phase 1: Environment Variables Setup (30 minutes)**

#### **Step 1.1: Create API Configuration**
Create `client/src/config/api.js`:
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  
  // Students
  STUDENTS: '/api/students',
  
  // Teachers
  TEACHERS: '/api/teachers',
  
  // Leaves
  LEAVES: '/api/leaves',
  
  // Payroll
  PAYROLL: '/api/payroll',
  
  // ... all other endpoints
};
```

#### **Step 1.2: Create API Helper**
Create `client/src/utils/api.js`:
```javascript
import { API_BASE_URL } from '../config/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  };
  
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    { ...defaultOptions, ...options }
  );
  
  return response.json();
};
```

#### **Step 1.3: Update All Components**
Replace all hardcoded URLs:
```javascript
// Before:
fetch('http://localhost:5000/api/leaves/types')

// After:
import { apiCall } from '../utils/api';
apiCall('/api/leaves/types')
```

#### **Step 1.4: Create Environment Files**
```bash
# client/.env.development
REACT_APP_API_URL=http://localhost:5000

# client/.env.production
REACT_APP_API_URL=https://api.yourschool.com
```

### **Phase 2: Spring Boot Backend Development (100+ hours)**

#### **Week 1-2: Core Setup**
- [ ] Set up project structure
- [ ] Configure database connection
- [ ] Create all entity models
- [ ] Create all repositories
- [ ] Set up security configuration

#### **Week 3-4: Authentication & Basic CRUD**
- [ ] Implement authentication
- [ ] Student management APIs
- [ ] Teacher management APIs
- [ ] Class & subject APIs

#### **Week 5-6: Academic Features**
- [ ] Attendance management
- [ ] Grade management
- [ ] Fee management
- [ ] Timetable management

#### **Week 7-8: Payment Integration**
- [ ] Razorpay integration
- [ ] Payment processing
- [ ] Receipt generation

#### **Week 9-10: HR & Payroll**
- [ ] Salary configuration
- [ ] Payment processing
- [ ] Salary slip generation
- [ ] Payment history

#### **Week 11-12: Leave Management**
- [ ] Leave type configuration
- [ ] Leave application
- [ ] Approval workflow
- [ ] Leave calendar
- [ ] **Unpaid leave salary deduction**

#### **Week 13-14: Reports & Additional Features**
- [ ] All dashboards
- [ ] Reports & analytics
- [ ] Bulk operations
- [ ] Surveys & quizzes

#### **Week 15: Testing & Bug Fixes**
- [ ] Unit tests
- [ ] Integration tests
- [ ] End-to-end tests
- [ ] Bug fixes

### **Phase 3: Switching & Testing (1 week)**

#### **Step 3.1: Parallel Running**
Run both backends simultaneously:
```bash
# Terminal 1: Node.js
cd server && npm start

# Terminal 2: Spring Boot
cd spring-backend && ./mvnw spring-boot:run

# Terminal 3: Frontend
cd client && npm start
```

#### **Step 3.2: Switch to Spring Boot**
```bash
# Edit client/.env
REACT_APP_API_URL=http://localhost:8080
```

#### **Step 3.3: Test All Features**
- [ ] Login & authentication
- [ ] All CRUD operations
- [ ] Payment processing
- [ ] Payroll operations
- [ ] Leave management
- [ ] Reports generation

#### **Step 3.4: Performance Testing**
- [ ] Load testing
- [ ] Response time comparison
- [ ] Memory usage
- [ ] Database queries optimization

---

## 🗺️ **API Endpoint Mapping**

### **Authentication:**
| Endpoint | Method | Node.js | Spring Boot |
|----------|--------|---------|-------------|
| Login | POST | ✅ `/api/auth/login` | ⚠️ Partially |
| Register | POST | ✅ `/api/auth/register` | ❌ Missing |
| Reset Password | POST | ✅ `/api/password-reset/*` | ❌ Missing |

### **Student Management:**
| Endpoint | Method | Node.js | Spring Boot |
|----------|--------|---------|-------------|
| Get all | GET | ✅ `/api/students` | ❌ Missing |
| Get by ID | GET | ✅ `/api/students/:id` | ❌ Missing |
| Create | POST | ✅ `/api/students` | ❌ Missing |
| Update | PUT | ✅ `/api/students/:id` | ❌ Missing |
| Delete | DELETE | ✅ `/api/students/:id` | ❌ Missing |

### **Payroll System:**
| Endpoint | Method | Node.js | Spring Boot |
|----------|--------|---------|-------------|
| Configure salary | POST | ✅ `/api/payroll/salary-config` | ❌ Missing |
| Process offline | POST | ✅ `/api/payroll/process-offline-payment` | ❌ Missing |
| Process online | POST | ✅ `/api/payroll/initiate-online-payment` | ❌ Missing |
| Get salary slip | GET | ✅ `/api/payroll/salary-slip/:id` | ❌ Missing |
| Payment history | GET | ✅ `/api/payroll/payment-history/:id` | ❌ Missing |

### **Leave Management:**
| Endpoint | Method | Node.js | Spring Boot |
|----------|--------|---------|-------------|
| Get leave types | GET | ✅ `/api/leaves/types` | ❌ Missing |
| Apply leave | POST | ✅ `/api/leaves/applications` | ❌ Missing |
| Approve/Reject | PUT | ✅ `/api/leaves/applications/:id/approve` | ❌ Missing |
| Get balance | GET | ✅ `/api/leaves/balance` | ❌ Missing |
| Leave calendar | GET | ✅ `/api/leaves/calendar` | ❌ Missing |
| **Unpaid days** | GET | ✅ `/api/leaves/unpaid-days/:id` | ❌ Missing |

### **Payment Gateway:**
| Endpoint | Method | Node.js | Spring Boot |
|----------|--------|---------|-------------|
| Create order | POST | ✅ `/api/payments/create-order` | ❌ Missing |
| Verify payment | POST | ✅ `/api/payments/verify` | ❌ Missing |
| Webhook | POST | ✅ `/api/payments/webhook` | ❌ Missing |
| Payment history | GET | ✅ `/api/payments/history` | ❌ Missing |

**Total Endpoints to Implement: 100+**

---

## 🧪 **Testing Guide**

### **Testing Checklist After Switching:**

#### **Phase 1: Basic Functionality**
- [ ] User can login
- [ ] User can logout
- [ ] Token authentication works
- [ ] Role-based access works

#### **Phase 2: CRUD Operations**
- [ ] Create student works
- [ ] Update student works
- [ ] Delete student works
- [ ] Same for teachers
- [ ] Same for classes
- [ ] Same for subjects

#### **Phase 3: Academic Features**
- [ ] Mark attendance works
- [ ] Enter grades works
- [ ] Record fees works
- [ ] Generate reports works

#### **Phase 4: Critical Features**
- [ ] **Payment gateway works**
- [ ] **Payroll processing works**
- [ ] **Leave application works**
- [ ] **Leave approval works**
- [ ] **Unpaid leave salary deduction works** ⭐

#### **Phase 5: Advanced Features**
- [ ] Bulk import works
- [ ] Bulk export works
- [ ] Surveys work
- [ ] Analytics work
- [ ] Activity logs work

---

## 🎯 **Recommendation**

### **Current State:**
- ✅ **Node.js backend is 100% complete and production-ready**
- ⚠️ **Spring Boot backend is only 20% complete**

### **Best Approach:**

#### **Option 1: Stay with Node.js** ✅ (Recommended for now)
**Pros:**
- ✅ Already complete
- ✅ Production-ready
- ✅ All features working
- ✅ Can launch immediately

**Cons:**
- ❌ Not using Spring Boot (if that's a requirement)

#### **Option 2: Complete Spring Boot First** 🔧
**Effort:** ~100 hours (2-3 months part-time)

**Steps:**
1. Complete all 100+ endpoints
2. Implement all business logic
3. Add payment integration
4. Add payroll & leave management
5. Test thoroughly
6. Then setup environment variables for switching

#### **Option 3: Hybrid Approach** 🔄 (Recommended long-term)
**Phase 1 (Now):**
- Use Node.js for production
- Setup environment variables
- Deploy and launch

**Phase 2 (Later):**
- Gradually complete Spring Boot
- Test in parallel
- Switch when ready

---

## 📊 **Effort Estimation**

| Task | Estimated Time |
|------|----------------|
| **Setup environment variables** | 0.5 hours |
| **Update all API calls** | 2-4 hours |
| **Test switching** | 1 hour |
| **Complete Spring Boot backend** | 100-150 hours |
| **Total for full switching capability** | **103-155 hours** |

---

## 🚀 **Quick Start: Enable Switching**

### **Minimal Setup (0.5 hours):**

1. **Create API config:**
   ```bash
   cd client/src
   mkdir config
   touch config/api.js
   ```

2. **Add to `.env`:**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

3. **Update imports:**
   Use centralized API calls instead of hardcoded URLs

4. **Test both backends:**
   ```bash
   # Node.js
   REACT_APP_API_URL=http://localhost:5000 npm start
   
   # Spring Boot (when ready)
   REACT_APP_API_URL=http://localhost:8080 npm start
   ```

---

## 📝 **Summary**

### **Current Answer:**
**Can you switch between backends with one line change?**
- ❌ **NO** - Currently not set up (URLs hardcoded)
- ⚠️ **Spring Boot backend is incomplete** (only 20% done)

### **After Setup:**
**Can you switch between backends with one line change?**
- ✅ **YES** - After environment variables setup (0.5 hours)
- ⚠️ **But Spring Boot must be complete first** (100 hours)

### **Timeline:**
```
Now                    → Use Node.js (production-ready)
+0.5 hours            → Environment variables ready
+100 hours            → Spring Boot complete
= Can switch anytime with ONE line change!
```

---

## 📞 **Need Help?**

For switching between backends:
1. First, complete Spring Boot backend (100 hours)
2. Then, setup environment variables (0.5 hours)
3. Test thoroughly
4. Switch with confidence!

**Current recommendation: Stick with Node.js, it's production-ready!** ✅

---

**Last Updated:** [Current Date]  
**Status:** Node.js ✅ Complete | Spring Boot ⚠️ 20% Complete  
**Switching Ready:** ❌ Not Yet (Needs Spring Boot completion)

