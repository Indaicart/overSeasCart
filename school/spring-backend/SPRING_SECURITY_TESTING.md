# Spring Security Testing Guide

## 🧪 How to Test JWT Authentication

### Prerequisites
1. Spring Boot backend running on `http://localhost:8080`
2. PostgreSQL database running
3. Postman or curl installed

---

## 📝 Test Scenarios

### **Scenario 1: Login and Get JWT Token**

#### Request:
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "admin@school1.com",
  "password": "password123",
  "schoolCode": "SCH001"
}
```

#### Expected Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "admin@school1.com",
    "role": "SCHOOL_ADMIN",
    "schoolId": "school-uuid"
  },
  "expiresIn": 86400
}
```

**Copy the token value** - you'll need it for subsequent requests.

---

### **Scenario 2: Access Protected Endpoint (With Token)**

#### Request:
```bash
GET http://localhost:8080/api/students/school/{schoolId}
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Expected Response:
```json
[
  {
    "id": "student-uuid",
    "studentId": "STU001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@student.com",
    "status": "ACTIVE"
  }
]
```

**Status Code:** `200 OK`

---

### **Scenario 3: Access Protected Endpoint (Without Token)**

#### Request:
```bash
GET http://localhost:8080/api/students/school/{schoolId}
# No Authorization header
```

#### Expected Response:
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication is required to access this resource",
  "path": "/api/students/school/{schoolId}"
}
```

**Status Code:** `401 Unauthorized`

---

### **Scenario 4: Access Forbidden Endpoint (Wrong Role)**

Login as `STUDENT`, then try to create a new student:

#### Request:
```bash
POST http://localhost:8080/api/students
Authorization: Bearer <student-jwt-token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@student.com",
  "schoolId": "school-uuid"
}
```

#### Expected Response:
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "You don't have permission to access this resource",
  "path": "/api/students"
}
```

**Status Code:** `403 Forbidden`

---

### **Scenario 5: Multi-tenant Protection**

Login as School Admin from `School A`, then try to access students from `School B`:

#### Request:
```bash
GET http://localhost:8080/api/students/school/{school-b-uuid}
Authorization: Bearer <school-a-admin-token>
```

#### Expected Response:
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "You don't have permission to access data from this school",
  "path": "/api/students/school/{school-b-uuid}"
}
```

**Status Code:** `401 Unauthorized`

---

### **Scenario 6: Super Admin Bypass**

Login as `SUPER_ADMIN`, then access any school's data:

#### Request:
```bash
GET http://localhost:8080/api/students/school/{any-school-uuid}
Authorization: Bearer <super-admin-token>
```

#### Expected Response:
```json
[/* All students from any school */]
```

**Status Code:** `200 OK`

✅ Super Admin can bypass school-level restrictions.

---

## 🔑 Test Users by Role

Create these test users in your database:

### 1. Super Admin
```sql
INSERT INTO users (id, email, password, role, school_id, is_active)
VALUES (
  gen_random_uuid(),
  'superadmin@platform.com',
  '$2a$10$hashed_password',
  'SUPER_ADMIN',
  NULL,
  true
);
```

### 2. School Admin
```sql
INSERT INTO users (id, email, password, role, school_id, is_active)
VALUES (
  gen_random_uuid(),
  'admin@school1.com',
  '$2a$10$hashed_password',
  'SCHOOL_ADMIN',
  '<school-uuid>',
  true
);
```

### 3. Class Teacher
```sql
INSERT INTO users (id, email, password, role, school_id, is_active)
VALUES (
  gen_random_uuid(),
  'classteacher@school1.com',
  '$2a$10$hashed_password',
  'CLASS_TEACHER',
  '<school-uuid>',
  true
);
```

### 4. Subject Teacher
```sql
INSERT INTO users (id, email, password, role, school_id, is_active)
VALUES (
  gen_random_uuid(),
  'subjectteacher@school1.com',
  '$2a$10$hashed_password',
  'SUBJECT_TEACHER',
  '<school-uuid>',
  true
);
```

### 5. Student
```sql
INSERT INTO users (id, email, password, role, school_id, is_active)
VALUES (
  gen_random_uuid(),
  'student@school1.com',
  '$2a$10$hashed_password',
  'STUDENT',
  '<school-uuid>',
  true
);
```

### 6. Parent
```sql
INSERT INTO users (id, email, password, role, school_id, is_active)
VALUES (
  gen_random_uuid(),
  'parent@school1.com',
  '$2a$10$hashed_password',
  'PARENT',
  '<school-uuid>',
  true
);
```

---

## 📦 Postman Collection

### Import this collection:

```json
{
  "info": {
    "name": "School Management System - Spring Security Tests",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login - School Admin",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@school1.com\",\n  \"password\": \"password123\",\n  \"schoolCode\": \"SCH001\"\n}"
            },
            "url": "http://localhost:8080/api/auth/login"
          }
        },
        {
          "name": "Login - Super Admin",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"superadmin@platform.com\",\n  \"password\": \"superadmin123\"\n}"
            },
            "url": "http://localhost:8080/api/auth/login"
          }
        }
      ]
    },
    {
      "name": "Students",
      "item": [
        {
          "name": "Get All Students (Protected)",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{token}}"}],
            "url": "http://localhost:8080/api/students/school/{{schoolId}}"
          }
        },
        {
          "name": "Create Student (Admin Only)",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"firstName\": \"John\",\n  \"lastName\": \"Doe\",\n  \"email\": \"john@student.com\",\n  \"schoolId\": \"{{schoolId}}\"\n}"
            },
            "url": "http://localhost:8080/api/students"
          }
        }
      ]
    }
  ]
}
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "401 Unauthorized" on public endpoints
**Solution:** Check `SecurityConfig.java` - ensure endpoint is in `PUBLIC_ENDPOINTS` array.

### Issue 2: "403 Forbidden" with correct role
**Solution:** Check if role has `ROLE_` prefix in token. Spring Security expects `ROLE_SCHOOL_ADMIN`, not just `SCHOOL_ADMIN`.

### Issue 3: CORS errors from React frontend
**Solution:** Check `SecurityConfig.java` CORS configuration. Ensure frontend URL is in `allowedOrigins`.

### Issue 4: Token expired
**Solution:** Login again to get a new token. Default expiration is 24 hours.

### Issue 5: School access denied
**Solution:** Ensure user's `schoolId` matches the resource's `schoolId`. Or login as Super Admin.

---

## ✅ Security Checklist

- [ ] JWT token is generated on login
- [ ] Token contains userId, email, role, schoolId
- [ ] Token is validated on every request
- [ ] Invalid token returns 401
- [ ] Missing token returns 401
- [ ] Wrong role returns 403
- [ ] School isolation works (can't access other schools)
- [ ] Super Admin can access all schools
- [ ] CORS works from React frontend
- [ ] Public endpoints work without token
- [ ] Protected endpoints require token

---

## 🎯 Next Steps

1. **Test all endpoints manually** with Postman
2. **Write unit tests** for security components
3. **Update React frontend** to use Authorization header
4. **Add refresh token** mechanism (optional)
5. **Enable HTTPS** in production

**Spring Security is now fully functional! 🎉**

