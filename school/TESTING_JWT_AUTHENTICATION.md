# 🧪 Testing JWT Authentication - End-to-End Guide

## ✅ Complete Testing Checklist

Follow these steps to test the complete JWT authentication flow between Spring Boot backend and React frontend.

---

## 🚀 Prerequisites

### 1. **Start PostgreSQL Database**
```bash
# Ensure PostgreSQL is running
# Database: school_management_db
# Port: 5432
```

### 2. **Start Spring Boot Backend**
```bash
cd spring-backend
mvn clean install
mvn spring-boot:run
```

**Backend URL:** `http://localhost:8080`

### 3. **Configure Frontend Environment**
Create `client/.env`:
```bash
REACT_APP_API_URL=http://localhost:8080/api
```

### 4. **Start React Frontend**
```bash
cd client
npm install
npm start
```

**Frontend URL:** `http://localhost:3000`

---

## 🧪 Test Scenarios

### **Test 1: Login Flow**

#### Steps:
1. Open browser to `http://localhost:3000/login`
2. Open DevTools (F12) → Console tab
3. Open DevTools → Application → Local Storage

4. Enter credentials:
   - Email: `admin@school.com`
   - Password: `password123`

5. Click "Sign in"

#### Expected Results:
✅ Console shows: `✅ Login successful: SCHOOL_ADMIN`  
✅ Toast notification: "Welcome back, admin@school.com!"  
✅ Redirected to `/dashboard`  
✅ LocalStorage contains:
   - `school_jwt_token` (long JWT string)
   - `school_user_data` (JSON object with user info)
   - `school_token_expiry` (timestamp)

#### Screenshot of LocalStorage:
```
school_jwt_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
school_user_data: "{\"id\":\"uuid\",\"email\":\"admin@school.com\",\"role\":\"SCHOOL_ADMIN\",\"schoolId\":\"uuid\"}"
school_token_expiry: "1696291200000"
```

---

### **Test 2: Authenticated API Request**

#### Steps:
1. After successful login, navigate to `/students`
2. Open DevTools → Network tab
3. Filter by "XHR" or "Fetch"
4. Refresh the page

#### Expected Results:
✅ Network request to `/api/students/school/uuid`  
✅ Request Headers include:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
✅ Response Status: `200 OK`  
✅ Response contains student data (JSON array)

#### Screenshot of Network Tab:
```
Request URL: http://localhost:8080/api/students/school/uuid
Request Method: GET
Status Code: 200 OK

Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
```

---

### **Test 3: Token Auto-Expiry Check**

#### Steps:
1. After successful login, check token expiry
2. Open Console and type:
```javascript
localStorage.getItem('school_token_expiry')
```

3. Calculate time until expiry:
```javascript
const expiry = parseInt(localStorage.getItem('school_token_expiry'));
const now = Date.now();
const timeUntil = expiry - now;
console.log('Time until expiry:', timeUntil / 1000 / 60, 'minutes');
```

#### Expected Results:
✅ Token expires in ~24 hours (1440 minutes)  
✅ Expiry timestamp is valid  

---

### **Test 4: Manual Token Expiry (Force Logout)**

#### Steps:
1. After successful login, open DevTools → Application → Local Storage
2. Manually edit `school_token_expiry` to a past timestamp:
```javascript
localStorage.setItem('school_token_expiry', '0')
```

3. Refresh the page or make any API request

#### Expected Results:
✅ Console shows: `⚠️ Token expired, clearing storage`  
✅ LocalStorage is cleared (all 3 keys removed)  
✅ Redirected to `/login?session=expired`  
✅ Toast notification: "Session expired. Please login again."

---

### **Test 5: 401 Unauthorized (Missing Token)**

#### Steps:
1. Open DevTools → Application → Local Storage
2. Manually delete `school_jwt_token`
3. Try to navigate to a protected page (e.g., `/students`)

#### Expected Results:
✅ Console shows: `⚠️ No token found, sending request without Authorization header`  
✅ API request fails with 401 Unauthorized  
✅ Console shows: `🚫 401 Unauthorized: Authentication required`  
✅ Redirected to `/login?session=expired`  
✅ LocalStorage is cleared

---

### **Test 6: 403 Forbidden (Insufficient Permissions)**

#### Steps:
1. Login as a STUDENT:
   - Email: `student@school.com`
   - Password: `password123`

2. Try to create a new student (admin-only action):
   - Navigate to `/students/new`
   - Fill in student form
   - Click "Create Student"

#### Expected Results:
✅ Console shows: `🚫 403 Forbidden: Insufficient permissions`  
✅ Alert/Toast shows: "Access Denied: You don't have permission to perform this action."  
✅ Student is NOT created  
✅ User is NOT logged out (still authenticated)

---

### **Test 7: Logout Flow**

#### Steps:
1. After successful login, click "Logout" button
2. Open DevTools → Application → Local Storage
3. Check console

#### Expected Results:
✅ Console shows: `✅ User logged out`  
✅ Toast notification: "Logged out successfully. See you next time!"  
✅ LocalStorage is cleared (all 3 keys removed)  
✅ Redirected to `/login`  
✅ User cannot access protected pages

---

### **Test 8: Role-Based Access Control**

