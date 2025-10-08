import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import SchoolLogin from './pages/Auth/SchoolLogin';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Dashboard from './pages/Dashboard/Dashboard';
import Students from './pages/Students/Students';
import Teachers from './pages/Teachers/Teachers';
import Classes from './pages/Classes/Classes';
import Subjects from './pages/Subjects/Subjects';
import Attendance from './pages/Attendance/Attendance';
import Grades from './pages/Grades/Grades';
import Fees from './pages/Fees/Fees';
import Parents from './pages/Parents/Parents';
import Timetable from './pages/Timetable/Timetable';
import Documents from './pages/Documents/Documents';
import Notifications from './pages/Notifications/Notifications';
import Profile from './pages/Profile/Profile';
import PlatformDashboard from './pages/Platform/PlatformDashboard';
import SchoolManagement from './pages/Platform/SchoolManagement';
import SuperAdminManagement from './pages/Admin/SuperAdminManagement';
import InternalAdminManagement from './pages/Admin/InternalAdminManagement';
import SchoolRegistration from './pages/Public/SchoolRegistration';
import MyGrades from './pages/Student/MyGrades';
import MyAttendance from './pages/Student/MyAttendance';
import MyFees from './pages/Student/MyFees';
import MyTimetable from './pages/Student/MyTimetable';
import MyAssignments from './pages/Student/MyAssignments';
import MyDocuments from './pages/Student/MyDocuments';
import MyChildren from './pages/Parent/MyChildren';
import ChildGrades from './pages/Parent/ChildGrades';
import ChildAttendance from './pages/Parent/ChildAttendance';
import ChildFees from './pages/Parent/ChildFees';
import SubjectTeacherDashboard from './pages/Teacher/SubjectTeacher/Dashboard';
import SubjectStudents from './pages/Teacher/SubjectTeacher/SubjectStudents';
import SubjectAttendance from './pages/Teacher/SubjectTeacher/SubjectAttendance';
import SubjectGrades from './pages/Teacher/SubjectTeacher/SubjectGrades';
import ActivityLogs from './pages/Admin/ActivityLogs';
import BulkOperations from './pages/Admin/BulkOperations';
import SurveyList from './pages/Surveys/SurveyList';
import CreateSurvey from './pages/Surveys/CreateSurvey';
import TakeSurvey from './pages/Surveys/TakeSurvey';
import GradeSurvey from './pages/Surveys/GradeSurvey';
import SurveyResults from './pages/Surveys/SurveyResults';
import ReportsDashboard from './pages/Reports/ReportsDashboard';
import StudentDashboard from './pages/Reports/StudentDashboard';
import ParentDashboard from './pages/Reports/ParentDashboard';
import ClassTeacherDashboard from './pages/Reports/ClassTeacherDashboard';
import SubjectTeacherReportsDashboard from './pages/Reports/SubjectTeacherDashboard';
import FeePayment from './pages/Payments/FeePayment';
import PaymentHistory from './pages/Payments/PaymentHistory';
import PaymentReceipt from './pages/Payments/PaymentReceipt';
import StaffPayroll from './pages/Payroll/StaffSalaryList';
import ConfigureSalary from './pages/Payroll/ConfigureSalary';
import ProcessPayment from './pages/Payroll/ProcessPayment';
import PendingPayments from './pages/Payroll/PendingPayments';
import PaymentHistoryStaff from './pages/Payroll/PaymentHistory';
import SalarySlip from './pages/Payroll/SalarySlip';
import LeaveManagement from './pages/Leaves/LeaveManagement';
import ApplyLeave from './pages/Leaves/ApplyLeave';
import MyLeaves from './pages/Leaves/MyLeaves';
import LeaveApprovals from './pages/Leaves/LeaveApprovals';
import LeaveCalendar from './pages/Leaves/LeaveCalendar';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!user ? <SchoolLogin /> : <Navigate to="/dashboard" replace />} />
      <Route path="/old-login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} />
      <Route path="/school-registration" element={!user ? <SchoolRegistration /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Student Management */}
        <Route path="students" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <Students />
          </ProtectedRoute>
        } />
        
        {/* Teacher Management */}
        <Route path="teachers" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <Teachers />
          </ProtectedRoute>
        } />
        
        {/* Class Management */}
        <Route path="classes" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <Classes />
          </ProtectedRoute>
        } />
        
        {/* Subject Management */}
        <Route path="subjects" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <Subjects />
          </ProtectedRoute>
        } />
        
        {/* Attendance */}
        <Route path="attendance" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <Attendance />
          </ProtectedRoute>
        } />
        
        {/* Grades */}
        <Route path="grades" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <Grades />
          </ProtectedRoute>
        } />
        
        {/* Fees */}
        <Route path="fees" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <Fees />
          </ProtectedRoute>
        } />
        
        {/* Parents */}
        <Route path="parents" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher', 'parent']}>
            <Parents />
          </ProtectedRoute>
        } />
        
        {/* Timetable */}
        <Route path="timetable" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <Timetable />
          </ProtectedRoute>
        } />
        
        {/* Documents */}
        <Route path="documents" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <Documents />
          </ProtectedRoute>
        } />
        
        {/* Notifications */}
        <Route path="notifications" element={<Notifications />} />
        
        {/* Profile */}
        <Route path="profile" element={<Profile />} />
        
        {/* Internal Admin Management (School Admin Only) */}
        <Route path="internal-admins" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <InternalAdminManagement />
          </ProtectedRoute>
        } />
        
        {/* Activity Logs (School Admin Only) */}
        <Route path="activity-logs" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ActivityLogs />
          </ProtectedRoute>
        } />
        
        {/* Bulk Operations (School Admin Only) */}
        <Route path="bulk-operations" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BulkOperations />
          </ProtectedRoute>
        } />
        
        {/* Reports & Analytics (Admin Only) */}
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReportsDashboard />
          </ProtectedRoute>
        } />
        
        {/* Student Dashboard */}
        <Route path="my-dashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        
        {/* Parent Dashboard */}
        <Route path="parent-dashboard" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        } />
        
        {/* Class Teacher Dashboard */}
        <Route path="class-teacher-dashboard" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <ClassTeacherDashboard />
          </ProtectedRoute>
        } />
        
        {/* Subject Teacher Reports Dashboard */}
        <Route path="subject-teacher-dashboard" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <SubjectTeacherReportsDashboard />
          </ProtectedRoute>
        } />
        
        {/* Surveys & Quizzes */}
        <Route path="surveys" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
            <SurveyList />
          </ProtectedRoute>
        } />
        <Route path="surveys/create" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <CreateSurvey />
          </ProtectedRoute>
        } />
        <Route path="surveys/:id/take" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher', 'student']}>
            <TakeSurvey />
          </ProtectedRoute>
        } />
        <Route path="surveys/:id/grade" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <GradeSurvey />
          </ProtectedRoute>
        } />
        <Route path="surveys/:id/results" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <SurveyResults />
          </ProtectedRoute>
        } />
        
        {/* Student Portal (Students Only) */}
        <Route path="student/grades" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyGrades />
          </ProtectedRoute>
        } />
        <Route path="student/attendance" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyAttendance />
          </ProtectedRoute>
        } />
        <Route path="student/fees" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyFees />
          </ProtectedRoute>
        } />
        <Route path="student/timetable" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyTimetable />
          </ProtectedRoute>
        } />
        <Route path="student/assignments" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyAssignments />
          </ProtectedRoute>
        } />
        <Route path="student/documents" element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyDocuments />
          </ProtectedRoute>
        } />
        
        {/* Parent Portal (Parents Only) */}
        <Route path="parent/children" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <MyChildren />
          </ProtectedRoute>
        } />
        <Route path="parent/child/:childId/grades" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ChildGrades />
          </ProtectedRoute>
        } />
        <Route path="parent/child/:childId/attendance" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ChildAttendance />
          </ProtectedRoute>
        } />
        <Route path="parent/child/:childId/fees" element={
          <ProtectedRoute allowedRoles={['parent']}>
            <ChildFees />
          </ProtectedRoute>
        } />
        
        {/* Payments */}
        <Route path="fee-payment" element={
          <ProtectedRoute allowedRoles={['admin', 'student', 'parent']}>
            <FeePayment />
          </ProtectedRoute>
        } />
        <Route path="payment-history" element={
          <ProtectedRoute allowedRoles={['admin', 'student', 'parent']}>
            <PaymentHistory />
          </ProtectedRoute>
        } />
        <Route path="payment-receipt/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'student', 'parent']}>
            <PaymentReceipt />
          </ProtectedRoute>
        } />
        
        {/* Subject Teacher Portal (Subject Teachers Only) */}
        <Route path="teacher/subject-dashboard" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <SubjectTeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="teacher/subject/:subjectId/students" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <SubjectStudents />
          </ProtectedRoute>
        } />
        <Route path="teacher/subject/:subjectId/attendance" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <SubjectAttendance />
          </ProtectedRoute>
        } />
        <Route path="teacher/subject/:subjectId/grades" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <SubjectGrades />
          </ProtectedRoute>
        } />
        
        {/* Platform Management (Super Admin Only) */}
        <Route path="platform" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <PlatformDashboard />
          </ProtectedRoute>
        } />
        <Route path="platform/schools" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SchoolManagement />
          </ProtectedRoute>
        } />
        <Route path="platform/super-admins" element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperAdminManagement />
          </ProtectedRoute>
        } />
        
        {/* Payroll (Admin Only) */}
        <Route path="payroll" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <StaffPayroll />
          </ProtectedRoute>
        } />
        <Route path="payroll/configure/:teacherId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ConfigureSalary />
          </ProtectedRoute>
        } />
        <Route path="payroll/process-payment/:teacherId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ProcessPayment />
          </ProtectedRoute>
        } />
        <Route path="payroll/pending-payments" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PendingPayments />
          </ProtectedRoute>
        } />
        <Route path="payroll/payment-history/:teacherId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PaymentHistoryStaff />
          </ProtectedRoute>
        } />
        <Route path="payroll/salary-slip/:id" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <SalarySlip />
          </ProtectedRoute>
        } />
        
        {/* Leave Management */}
        <Route path="leave-management" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <LeaveManagement />
          </ProtectedRoute>
        } />
        <Route path="apply-leave" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <ApplyLeave />
          </ProtectedRoute>
        } />
        <Route path="my-leaves" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <MyLeaves />
          </ProtectedRoute>
        } />
        <Route path="leave-approvals" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <LeaveApprovals />
          </ProtectedRoute>
        } />
        <Route path="leave-calendar" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <LeaveCalendar />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
