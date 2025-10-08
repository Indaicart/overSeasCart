const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const classRoutes = require('./routes/classes');
const subjectRoutes = require('./routes/subjects');
const attendanceRoutes = require('./routes/attendance');
const gradeRoutes = require('./routes/grades');
const feeRoutes = require('./routes/fees');
const parentRoutes = require('./routes/parents');
const notificationRoutes = require('./routes/notifications');
const documentRoutes = require('./routes/documents');
const timetableRoutes = require('./routes/timetable');
const dashboardRoutes = require('./routes/dashboard');
const subscriptionRoutes = require('./routes/subscriptions');
const schoolRoutes = require('./routes/schools');
const platformRoutes = require('./routes/platform');
const superAdminManagementRoutes = require('./routes/super-admin-management');
const schoolRegistrationRoutes = require('./routes/school-registration');
const internalAdminsRoutes = require('./routes/internal-admins');
const studentPortalRoutes = require('./routes/student-portal');
const parentPortalRoutes = require('./routes/parent-portal');
const classTeacherRoutes = require('./routes/class-teacher');
const subjectTeacherRoutes = require('./routes/subject-teacher');
const schoolLoginRoutes = require('./routes/school-login');
const surveyRoutes = require('./routes/surveys');
const surveyResponseRoutes = require('./routes/survey-responses');
const surveyAnalyticsRoutes = require('./routes/survey-analytics');
const activityLogsRoutes = require('./routes/activity-logs');
const passwordResetRoutes = require('./routes/password-reset');
const bulkOperationsRoutes = require('./routes/bulk-operations');
const reportsRoutes = require('./routes/reports');
const roleReportsRoutes = require('./routes/role-reports');
const paymentRoutes = require('./routes/payments');
const payrollRoutes = require('./routes/payroll');
const leaveRoutes = require('./routes/leaves');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
// Public routes (no authentication required)
app.use('/api/schools', schoolRegistrationRoutes);
app.use('/api/school-login', schoolLoginRoutes);
app.use('/api/password-reset', passwordResetRoutes);

// Protected routes (authentication required)
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/school-management', schoolRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/super-admin-management', superAdminManagementRoutes);
app.use('/api/schools/internal-admins', internalAdminsRoutes);
app.use('/api/student', studentPortalRoutes);
app.use('/api/parent', parentPortalRoutes);
app.use('/api/class-teacher', classTeacherRoutes);
app.use('/api/subject-teacher', subjectTeacherRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/survey-responses', surveyResponseRoutes);
app.use('/api/survey-analytics', surveyAnalyticsRoutes);
app.use('/api/activity-logs', authenticate, activityLogsRoutes);
app.use('/api/bulk', authenticate, bulkOperationsRoutes);
app.use('/api/reports', authenticate, reportsRoutes);
app.use('/api/role-reports', authenticate, roleReportsRoutes);
app.use('/api/payments', authenticate, paymentRoutes);
app.use('/api/payroll', authenticate, payrollRoutes);
app.use('/api/leaves', authenticate, leaveRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