#### Test 8.1: Super Admin Access
1. Login as Super Admin:
   - Email: `superadmin@platform.com`
   - Password: `superadmin123`

2. Navigate to `/platform-admin`

#### Expected Results:
✅ Access granted  
✅ Platform admin dashboard loads  
✅ Can view all schools  

---

#### Test 8.2: School Admin Access
1. Login as School Admin:
   - Email: `admin@school.com`
   - Password: `password123`

2. Try to access `/platform-admin`

#### Expected Results:
✅ 403 Forbidden  
✅ Alert: "Access Denied"  
✅ Cannot view platform admin dashboard

---

#### Test 8.3: Teacher Access
1. Login as Teacher:
   - Email: `teacher@school.com`
   - Password: `password123`

2. Navigate to `/attendance/mark`

#### Expected Results:
✅ Access granted  
✅ Can mark attendance  
✅ Cannot create students (403)

---

#### Test 8.4: Student Access
1. Login as Student:
   - Email: `student@school.com`
   - Password: `password123`

2. Navigate to `/student-portal/dashboard`

#### Expected Results:
✅ Access granted  
✅ Can view own grades, attendance, fees  
✅ Cannot access teacher/admin pages (403)

---

#### Test 8.5: Parent Access
1. Login as Parent:
   - Email: `parent@school.com`
   - Password: `password123`

2. Navigate to `/parent-portal/dashboard`

#### Expected Results:
✅ Access granted  
✅ Can view children's data  
✅ Cannot access admin pages (403)

---

### **Test 9: Auto-Authentication on Page Refresh**

#### Steps:
1. Login successfully
2. Navigate to any protected page
3. Press F5 (refresh page)
4. Check if user remains logged in

#### Expected Results:
✅ User remains logged in  
✅ No redirect to login page  
✅ Console shows: `✅ User authenticated from localStorage: admin@school.com`  
✅ Page loads normally with user data

---

### **Test 10: CORS Verification**

#### Steps:
1. Open DevTools → Network tab
2. Make any API request from React frontend
3. Check response headers

#### Expected Results:
✅ No CORS errors in console  
✅ Response headers include:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

---

## 🔍 Debugging Tips

### **Issue: "CORS error"**
**Solution:**
1. Check `SecurityConfig.java` CORS configuration
2. Ensure frontend URL is in `allowedOrigins`
3. Restart Spring Boot backend

### **Issue: "401 Unauthorized on all requests"**
**Solution:**
1. Check if token exists in localStorage
2. Check token expiry timestamp
3. Check if Authorization header is added (DevTools → Network)
4. Verify backend is running on correct port

### **Issue: "Token not saved after login"**
**Solution:**
1. Check if login response contains `token`, `user`, `expiresIn`
2. Check browser console for errors
3. Verify `tokenStorage.saveToken()` is called

### **Issue: "403 Forbidden on all requests"**
**Solution:**
1. Check user role in localStorage
2. Verify controller @PreAuthorize annotations
3. Check if user has required role

---

## 📊 Test Results Template

Use this template to document your test results:

```
┌─────────────────────────────────────────────────────────────┐
│ JWT Authentication Testing Results                          │
├─────────────────────────────────────────────────────────────┤
│ Test 1: Login Flow                       [ ] PASS [ ] FAIL │
│ Test 2: Authenticated API Request        [ ] PASS [ ] FAIL │
│ Test 3: Token Auto-Expiry Check          [ ] PASS [ ] FAIL │
│ Test 4: Manual Token Expiry              [ ] PASS [ ] FAIL │
│ Test 5: 401 Unauthorized                 [ ] PASS [ ] FAIL │
│ Test 6: 403 Forbidden                    [ ] PASS [ ] FAIL │
│ Test 7: Logout Flow                      [ ] PASS [ ] FAIL │
│ Test 8.1: Super Admin Access             [ ] PASS [ ] FAIL │
│ Test 8.2: School Admin Access            [ ] PASS [ ] FAIL │
│ Test 8.3: Teacher Access                 [ ] PASS [ ] FAIL │
│ Test 8.4: Student Access                 [ ] PASS [ ] FAIL │
│ Test 8.5: Parent Access                  [ ] PASS [ ] FAIL │
│ Test 9: Auto-Authentication              [ ] PASS [ ] FAIL │
│ Test 10: CORS Verification               [ ] PASS [ ] FAIL │
├─────────────────────────────────────────────────────────────┤
│ Overall Result:              [ ] ALL PASS [ ] SOME FAIL    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Success Criteria

All tests should PASS with:
✅ No console errors  
✅ Proper JWT token storage  
✅ Authorization header on all requests  
✅ Correct role-based access control  
✅ Proper 401/403 error handling  
✅ Auto-logout on token expiry  
✅ No CORS errors  

---

## 📚 Related Documentation

- `OPTION_A_IMPLEMENTATION_COMPLETE.md` - Implementation summary
- `SPRING_SECURITY_USAGE_GUIDE.md` - Security usage guide
- `SPRING_SECURITY_TESTING.md` - Postman testing guide
- `CONTROLLER_SECURITY_RULES.md` - Security rules by controller

**Happy Testing! 🚀**

