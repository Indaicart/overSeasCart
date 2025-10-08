# Controller Security Annotations - Reference Guide

## Security Rules by Controller

### ✅ Already Secured (4 controllers)
1. **StudentController** - Partially secured
2. **TeacherController** - ✅ Secured
3. **ClassController** - ✅ Secured
4. **AttendanceController** - ✅ Secured

### 🔒 Security Rules for Remaining Controllers

---

## **GradeController**
- **POST /grades** → CLASS_TEACHER, SUBJECT_TEACHER, SCHOOL_ADMIN, SUPER_ADMIN
- **POST /grades/bulk** → CLASS_TEACHER, SUBJECT_TEACHER, SCHOOL_ADMIN, SUPER_ADMIN
- **GET /grades/{id}** → CLASS_TEACHER, SUBJECT_TEACHER, SCHOOL_ADMIN, STUDENT, PARENT, SUPER_ADMIN
- **GET /grades/student/{studentId}** → CLASS_TEACHER, SUBJECT_TEACHER, SCHOOL_ADMIN, STUDENT, PARENT, SUPER_ADMIN
- **PUT /grades/{id}** → CLASS_TEACHER, SUBJECT_TEACHER, SCHOOL_ADMIN, SUPER_ADMIN
- **DELETE /grades/{id}** → SCHOOL_ADMIN, SUPER_ADMIN

---

## **SubjectController**
- **POST /subjects** → SCHOOL_ADMIN, SUPER_ADMIN
- **GET /subjects/{id}** → SCHOOL_ADMIN, CLASS_TEACHER, SUBJECT_TEACHER, SUPER_ADMIN
- **GET /subjects/school/{schoolId}** → SCHOOL_ADMIN, CLASS_TEACHER, SUBJECT_TEACHER, SUPER_ADMIN
- **PUT /subjects/{id}** → SCHOOL_ADMIN, SUPER_ADMIN
- **DELETE /subjects/{id}** → SCHOOL_ADMIN, SUPER_ADMIN

---

## **FeeController**
- **POST /fees** → SCHOOL_ADMIN, SUPER_ADMIN
- **GET /fees/{id}** → SCHOOL_ADMIN, STUDENT, PARENT, SUPER_ADMIN
- **GET /fees/student/{studentId}** → SCHOOL_ADMIN, STUDENT, PARENT, SUPER_ADMIN
- **GET /fees/school/{schoolId}/pending** → SCHOOL_ADMIN, SUPER_ADMIN
- **PUT /fees/{id}** → SCHOOL_ADMIN, SUPER_ADMIN
- **DELETE /fees/{id}** → SCHOOL_ADMIN, SUPER_ADMIN

---

## **PaymentController**
- **POST /payments** → SCHOOL_ADMIN, PARENT, SUPER_ADMIN
- **GET /payments/{id}** → SCHOOL_ADMIN, PARENT, SUPER_ADMIN
- **GET /payments/student/{studentId}** → SCHOOL_ADMIN, PARENT, SUPER_ADMIN
- **GET /payments/school/{schoolId}** → SCHOOL_ADMIN, SUPER_ADMIN
- **POST /payments/webhook** → PUBLIC (no auth)

---

## **SchoolController**
- **POST /schools** → SUPER_ADMIN
- **GET /schools/{id}** → SCHOOL_ADMIN, SUPER_ADMIN
- **GET /schools** → SUPER_ADMIN
- **PUT /schools/{id}** → SCHOOL_ADMIN, SUPER_ADMIN
- **PUT /schools/{id}/settings** → SCHOOL_ADMIN, SUPER_ADMIN
- **DELETE /schools/{id}** → SUPER_ADMIN

---

## **ParentController**
- **POST /parents** → SCHOOL_ADMIN, SUPER_ADMIN
- **GET /parents/{id}** → SCHOOL_ADMIN, PARENT, SUPER_ADMIN
- **GET /parents/school/{schoolId}** → SCHOOL_ADMIN, SUPER_ADMIN
- **POST /parents/{parentId}/students/{studentId}** → SCHOOL_ADMIN, SUPER_ADMIN
- **PUT /parents/{id}** → SCHOOL_ADMIN, PARENT, SUPER_ADMIN
- **DELETE /parents/{id}** → SCHOOL_ADMIN, SUPER_ADMIN

---

## **TimetableController**
- **POST /timetables** → SCHOOL_ADMIN, SUPER_ADMIN
- **GET /timetables/class/{classId}** → SCHOOL_ADMIN, CLASS_TEACHER, STUDENT, PARENT, SUPER_ADMIN
- **GET /timetables/teacher/{teacherId}** → SCHOOL_ADMIN, CLASS_TEACHER, SUBJECT_TEACHER, SUPER_ADMIN
- **DELETE /timetables/{id}** → SCHOOL_ADMIN, SUPER_ADMIN

---

## **NotificationController**
- **POST /notifications** → SCHOOL_ADMIN, CLASS_TEACHER, SUBJECT_TEACHER, SUPER_ADMIN
- **GET /notifications/user/{userId}** → All authenticated users (own notifications)
- **GET /notifications/unread** → All authenticated users
- **PUT /notifications/{id}/read** → All authenticated users
- **PUT /notifications/mark-all-read** → All authenticated users

---

