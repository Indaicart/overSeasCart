# Spring Security + JWT - Usage Guide

## 🔐 Overview

The Spring Boot backend now has **complete JWT authentication and authorization** implemented with Spring Security.

## 📁 Files Created

### Security Components (9 files)
1. **JwtAuthenticationFilter** - Extracts and validates JWT from requests
2. **JwtAuthenticationDetails** - Stores user info (userId, email, role, schoolId)
3. **JwtAuthenticationEntryPoint** - Handles 401 Unauthorized errors
4. **JwtAccessDeniedHandler** - Handles 403 Forbidden errors
5. **SecurityContextHelper** - Helper to get current user from context
6. **SecurityConfig** - Main security configuration (CORS, endpoints, rules)

### Custom Annotations (2 files)
7. **@RequireRole** - Custom role-based access control
8. **@RequireSchoolAccess** - Multi-tenant school data protection

### AOP Aspects (2 files)
9. **SchoolAccessAspect** - Enforces school-level data isolation
10. **RoleAccessAspect** - Enforces role-based permissions

### Example Controller
11. **SecureStudentController** - Demo of all 3 security approaches

---

## 🎯 How JWT Authentication Works

### 1. **Login Flow**
```
Client → POST /api/auth/login
       → AuthService validates credentials
       → JwtUtil generates token with (userId, email, role, schoolId)
       → Client receives: { token, user, expiresIn }
```

### 2. **Authenticated Request Flow**
```
Client → GET /api/students (with Authorization: Bearer <token>)
       → JwtAuthenticationFilter intercepts request
       → Extracts token, validates signature and expiration
       → Sets authentication in SecurityContext
       → Request proceeds to controller
       → SecurityConfig/annotations check permissions
       → Response returned or 401/403 error
```

---

## 🛡️ 3 Ways to Secure Endpoints

### **Method 1: @PreAuthorize (Recommended)**
Spring Security's native annotation. Most powerful and flexible.

```java
@GetMapping("/students")
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUPER_ADMIN')")
public ResponseEntity<Page<StudentResponse>> getAllStudents() {
    // ...
}
```

**When to use:** General role-based access control

---

### **Method 2: Custom @RequireRole**
Cleaner syntax for role checking.

```java
@GetMapping("/students/{id}")
@RequireRole({"SCHOOL_ADMIN", "CLASS_TEACHER"})
public ResponseEntity<StudentResponse> getStudent(@PathVariable UUID id) {
    // ...
}
```

**When to use:** When you want cleaner, more readable code

---

### **Method 3: @RequireSchoolAccess (Multi-tenant)**
Automatically validates that users can only access their own school's data.

```java
@PostMapping("/students")
@RequireSchoolAccess(allowSuperAdmin = true)
@RequireRole({"SCHOOL_ADMIN"})
public ResponseEntity<StudentResponse> createStudent(
    @RequestBody StudentCreateRequest request
) {
    // Validates that request.schoolId == user's schoolId
    // Super Admin can bypass this check
}
```

**When to use:** Protecting school-specific resources (students, teachers, classes, etc.)

---

## 🔑 SecurityContextHelper - Get Current User

Use this helper to get current authenticated user's details in services:

```java
@Service
@RequiredArgsConstructor
public class MyService {
    
    private final SecurityContextHelper securityHelper;
    
    public void doSomething() {
        // Get current user details
        UUID userId = securityHelper.getCurrentUserId();
        UUID schoolId = securityHelper.getCurrentSchoolId();
        String email = securityHelper.getCurrentUserEmail();
        String role = securityHelper.getCurrentUserRole();
        
        // Check roles
        if (securityHelper.isSuperAdmin()) {
            // Super Admin logic
        }
        
        if (securityHelper.isSchoolAdmin()) {
            // School Admin logic
        }
        
        if (securityHelper.isTeacher()) {
            // Teacher logic (both class and subject)
        }
    }
}
```

---

## 🌐 CORS Configuration

Frontend URLs are allowed:
- `http://localhost:3000` (React dev server)
- `http://localhost:5000`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5000`

**Headers:**
- All headers allowed
- Credentials enabled
- Authorization header exposed

---

## 🔓 Public Endpoints (No Authentication Required)

```java
// Health check
GET /api/health

