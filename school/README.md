# School Management System - Multi-Tenant SaaS Platform

A comprehensive **multi-tenant subscription-based** school management system built with React and PostgreSQL, featuring **dual backend support** (Spring Boot and Node.js). This platform allows multiple schools to use the same system with isolated data and provides all the essential features needed to run schools efficiently.

## 🏢 Multi-Tenant Architecture

This system is designed as a **Software-as-a-Service (SaaS)** platform where:

- **Multiple schools** can use the same platform
- **Data isolation** ensures each school's data is completely separate
- **Subscription-based** pricing with different plan tiers
- **Super admin** controls for platform management
- **School-specific admins** can manage their own school's data
- **Scalable architecture** to support hundreds of schools

## 🚀 Dual Backend Support

This project features **both backend implementations** for maximum flexibility:

### **Spring Boot Backend (Primary) 🏆**
- ✅ **Enterprise-grade** performance and security
- ✅ **Better scalability** for multiple schools
- ✅ **Industry standard** for large applications
- ✅ **Advanced features** (monitoring, caching, etc.)
- ✅ **Long-term support** and community

### **Node.js Backend (Alternative)**
- ✅ **Quick prototyping** and development
- ✅ **JavaScript ecosystem** familiarity
- ✅ **Faster development** for small teams
- ✅ **Simpler deployment** scenarios

**Focus**: Spring Boot | **Backup**: Node.js | **Frontend**: React

## Features

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
- Grade analytics and performance tracking
- Report card generation

### 💰 Financial Management
- Fee structure management
- Payment tracking and collection
- Overdue fee monitoring
- Financial reports and analytics
- Multiple payment methods

### 👨‍👩‍👧‍👦 Parent Portal
- Parent-student relationship management
- Access to child's academic progress
- Attendance and grade monitoring
- Communication with teachers
- Fee payment tracking

### 📅 Timetable Management
- Class schedule creation
- Teacher-subject assignments
- Room allocation
- Time conflict detection
- Schedule optimization

### 📄 Document Management
- File upload and organization
- Document categorization
- Access control and permissions
- Version management
- Document sharing

### 🔔 Notification System
- Real-time notifications
- Email notifications
- Category-based notifications
- User-specific alerts
- System announcements

### 📊 Analytics & Reporting
- Comprehensive dashboard
- Student performance analytics
- Attendance trends
- Financial reports
- Teacher workload analysis
- Custom report generation

### 🏢 Platform Management (Super Admin)
- Multi-tenant school management
- **Super Admin account management** - Create, edit, and manage multiple super admin accounts
- **Self-service school registration** - Schools can register themselves and choose plans
- Subscription and billing management
- Platform-wide analytics and reporting
- School onboarding and setup
- Usage monitoring and limits
- Revenue tracking and analytics

### 🏫 School Admin Features
- **Internal admin management** - Add multiple administrators for your school
- **Granular permissions** - Control what each admin can access
- **Teacher and student management** - Complete control over school operations
- **Subscription management** - View and manage your school's subscription
- **Self-service registration** - Choose your plan and start immediately

### 💳 Subscription Management
- Multiple pricing tiers (Basic, Standard, Premium, Enterprise)
- Flexible billing cycles (monthly/annual)
- Usage-based limits and monitoring
- Automated billing and invoicing
- Trial periods and upgrades
- Revenue analytics and reporting

## Technology Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **Knex.js** - SQL query builder
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email notifications

### Development Tools
- **Concurrently** - Run multiple commands
- **Nodemon** - Development server
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd school-management-system
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb school_management

# Copy environment file
cp server/env.example server/.env

# Edit server/.env with your database credentials
```

### 4. Environment Configuration
Update `server/.env` with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 5. Database Migration
```bash
cd server
npm run migrate
npm run seed
```

### 6. Start the Application
```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run server  # Backend only
npm run client  # Frontend only
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Default Accounts

After running the seed script, you can use these default accounts:

### Super Admin Account (Platform Management)
- Email: superadmin@schoolms.com
- Password: superadmin123
- Access: Full platform management, school creation, subscription management

### School Admin Account
- Email: admin@school.com
- Password: password123
- Access: School-specific admin functions

### Teacher Account
- Email: teacher@school.com
- Password: password123
- Access: Teacher functions within assigned school

### Student Account
- Email: student@school.com
- Password: password123
- Access: Student portal within assigned school

### Parent Account
- Email: parent@school.com
- Password: password123
- Access: Parent portal for child's school

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Student Management
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Teacher Management
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create new teacher
- `GET /api/teachers/:id` - Get teacher by ID
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Class Management
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `GET /api/classes/:id` - Get class by ID
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Attendance Management
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/class/:classId/date/:date` - Get class attendance
- `GET /api/attendance/student/:studentId` - Get student attendance
- `GET /api/attendance/class/:classId/summary` - Get attendance summary

### Grade Management
- `POST /api/grades` - Add grade
- `GET /api/grades/student/:studentId` - Get student grades
- `GET /api/grades/class/:classId` - Get class grades
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade

### Fee Management
- `POST /api/fees` - Create fee record
- `GET /api/fees/student/:studentId` - Get student fees
- `PUT /api/fees/:id/pay` - Record payment
- `GET /api/fees/overdue` - Get overdue fees

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/attendance-trends` - Get attendance trends
- `GET /api/dashboard/grade-distribution` - Get grade distribution
- `GET /api/dashboard/top-students` - Get top performing students

### Platform Management (Super Admin)
- `GET /api/platform/stats` - Get platform statistics
- `GET /api/platform/analytics` - Get platform analytics
- `GET /api/platform/top-schools` - Get top performing schools
- `GET /api/schools` - Get all schools
- `POST /api/schools` - Create new school
- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription

## Project Structure

```
school-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── middleware/         # Express middleware
│   ├── migrations/         # Database migrations
│   ├── routes/             # API routes
│   ├── seeds/              # Database seeds
│   ├── index.js            # Server entry point
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@schoolms.com or create an issue in the repository.

## Subscription Plans

### Basic Plan - $29.99/month
- Up to 100 students
- Up to 10 teachers
- 5GB storage
- Basic features
- Email support

### Standard Plan - $59.99/month
- Up to 500 students
- Up to 25 teachers
- 20GB storage
- Advanced analytics
- Priority support

### Premium Plan - $99.99/month
- Up to 1,000 students
- Up to 50 teachers
- 50GB storage
- Custom branding
- API access
- Phone support

### Enterprise Plan - $199.99/month
- Unlimited students
- Unlimited teachers
- 200GB storage
- White-label solution
- Dedicated support
- Custom development

## Business Model

This system is designed as a **recurring revenue SaaS business**:

1. **Multiple Schools**: Each school pays a monthly/annual subscription
2. **Scalable Pricing**: Different tiers based on school size and needs
3. **Platform Management**: Super admin can manage all schools from one dashboard
4. **Data Isolation**: Each school's data is completely separate and secure
5. **Easy Onboarding**: Super admin can quickly add new schools
6. **Usage Monitoring**: Track usage and enforce limits per subscription plan

## Roadmap

- [ ] Stripe payment integration
- [ ] Automated billing and invoicing
- [ ] Mobile app development
- [ ] Advanced reporting features
- [ ] Integration with external systems
- [ ] Multi-language support
- [ ] Advanced analytics and AI insights
- [ ] Cloud deployment options
- [ ] API rate limiting and caching
- [ ] Advanced security features
- [ ] White-label customization
- [ ] Multi-currency support