## **DocumentController**
- **POST /documents** → SCHOOL_ADMIN, CLASS_TEACHER, SUPER_ADMIN
- **GET /documents/{id}** → SCHOOL_ADMIN, CLASS_TEACHER, STUDENT, PARENT, SUPER_ADMIN
- **GET /documents/student/{studentId}** → SCHOOL_ADMIN, CLASS_TEACHER, STUDENT, PARENT, SUPER_ADMIN
- **DELETE /documents/{id}** → SCHOOL_ADMIN, SUPER_ADMIN

---

## **Portal Controllers** (Already role-specific by design)

### **StudentPortalController**
- **All endpoints** → STUDENT only

### **ParentPortalController**
- **All endpoints** → PARENT only

### **ClassTeacherPortalController**
- **All endpoints** → CLASS_TEACHER only

### **SubjectTeacherPortalController**
- **All endpoints** → SUBJECT_TEACHER only

---

## **Admin Controllers**

### **PlatformAdminController**
- **All endpoints** → SUPER_ADMIN only

### **FeatureManagementController**
- **All endpoints** → SUPER_ADMIN only

### **SubscriptionController**
- **POST /subscriptions** → SUPER_ADMIN
- **GET /subscriptions/school/{schoolId}** → SCHOOL_ADMIN, SUPER_ADMIN
- **PUT /subscriptions/{id}** → SUPER_ADMIN
- **POST /subscriptions/{id}/renew** → SCHOOL_ADMIN, SUPER_ADMIN

---

## **HR & Payroll Controllers**

### **PayrollController**
- **POST /payroll/staff-salaries** → SCHOOL_ADMIN, SUPER_ADMIN
- **GET /payroll/staff-salaries/school/{schoolId}** → SCHOOL_ADMIN, SUPER_ADMIN
- **POST /payroll/process-payment** → SCHOOL_ADMIN, SUPER_ADMIN
- **GET /payroll/salary-payments/staff/{staffId}** → SCHOOL_ADMIN, SUPER_ADMIN (staff can view own)

### **LeaveManagementController**
- **POST /leave/types** → SCHOOL_ADMIN, SUPER_ADMIN
- **POST /leave/applications** → All employees (teachers/staff)
- **GET /leave/applications/{id}** → SCHOOL_ADMIN (or own application)
- **PUT /leave/applications/{id}/approve** → SCHOOL_ADMIN, SUPER_ADMIN
- **PUT /leave/applications/{id}/reject** → SCHOOL_ADMIN, SUPER_ADMIN
- **GET /leave/balances/user/{userId}** → SCHOOL_ADMIN, SUPER_ADMIN (or own balance)

---

## **Additional Controllers**

### **ActivityLogController**
- **GET /activity-logs/user/{userId}** → SCHOOL_ADMIN, SUPER_ADMIN (or own logs)
- **GET /activity-logs/school/{schoolId}** → SCHOOL_ADMIN, SUPER_ADMIN
- **GET /activity-logs** → SUPER_ADMIN

### **PasswordResetController**
- **All endpoints** → PUBLIC (no auth required)

### **UserController**
- **GET /users/{id}** → All authenticated (own profile or admin)
- **PUT /users/{id}** → All authenticated (own profile or admin)
- **PUT /users/{id}/password** → All authenticated (own password or admin)
- **PUT /users/{id}/activate** → SCHOOL_ADMIN, SUPER_ADMIN
- **PUT /users/{id}/deactivate** → SCHOOL_ADMIN, SUPER_ADMIN

### **AuthController**
- **All endpoints** → PUBLIC (no auth required)

### **HealthController**
- **All endpoints** → PUBLIC (no auth required)

---

## Common Patterns

### **Create (POST)**
- Usually: SCHOOL_ADMIN, SUPER_ADMIN
- Exceptions: Teachers can mark attendance/grades, Parents can make payments

### **Read (GET)**
- Admin: SCHOOL_ADMIN, SUPER_ADMIN
- Teachers: Can view relevant students/classes
- Students: Can view own data
- Parents: Can view children's data

### **Update (PUT/PATCH)**
- Usually: SCHOOL_ADMIN, SUPER_ADMIN
- Exceptions: Teachers can update grades/attendance, Users can update own profile

### **Delete (DELETE)**
- Usually: SCHOOL_ADMIN, SUPER_ADMIN only

---

## Implementation Status

✅ **Secured (4/28 controllers)**
- StudentController (partial)
- TeacherController
- ClassController
- AttendanceController

⬜ **Remaining (24/28 controllers)**
- GradeController
- SubjectController
- FeeController
- PaymentController
- SchoolController
- ParentController
- TimetableController
- NotificationController
- DocumentController
- StudentPortalController
- ParentPortalController
- ClassTeacherPortalController
- SubjectTeacherPortalController
- PlatformAdminController
- FeatureManagementController
- SubscriptionController
- PayrollController
- LeaveManagementController
- ActivityLogController
- PasswordResetController (PUBLIC)
- UserController
- AuthController (PUBLIC)
- HealthController (PUBLIC)
- SecureStudentController (Example only)

---

## Next Steps

1. Apply security annotations to all remaining controllers
2. Test each controller with Postman
3. Verify role-based access works correctly
4. Update frontend to handle 401/403 errors