// Authentication
POST /api/auth/validate-school
POST /api/auth/login
POST /api/auth/register

// Password reset
POST /api/password-reset/request
POST /api/password-reset/verify
POST /api/password-reset/reset

// Self-service school registration
POST /api/self-service/register

// Payment webhooks
POST /api/payments/webhook
```

---

## 🔒 Protected Endpoints by Role

### **Super Admin Only**
```java
/api/platform-admin/**
/api/feature-management/**
/api/subscription-plans/**
```

### **School Admin + Super Admin**
```java
POST /api/students/**
POST /api/teachers/**
POST /api/classes/**
PUT /api/schools/*/settings
```

### **Teachers (Class + Subject)**
```java
/api/attendance/**
/api/grades/**
```

### **Role-specific Portals**
```java
/api/student-portal/**       → STUDENT only
/api/parent-portal/**         → PARENT only
/api/class-teacher-portal/**  → CLASS_TEACHER only
/api/subject-teacher-portal/** → SUBJECT_TEACHER only
```

---

## 🧪 Example Controller Implementation

See `SecureStudentController.java` for complete examples of:
1. ✅ Using @PreAuthorize
2. ✅ Using @RequireRole
3. ✅ Using @RequireSchoolAccess
4. ✅ Combining multiple annotations
5. ✅ Different permission levels (create, read, update, delete)

---

## 📝 How to Update Existing Controllers

### Before (No Security):
```java
@GetMapping("/{id}")
public ResponseEntity<StudentResponse> getStudent(@PathVariable UUID id) {
    return ResponseEntity.ok(studentService.getStudentById(id));
}
```

### After (With Security):
```java
@GetMapping("/{id}")
@PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUPER_ADMIN')")
public ResponseEntity<StudentResponse> getStudent(@PathVariable UUID id) {
    return ResponseEntity.ok(studentService.getStudentById(id));
}
```

---

## 🚀 Next Steps

### Option A: Update All Existing Controllers (Recommended)
Add security annotations to all 26 controllers:
- StudentController
- TeacherController
- ClassController
- AttendanceController
- GradeController
- FeeController
- PaymentController
- SchoolController
- ParentController
- TimetableController
- NotificationController
- DocumentController
- (and 14 more...)

### Option B: Test with Postman/curl
1. Start Spring Boot backend
2. Login to get JWT token
3. Use token in Authorization header: `Bearer <token>`
4. Test protected endpoints

### Option C: Frontend Integration
Update React frontend to:
1. Store JWT token in localStorage
2. Add Authorization header to all API requests
3. Handle 401/403 errors (redirect to login)

---

## 🎉 What's Complete

✅ **JWT Authentication Filter** - Extracts and validates tokens  
✅ **Security Configuration** - Role-based access control  
✅ **Multi-tenant Protection** - School data isolation  
✅ **Custom Annotations** - @RequireRole, @RequireSchoolAccess  
✅ **AOP Aspects** - Automatic permission validation  
✅ **SecurityContextHelper** - Easy current user access  
✅ **CORS Configuration** - Frontend integration ready  
✅ **Exception Handling** - 401/403 with JSON responses  
✅ **Public Endpoints** - Login, registration, password reset  
✅ **Protected Endpoints** - Per-role access control  

---

## 🔐 Security Features Summary

| Feature | Status | Description |
|---------|--------|-------------|
| JWT Token Generation | ✅ | Secure HS256 signing |
| JWT Token Validation | ✅ | Signature + expiration check |
| Role-Based Access | ✅ | 7 roles supported |
| Multi-tenant Isolation | ✅ | School data protection |
| CORS Protection | ✅ | Frontend whitelist |
| CSRF Protection | ✅ | Disabled (stateless JWT) |
| Session Management | ✅ | Stateless (no sessions) |
| Exception Handling | ✅ | 401/403 JSON responses |
| Custom Annotations | ✅ | @RequireRole, @RequireSchoolAccess |
| AOP Aspects | ✅ | Automatic validation |
| SecurityContext Helper | ✅ | Current user access |

---

## 📚 Documentation

- See `PHASE8_SPRING_SECURITY_PLAN.md` for original plan
- See `SecureStudentController.java` for code examples
- See JavaDocs in security classes for detailed explanations

**The Spring Boot backend now has enterprise-grade security! 🎉**

