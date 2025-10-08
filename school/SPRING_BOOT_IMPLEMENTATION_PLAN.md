# 🚀 Spring Boot Backend - Implementation Plan

## 📋 **Implementation Status**

**Started:** [Current Date]  
**Estimated Completion:** 80-100 hours  
**Current Progress:** Phase 1 - In Progress

---

## 🎯 **Implementation Phases**

### ✅ **Phase 0: Dependencies Setup (COMPLETE)**
- [x] Updated pom.xml with all required dependencies
- [x] Added Flyway for migrations
- [x] Added CSV utilities (Apache Commons CSV)
- [x] Added PDF generation (iText)
- [x] Added Razorpay SDK
- [x] Added ModelMapper for DTOs

### 🔧 **Phase 1: Foundation & Configuration (In Progress)**
**Estimated Time:** 15-20 hours

#### **1.1 Database Migrations** ⏱️
- [ ] Setup Flyway configuration
- [ ] Port all 39 Knex migrations to Flyway SQL
- [ ] Test migrations

#### **1.2 Base Configuration** ⏱️
- [ ] Application properties (dev, prod profiles)
- [ ] CORS configuration
- [ ] Exception handling (@ControllerAdvice)
- [ ] Response wrapper
- [ ] ModelMapper bean

#### **1.3 Security Enhancement** ⏱️
- [ ] Complete JWT implementation
- [ ] Role-based security (@PreAuthorize)
- [ ] Password reset endpoints
- [ ] Session management
- [ ] Token refresh

#### **1.4 Base Infrastructure** ⏱️
- [ ] Pagination support
- [ ] Filtering & sorting utilities
- [ ] File upload service
- [ ] Date/time utilities
- [ ] Validation helpers

---

### 📚 **Phase 2: Student Management**
**Estimated Time:** 4-5 hours

- [ ] Student entity (complete with all fields)
- [ ] StudentRepository with custom queries
- [ ] StudentService (business logic)
- [ ] StudentController (REST endpoints)
- [ ] Student DTOs (Request/Response)
- [ ] Student portal endpoints
- [ ] Photo upload
- [ ] Search & filter

**Endpoints to Implement:**
```
GET    /api/students - Get all students
GET    /api/students/:id - Get student by ID
POST   /api/students - Create student
PUT    /api/students/:id - Update student
DELETE /api/students/:id - Delete student
GET    /api/students/search - Search students
POST   /api/students/bulk - Bulk import
```

---

### 👨‍🏫 **Phase 3: Teacher Management**
**Estimated Time:** 4-5 hours

- [ ] Teacher entity enhancements
- [ ] TeacherRepository with queries
- [ ] TeacherService
- [ ] TeacherController
- [ ] Teacher DTOs
- [ ] Class teacher assignment
- [ ] Subject teacher assignment
- [ ] Dual role handling

**Endpoints:**
```
GET    /api/teachers - Get all teachers
GET    /api/teachers/:id - Get teacher by ID
POST   /api/teachers - Create teacher
PUT    /api/teachers/:id - Update teacher
DELETE /api/teachers/:id - Delete teacher
GET    /api/teachers/class/:classId - Get class teacher
GET    /api/teachers/subject/:subjectId - Get subject teachers
```

---

### 📚 **Phase 4: Class & Subject Management**
**Estimated Time:** 3-4 hours

- [ ] Class entity complete
- [ ] Subject entity complete
- [ ] ClassSubject entity (junction)
- [ ] Repositories
- [ ] Services
- [ ] Controllers
- [ ] Student enrollment
- [ ] Teacher assignment

---

### 📅 **Phase 5: Attendance Management**
**Estimated Time:** 5-6 hours

- [ ] Attendance entity
- [ ] Mark class attendance
- [ ] Mark subject attendance
- [ ] Attendance reports
- [ ] Bulk import
- [ ] Import from class teacher
- [ ] Attendance analytics

---

### 📊 **Phase 6: Grade Management**
**Estimated Time:** 4-5 hours

- [ ] Grade entity
- [ ] Add/update grades
- [ ] Grade reports
- [ ] Grade by class/student
- [ ] Bulk import
- [ ] Grade analytics

---

### 💰 **Phase 7: Fee Management**
**Estimated Time:** 5-6 hours

- [ ] Fee entity
- [ ] FeePayment entity
- [ ] Fee structure config
- [ ] Record offline payments
- [ ] Payment history
- [ ] Fee receipts
- [ ] Outstanding fees

