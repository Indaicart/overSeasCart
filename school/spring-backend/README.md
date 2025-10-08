# School Management System - Spring Boot Backend

A comprehensive, multi-tenant school management system built with Spring Boot, featuring JWT authentication, role-based access control, and complete school administration capabilities.

## 🚀 Features

### Core Features
- **Multi-tenant Architecture** - Support for multiple schools with data isolation
- **Role-based Access Control** - Super Admin, School Admin, Teacher, Student, Parent roles
- **JWT Authentication** - Secure token-based authentication
- **Student Management** - Complete student lifecycle management
- **Teacher Management** - Teacher profiles and assignments
- **Class Management** - Class creation and management
- **Subject Management** - Subject and curriculum management
- **Attendance Tracking** - Daily attendance marking and reporting
- **Grade Management** - Grade recording and analytics
- **Fee Management** - Fee collection and payment tracking
- **Timetable Management** - Class scheduling and timetables
- **Document Management** - File upload and management
- **Notification System** - Real-time notifications
- **Parent Portal** - Parent access to child's information

### Platform Features (Super Admin)
- **School Management** - Create and manage multiple schools
- **Subscription Management** - Handle subscription plans and billing
- **Platform Analytics** - Revenue and usage statistics
- **Multi-tenancy** - Complete data isolation between schools

## 🛠️ Technology Stack

- **Backend**: Spring Boot 3.2.0
- **Database**: PostgreSQL
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security with JWT
- **Authentication**: JWT Token-based
- **Validation**: Bean Validation
- **Build Tool**: Maven
- **Java Version**: 17

## 📋 Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- IDE (IntelliJ IDEA, Eclipse, VS Code)

## 🚀 Quick Start

### 1. Database Setup
```sql
CREATE DATABASE school_management;
```

### 2. Configuration
Create `application-local.yml` in `src/main/resources/`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/school_management
    username: postgres
    password: your_password

jwt:
  secret: your_super_secret_jwt_key_here_make_it_long_and_random
  expiration: 604800000 # 7 days
```

### 3. Run the Application
```bash
# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run

# Or run with profile
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 4. Access the Application
- **API Base URL**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health
- **Actuator**: http://localhost:5000/api/actuator/health

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Health Check
- `GET /api/health` - Application health status

## 🔐 Default Accounts

After running the application with sample data:

### Super Admin
- **Email**: `superadmin@schoolms.com`
- **Password**: `superadmin123`
- **Access**: Full platform management

### School Admin
- **Email**: `admin@school.com`
- **Password**: `password123`
- **Access**: School-specific admin functions

### Teacher
- **Email**: `teacher@school.com`
- **Password**: `password123`
- **Access**: Teacher functions

### Student
- **Email**: `student@school.com`
- **Password**: `password123`
- **Access**: Student portal

### Parent
- **Email**: `parent@school.com`
- **Password**: `password123`
- **Access**: Parent portal

## 🏗️ Project Structure

```
src/main/java/com/schoolms/
├── config/                 # Configuration classes
├── controller/             # REST controllers
├── dto/                   # Data Transfer Objects
├── entity/                # JPA entities
├── repository/            # Data repositories
├── security/              # Security configuration
├── service/               # Business logic services
└── SchoolManagementSystemApplication.java
```

## 🔧 Configuration

### Environment Variables
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT secret key
- `EMAIL_HOST` - SMTP host
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password

### Application Properties
- Database connection settings
- JWT configuration
- File upload settings
- Email configuration
- Logging configuration

## 🧪 Testing

```bash
# Run all tests
mvn test

# Run with coverage
mvn test jacoco:report
```

## 📦 Building for Production

```bash
# Build JAR file
mvn clean package

# Run JAR file
java -jar target/school-management-system-1.0.0.jar
```

## 🚀 Deployment

### Docker (Recommended)
```bash
# Build Docker image
docker build -t school-management-system .

# Run container
docker run -p 5000:5000 school-management-system
```

### Traditional Deployment
1. Build the JAR file
2. Configure production database
3. Set environment variables
4. Deploy to application server

## 🔒 Security Features

- **JWT Authentication** - Stateless token-based auth
- **Role-based Authorization** - Granular permission control
- **Multi-tenancy** - Complete data isolation
- **Password Encryption** - BCrypt password hashing
- **CORS Configuration** - Cross-origin request handling
- **Input Validation** - Request validation and sanitization

## 📊 Monitoring

- **Health Checks** - Application health monitoring
- **Actuator Endpoints** - Metrics and monitoring
- **Logging** - Comprehensive logging configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

---

**Built with ❤️ using Spring Boot**
