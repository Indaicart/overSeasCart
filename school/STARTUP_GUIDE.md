# 🚀 Startup Guide - Dual Backend School Management System

This guide will help you get started with the school management system, whether you want to use the **Spring Boot backend** (recommended) or the **Node.js backend**.

## 🎯 **Quick Start Options**

### **Option 1: Spring Boot Backend (Recommended) 🏆**

```bash
# 1. Switch to Spring Boot configuration
switch-to-springboot.bat    # Windows
./switch-to-springboot.sh   # Linux/Mac

# 2. Start Spring Boot Backend
cd spring-backend
mvn spring-boot:run

# 3. Start React Frontend (in new terminal)
cd client
npm start
```

**Access URLs:**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:5000/api
- 🏥 **Health Check**: http://localhost:5000/api/health

### **Option 2: Node.js Backend (Alternative)**

```bash
# 1. Switch to Node.js configuration
switch-to-nodejs.bat        # Windows
./switch-to-nodejs.sh       # Linux/Mac

# 2. Start Node.js Backend
cd server
npm run dev

# 3. Start React Frontend (in new terminal)
cd client
npm start
```

**Access URLs:**
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:5000
- 🏥 **Health Check**: http://localhost:5000/health

## 📋 **Prerequisites**

### **For Spring Boot Backend:**
- ✅ **Java 17+** - [Download Java](https://adoptium.net/)
- ✅ **Maven 3.6+** - [Download Maven](https://maven.apache.org/download.cgi)
- ✅ **PostgreSQL 12+** - [Download PostgreSQL](https://www.postgresql.org/download/)

### **For Node.js Backend:**
- ✅ **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- ✅ **PostgreSQL 12+** - [Download PostgreSQL](https://www.postgresql.org/download/)

### **For Frontend:**
- ✅ **Node.js 16+** - [Download Node.js](https://nodejs.org/)

## 🗄️ **Database Setup**

### **1. Install PostgreSQL**
Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)

### **2. Create Database**
```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE school_management;
```

### **3. Database Configuration**

#### **For Spring Boot:**
Create `spring-backend/src/main/resources/application-local.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/school_management
    username: postgres
    password: your_postgres_password

jwt:
  secret: your_super_secret_jwt_key_here_make_it_long_and_random
  expiration: 604800000 # 7 days
```

#### **For Node.js:**
Create `server/.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_management
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
```

## 🔐 **Default Login Accounts**

After setting up the database, you can use these accounts:

### **Super Admin (Platform Management)**
- **Email**: `superadmin@schoolms.com`
- **Password**: `superadmin123`
- **Access**: Full platform management

### **School Admin**
- **Email**: `admin@school.com`
- **Password**: `password123`
- **Access**: School-specific admin functions

### **Teacher**
- **Email**: `teacher@school.com`
- **Password**: `password123`
- **Access**: Teacher functions

### **Student**
- **Email**: `student@school.com`
- **Password**: `password123`
- **Access**: Student portal

### **Parent**
- **Email**: `parent@school.com`
- **Password**: `password123`
- **Access**: Parent portal

## 🛠️ **Development Workflow**

### **Primary Development (Spring Boot)**

1. **Start Spring Boot Backend:**
   ```bash
   cd spring-backend
   mvn spring-boot:run
   ```

2. **Start React Frontend:**
   ```bash
   cd client
   npm start
   ```

3. **Make Changes:**
   - Backend changes in `spring-backend/src/main/java/`
   - Frontend changes in `client/src/`

4. **Test Changes:**
   - Backend: http://localhost:5000/api/health
   - Frontend: http://localhost:3000

### **Alternative Development (Node.js)**

1. **Start Node.js Backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start React Frontend:**
   ```bash
   cd client
   npm start
   ```

3. **Make Changes:**
   - Backend changes in `server/`
   - Frontend changes in `client/src/`

## 🔄 **Switching Between Backends**

### **Quick Switch Commands:**

```bash
# Switch to Spring Boot
switch-to-springboot.bat    # Windows
./switch-to-springboot.sh   # Linux/Mac

# Switch to Node.js
switch-to-nodejs.bat        # Windows
./switch-to-nodejs.sh       # Linux/Mac
```

### **Manual Switch:**

1. **Stop current backend**
2. **Update frontend API URL:**
   - Spring Boot: `http://localhost:5000/api`
   - Node.js: `http://localhost:5000`
3. **Start new backend**
4. **Test functionality**

## 🧪 **Testing the Setup**

### **1. Health Check**
```bash
# Spring Boot
curl http://localhost:5000/api/health

# Node.js
curl http://localhost:5000/health
```

### **2. Authentication Test**
```bash
# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.com","password":"password123"}'
```

### **3. Frontend Test**
1. Open http://localhost:3000
2. Try logging in with demo accounts
3. Verify all features work

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Port Already in Use:**
   ```bash
   # Kill process using port 5000
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. **Database Connection Error:**
   - Check PostgreSQL is running
   - Verify database credentials
   - Ensure database exists

3. **Dependencies Issues:**
   ```bash
   # Spring Boot
   mvn clean install
   
   # Node.js
   npm install
   
   # Frontend
   cd client && npm install
   ```

4. **Frontend API Errors:**
   - Check API URL configuration
   - Verify backend is running
   - Check CORS settings

## 📊 **Performance Comparison**

| Metric | Spring Boot | Node.js |
|--------|-------------|---------|
| **Startup Time** | ~10-15s | ~2-3s |
| **Memory Usage** | ~200-300MB | ~50-100MB |
| **Request Handling** | ~1000 req/s | ~500 req/s |
| **Concurrent Users** | ~1000+ | ~500+ |
| **Enterprise Features** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 **Recommendations**

### **Use Spring Boot When:**
- ✅ Building for production
- ✅ Need enterprise features
- ✅ Expecting high traffic
- ✅ Want better security
- ✅ Planning to scale

### **Use Node.js When:**
- ✅ Quick prototyping
- ✅ Small team development
- ✅ JavaScript expertise
- ✅ Simple deployment
- ✅ Learning purposes

## 📚 **Documentation**

- **`PROJECT_STRUCTURE.md`** - Complete project structure
- **`README-SPRING-BOOT.md`** - Spring Boot focused docs
- **`MIGRATION_GUIDE.md`** - Migration between backends
- **`spring-backend/README.md`** - Spring Boot specific docs

## 🎉 **Next Steps**

1. **Choose your backend** (Spring Boot recommended)
2. **Set up the database**
3. **Run the startup commands**
4. **Test the application**
5. **Start developing features**

---

**Happy coding! 🚀**