---

### 💳 **Phase 8: Payment Gateway (Razorpay)**
**Estimated Time:** 6-8 hours

- [ ] Razorpay configuration
- [ ] Create order endpoint
- [ ] Verify payment endpoint
- [ ] Webhook handling
- [ ] Payment status tracking
- [ ] Receipt generation
- [ ] Integration testing

**Endpoints:**
```
POST   /api/payments/create-order - Create Razorpay order
POST   /api/payments/verify - Verify payment
POST   /api/payments/webhook - Handle webhook
GET    /api/payments/history/:userId - Payment history
GET    /api/payments/receipt/:id - Get receipt
```

---

### 💼 **Phase 9: Payroll System** ⭐
**Estimated Time:** 9-11 hours

- [ ] StaffSalary entity
- [ ] SalaryPayment entity
- [ ] Salary configuration CRUD
- [ ] Process offline payment
- [ ] Process online payment (Razorpay)
- [ ] Salary calculations (pro-rata, bonus, penalty)
- [ ] Salary slip generation (PDF)
- [ ] Payment history
- [ ] Pending payments
- [ ] Bank account management

**Endpoints:**
```
POST   /api/payroll/salary-config - Configure salary
GET    /api/payroll/salary-config/:teacherId - Get config
GET    /api/payroll/staff-list - Get all staff with salary info
POST   /api/payroll/process-offline-payment - Process cash payment
POST   /api/payroll/initiate-online-payment - Start Razorpay payment
POST   /api/payroll/complete-online-payment - Complete Razorpay
GET    /api/payroll/payment-history/:teacherId - Payment history
GET    /api/payroll/salary-slip/:id - Get salary slip
GET    /api/payroll/pending-payments - Pending list
```

---

### 🏖️ **Phase 10: Leave Management System** ⭐⭐⭐
**Estimated Time:** 8-10 hours

**Most Complex Feature - Requires:**
- Leave balance tracking
- Approval workflow
- Integration with payroll
- Auto salary deduction

#### **Entities:**
- [ ] LeaveType
- [ ] LeaveBalance
- [ ] LeaveApplication

#### **Features:**
- [ ] Leave type configuration
- [ ] Initialize leave balances
- [ ] Submit leave application
- [ ] Approve/reject workflow
- [ ] Balance tracking (allocated/used/pending/available)
- [ ] Leave calendar
- [ ] Leave history
- [ ] Overlap detection
- [ ] **Calculate unpaid leave days** ⭐
- [ ] **Auto-deduct from salary** ⭐

#### **Services:**
- [ ] LeaveTypeService
- [ ] LeaveBalanceService
- [ ] LeaveApplicationService
- [ ] LeaveHelper (utility methods)
- [ ] **LeavePayrollIntegrationService** ⭐

**Endpoints:**
```
GET    /api/leaves/types - Get leave types
POST   /api/leaves/types - Create leave type
GET    /api/leaves/balance - Get my balance
GET    /api/leaves/balance/:teacherId - Get staff balance
POST   /api/leaves/balance/initialize - Initialize balances
GET    /api/leaves/applications - Get my applications
GET    /api/leaves/applications/all - Get all (admin)
POST   /api/leaves/applications - Submit application
PUT    /api/leaves/applications/:id/approve - Approve
PUT    /api/leaves/applications/:id/reject - Reject
PUT    /api/leaves/applications/:id/cancel - Cancel
GET    /api/leaves/calendar - Leave calendar
GET    /api/leaves/unpaid-days/:teacherId - Calculate unpaid days
```

---

### 📊 **Phase 11: Reports & Analytics**
**Estimated Time:** 4-5 hours

- [ ] Student dashboard API
- [ ] Parent dashboard API
- [ ] Class teacher dashboard API
- [ ] Subject teacher dashboard API
- [ ] Admin dashboard API
- [ ] Attendance reports
- [ ] Grade reports
- [ ] Fee reports
- [ ] Enrollment analytics

**Endpoints:**
```
GET    /api/reports/student-dashboard - Student stats
GET    /api/reports/parent-dashboard/:parentId - Parent stats
GET    /api/reports/class-teacher-dashboard/:classId - Class teacher
GET    /api/reports/subject-teacher-dashboard/:subjectId - Subject teacher
GET    /api/reports/admin-dashboard - Admin overview
GET    /api/reports/attendance - Attendance reports
GET    /api/reports/grades - Grade reports
GET    /api/reports/fees - Fee reports
```

