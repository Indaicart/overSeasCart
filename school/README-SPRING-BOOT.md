# School Management System - Multi-Tenant SaaS Platform

A comprehensive **multi-tenant subscription-based** school management system built with React, Spring Boot, and PostgreSQL. This platform allows multiple schools to use the same system with isolated data and provides all the essential features needed to run schools efficiently.

## 🏢 Multi-Tenant Architecture

This system is designed as a **Software-as-a-Service (SaaS)** platform where:

- **Multiple schools** can use the same platform
- **Data isolation** ensures each school's data is completely separate
- **Subscription-based** pricing with different plan tiers
- **Super admin** controls for platform management
- **School-specific admins** can manage their own school's data
- **Scalable architecture** to support hundreds of schools

## 🚀 Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client

### Backend
- **Spring Boot 3.2.0** - Enterprise Java framework
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Data persistence layer
- **Hibernate** - ORM framework
- **JWT** - Token-based authentication
- **Maven** - Build and dependency management

### Database
- **PostgreSQL** - Primary database
- **Database Migrations** - Schema versioning

### Development Tools
- **Java 17** - Programming language
- **Maven** - Build tool
- **Git** - Version control

## 🎯 Features

### 🎓 Student Management
- Complete student profiles with personal information
- Student enrollment and admission tracking
- Class and section assignments
- Student status management (active, graduated, transferred, etc.)
- Parent/guardian relationships
- Medical information and emergency contacts

### 👨‍🏫 Teacher Management
- Teacher profiles with qualifications and specializations
- Department and subject assignments
- Employment tracking and salary management
- Teacher workload monitoring
- Performance metrics

### 📚 Academic Management
- Class and section management
- Subject and curriculum management
- Timetable creation and management
- Grade level organization
- Course material tracking

### 📊 Attendance System
- Daily attendance tracking
- Multiple attendance statuses (present, absent, late, excused)
- Attendance reports and analytics
- Class-wise attendance summaries
- Student attendance history

### 📈 Grade Management
- Assessment and grading system
- Multiple assessment types (exams, quizzes, assignments, projects)
- GPA calculation and grade letters
- Grade reports and transcripts
- Academic performance analytics

### 💰 Fee Management
- Fee structure configuration
- Fee collection tracking
- Payment history and receipts
- Outstanding fee reports
- Fee waiver and discount management

### 📅 Timetable Management
- Class schedule creation
- Teacher assignment to subjects
- Room and resource allocation
- Schedule conflict detection
- Timetable printing and sharing

### 📄 Document Management
- File upload and storage
- Document categorization
- Access control and permissions
- Version control
- Document sharing

### 🔔 Notification System
- Real-time notifications
- Email notifications
- SMS integration (optional)
- Notification preferences
- Broadcast messaging

### 👨‍👩‍👧‍👦 Parent Portal
- Student progress monitoring
- Attendance tracking
- Fee payment status
- Communication with teachers
- Academic reports access

### 🏢 Platform Management (Super Admin)
- School onboarding and management
- Subscription plan management
- Billing and payment processing
- Platform analytics and reporting
- User management across schools
- System configuration

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- Node.js 16+ (for frontend)

### 1. Database Setup
```sql
CREATE DATABASE school_management;
```

### 2. Backend Setup (Spring Boot)
```bash
# Navigate to Spring Boot directory
cd spring-backend

# Install dependencies
mvn clean install

# Run the application
mvn spring-boot:run

# Or use the provided script
# Windows: run.bat
# Linux/Mac: ./run.sh
```

### 3. Frontend Setup (React)
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start the development server
npm start
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🔐 Default Accounts

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

## 📁 Project Structure

```
school-management-system/
├── spring-backend/              # Spring Boot backend
│   ├── src/main/java/com/schoolms/
│   │   ├── config/             # Configuration classes
│   │   ├── controller/         # REST controllers
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── entity/            # JPA entities
│   │   ├── repository/        # Data repositories
│   │   ├── security/          # Security configuration
│   │   └── service/           # Business logic services
│   ├── src/main/resources/
│   │   └── application.yml    # Application configuration
│   ├── pom.xml               # Maven dependencies
│   └── README.md             # Backend documentation
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   └── App.js           # Main app component
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # Tailwind configuration
├── ui-demo.html             # UI demo file
├── MIGRATION_GUIDE.md       # Migration documentation
└── README.md               # This file
```

## 🔧 Configuration

### Backend Configuration
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

server:
  port: 5000
  servlet:
    context-path: /api
```

### Frontend Configuration
Update `client/src/contexts/AuthContext.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 🧪 Testing

### Backend Testing
```bash
cd spring-backend
mvn test
```

### Frontend Testing
```bash
cd client
npm test
```

## 📦 Building for Production

### Backend
```bash
cd spring-backend
mvn clean package
java -jar target/school-management-system-1.0.0.jar
```

### Frontend
```bash
cd client
npm run build
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Traditional Deployment
1. Build the Spring Boot JAR file
2. Build the React frontend
3. Configure production database
4. Deploy to application server
5. Set up reverse proxy (Nginx)

## 🔒 Security Features

- **JWT Authentication** - Stateless token-based authentication
- **Role-based Authorization** - Granular permission control
- **Multi-tenancy** - Complete data isolation between schools
- **Password Encryption** - BCrypt password hashing
- **CORS Configuration** - Cross-origin request handling
- **Input Validation** - Request validation and sanitization
- **SQL Injection Protection** - JPA/Hibernate protection
- **XSS Protection** - Input sanitization

## 📊 Monitoring and Analytics

- **Health Checks** - Application health monitoring
- **Actuator Endpoints** - Metrics and monitoring
- **Logging** - Comprehensive logging configuration
- **Performance Metrics** - Application performance tracking
- **Usage Analytics** - Platform usage statistics

## 🎯 Business Model

### Subscription Plans

#### Basic Plan - $29/month
- Up to 100 students
- Up to 10 teachers
- Basic features
- Email support

#### Professional Plan - $79/month
- Up to 500 students
- Up to 50 teachers
- Advanced features
- Priority support
- Custom reports

#### Enterprise Plan - $199/month
- Unlimited students
- Unlimited teachers
- All features
- 24/7 support
- Custom integrations
- Dedicated account manager

### Revenue Streams
- Monthly/annual subscriptions
- Setup and onboarding fees
- Custom development services
- Training and support services
- Premium integrations

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
- Contact the development team

---

**Built with ❤️ using Spring Boot and React**
