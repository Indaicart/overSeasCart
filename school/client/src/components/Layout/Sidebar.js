import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  BellIcon,
  UserIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon as SurveyIcon,
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['admin', 'teacher', 'student', 'parent'] },
    
    // Admin & Teacher sections
    { name: 'Students', href: '/students', icon: UserGroupIcon, roles: ['admin', 'teacher'] },
    { name: 'Teachers', href: '/teachers', icon: AcademicCapIcon, roles: ['admin', 'teacher'] },
    { name: 'Classes', href: '/classes', icon: BookOpenIcon, roles: ['admin', 'teacher'] },
    { name: 'Subjects', href: '/subjects', icon: ClipboardDocumentListIcon, roles: ['admin', 'teacher'] },
    { name: 'Attendance', href: '/attendance', icon: ChartBarIcon, roles: ['admin', 'teacher'] },
    { name: 'Grades', href: '/grades', icon: ChartBarIcon, roles: ['admin', 'teacher'] },
    { name: 'Fees', href: '/fees', icon: CurrencyDollarIcon, roles: ['admin', 'teacher'] },
    { name: 'Parents', href: '/parents', icon: UsersIcon, roles: ['admin', 'teacher', 'parent'] },
    { name: 'Timetable', href: '/timetable', icon: CalendarIcon, roles: ['admin', 'teacher'] },
    { name: 'Documents', href: '/documents', icon: DocumentTextIcon, roles: ['admin', 'teacher'] },
    { name: 'Internal Admins', href: '/internal-admins', icon: UsersIcon, roles: ['admin'] },
    { name: 'Activity Logs', href: '/activity-logs', icon: ClockIcon, roles: ['admin'] },
    { name: 'Bulk Operations', href: '/bulk-operations', icon: ArrowUpTrayIcon, roles: ['admin'] },
    { name: 'Surveys & Quizzes', href: '/surveys', icon: SurveyIcon, roles: ['admin', 'teacher', 'student'] },
    { name: 'Reports & Analytics', href: '/reports', icon: ChartBarIcon, roles: ['admin'] },
    
    // Subject Teacher Portal sections
    { name: 'My Subjects', href: '/teacher/subject-dashboard', icon: BookOpenIcon, roles: ['teacher'] },
    
    // Student Portal sections
    { name: 'My Dashboard', href: '/my-dashboard', icon: ChartBarIcon, roles: ['student'] },
    { name: 'My Grades', href: '/student/grades', icon: ChartBarIcon, roles: ['student'] },
    { name: 'My Attendance', href: '/student/attendance', icon: CalendarIcon, roles: ['student'] },
    { name: 'My Fees', href: '/student/fees', icon: CurrencyDollarIcon, roles: ['student'] },
    { name: 'My Timetable', href: '/student/timetable', icon: ClockIcon, roles: ['student'] },
    { name: 'My Assignments', href: '/student/assignments', icon: DocumentTextIcon, roles: ['student'] },
    { name: 'My Documents', href: '/student/documents', icon: DocumentTextIcon, roles: ['student'] },
    { name: 'Pay Fees', href: '/fee-payment', icon: CurrencyDollarIcon, roles: ['student', 'parent'] },
    { name: 'Payment History', href: '/payment-history', icon: ClockIcon, roles: ['student', 'parent', 'admin'] },
    
    // Payroll (Admin Only)
    { name: 'Staff Payroll', href: '/payroll', icon: CurrencyDollarIcon, roles: ['admin'] },
    { name: 'Pending Payments', href: '/payroll/pending-payments', icon: ClockIcon, roles: ['admin'] },
    
    // Leave Management
    { name: 'Leave Management', href: '/leave-management', icon: CalendarIcon, roles: ['admin'] },
    { name: 'Leave Approvals', href: '/leave-approvals', icon: ClockIcon, roles: ['admin'] },
    { name: 'Leave Calendar', href: '/leave-calendar', icon: CalendarIcon, roles: ['admin'] },
    { name: 'My Leaves', href: '/my-leaves', icon: CalendarIcon, roles: ['teacher'] },
    { name: 'Apply Leave', href: '/apply-leave', icon: DocumentTextIcon, roles: ['teacher'] },
    
    // Parent Portal sections
    { name: 'My Children Dashboard', href: '/parent-dashboard', icon: ChartBarIcon, roles: ['parent'] },
    { name: 'My Children', href: '/parent/children', icon: UserGroupIcon, roles: ['parent'] },
    
    // Teacher Dashboards
    { name: 'Class Dashboard', href: '/class-teacher-dashboard', icon: ChartBarIcon, roles: ['teacher'] },
    { name: 'Subject Dashboard', href: '/subject-teacher-dashboard', icon: ChartBarIcon, roles: ['teacher'] },
    
    // Common sections
    { name: 'Notifications', href: '/notifications', icon: BellIcon, roles: ['admin', 'teacher', 'student', 'parent'] },
    { name: 'Profile', href: '/profile', icon: UserIcon, roles: ['admin', 'teacher', 'student', 'parent'] },
  ];

  const platformNavigation = [
    { name: 'Platform Dashboard', href: '/platform', icon: HomeIcon, roles: ['super_admin'] },
    { name: 'School Management', href: '/platform/schools', icon: BuildingOfficeIcon, roles: ['super_admin'] },
    { name: 'Super Admin Management', href: '/platform/super-admins', icon: ShieldCheckIcon, roles: ['super_admin'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const filteredPlatformNavigation = platformNavigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">SchoolMS</h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={`
                    sidebar-link
                    ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          {/* Platform Management Section for Super Admins */}
          {filteredPlatformNavigation.length > 0 && (
            <>
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Platform Management
                </h3>
              </div>
              <div className="mt-2 space-y-1">
                {filteredPlatformNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={`
                        sidebar-link
                        ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}
                      `}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </>
          )}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