---

### 📤 **Phase 12: Bulk Operations**
**Estimated Time:** 3-4 hours

- [ ] CSV import service
- [ ] CSV export service
- [ ] Validation logic
- [ ] Error handling
- [ ] Template generation

**Endpoints:**
```
POST   /api/bulk/import/students - Import students CSV
POST   /api/bulk/import/teachers - Import teachers CSV
POST   /api/bulk/import/grades - Import grades CSV
POST   /api/bulk/import/attendance - Import attendance CSV
GET    /api/bulk/export/students - Export students
GET    /api/bulk/export/reports - Export reports
GET    /api/bulk/template/:type - Download CSV template
```

---

### 📝 **Phase 13: Surveys & Quizzes**
**Estimated Time:** 3-4 hours

- [ ] Survey entity
- [ ] SurveyQuestion entity
- [ ] SurveyResponse entity
- [ ] Create survey/quiz
- [ ] Submit responses
- [ ] Auto grading logic
- [ ] Manual grading
- [ ] Results & analytics

---

### 👨‍👩‍👧 **Phase 14: Parent Portal**
**Estimated Time:** 2-3 hours

- [ ] Parent entity enhancements
- [ ] StudentParent relationship
- [ ] Get my children
- [ ] Get child grades
- [ ] Get child attendance
- [ ] Get child fees
- [ ] Multi-child management

---

### 📋 **Phase 15: Additional Features**
**Estimated Time:** 3-4 hours

- [ ] Activity logs
- [ ] Notifications
- [ ] Internal admin management
- [ ] School showcase
- [ ] Document management
- [ ] Timetable management

---

## 🧪 **Phase 16: Testing & Polish**
**Estimated Time:** 5-10 hours

- [ ] Unit tests for services
- [ ] Integration tests
- [ ] End-to-end tests
- [ ] Performance testing
- [ ] Bug fixes
- [ ] Code optimization
- [ ] Documentation

---

## 📊 **Progress Tracking**

| Phase | Status | Progress | Time Spent | Est. Remaining |
|-------|--------|----------|------------|----------------|
| Phase 0: Dependencies | ✅ Complete | 100% | 0.5h | 0h |
| Phase 1: Foundation | 🔧 In Progress | 10% | 1h | 14h |
| Phase 2: Students | ⏳ Pending | 0% | 0h | 5h |
| Phase 3: Teachers | ⏳ Pending | 0% | 0h | 5h |
| Phase 4: Classes | ⏳ Pending | 0% | 0h | 4h |
| Phase 5: Attendance | ⏳ Pending | 0% | 0h | 6h |
| Phase 6: Grades | ⏳ Pending | 0% | 0h | 5h |
| Phase 7: Fees | ⏳ Pending | 0% | 0h | 6h |
| Phase 8: Payments | ⏳ Pending | 0% | 0h | 8h |
| Phase 9: Payroll | ⏳ Pending | 0% | 0h | 11h |
| Phase 10: Leaves | ⏳ Pending | 0% | 0h | 10h |
| Phase 11: Reports | ⏳ Pending | 0% | 0h | 5h |
| Phase 12: Bulk Ops | ⏳ Pending | 0% | 0h | 4h |
| Phase 13: Surveys | ⏳ Pending | 0% | 0h | 4h |
| Phase 14: Parents | ⏳ Pending | 0% | 0h | 3h |
| Phase 15: Additional | ⏳ Pending | 0% | 0h | 4h |
| Phase 16: Testing | ⏳ Pending | 0% | 0h | 10h |
| **TOTAL** | **1.5%** | | **1.5h** | **98.5h** |

---

## 🎯 **Current Focus**

### **Now Working On:** Phase 1 - Foundation & Configuration

**Next Steps:**
1. ✅ Setup Flyway migrations
2. Configure application properties
3. Create exception handling
4. Setup response wrappers
5. Complete security configuration

---

## 📝 **Notes**

- Each phase builds on previous phases
- Can't skip phases (dependencies exist)
- Most critical: Phases 9-10 (Payroll + Leaves) - 20 hours
- Testing is crucial for payment integration

---

## 🚀 **Quick Reference**

**Total Endpoints to Implement:** 100+  
**Total Entities:** 35+  
**Most Complex:** Leave Management + Payroll Integration  
**Most Critical:** Payment Gateway Security  

---

**Last Updated:** [Current Date]  
**Status:** Phase 1 - In Progress (1.5% complete)

