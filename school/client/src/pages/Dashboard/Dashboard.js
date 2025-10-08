import React from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import {
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  BellIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery('dashboard-stats', async () => {
    const response = await axios.get('/api/dashboard/stats');
    return response.data;
  });

  const { data: attendanceTrends } = useQuery('attendance-trends', async () => {
    const response = await axios.get('/api/dashboard/attendance-trends?days=7');
    return response.data;
  });

  const { data: topStudents } = useQuery('top-students', async () => {
    const response = await axios.get('/api/dashboard/top-students?limit=5');
    return response.data;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Students',
      value: stats?.overview?.totalStudents || 0,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Active Students',
      value: stats?.overview?.activeStudents || 0,
      icon: UserGroupIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Teachers',
      value: stats?.overview?.totalTeachers || 0,
      icon: AcademicCapIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Total Classes',
      value: stats?.overview?.totalClasses || 0,
      icon: BookOpenIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      name: 'Total Subjects',
      value: stats?.overview?.totalSubjects || 0,
      icon: DocumentTextIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      name: 'Total Parents',
      value: stats?.overview?.totalParents || 0,
      icon: UsersIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          Welcome to your school management system dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat) => (
          <div key={stat.name} className="stat-card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="stat-label">{stat.name}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Overview */}
        <div className="chart-container">
          <h3 className="chart-title">Attendance Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Attendance Rate</span>
              <span className="text-2xl font-bold text-green-600">
                {stats?.attendance?.attendanceRate || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${stats?.attendance?.attendanceRate || 0}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats?.attendance?.presentCount || 0}
                </p>
                <p className="text-sm text-gray-500">Present</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats?.attendance?.absentCount || 0}
                </p>
                <p className="text-sm text-gray-500">Absent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats?.attendance?.lateCount || 0}
                </p>
                <p className="text-sm text-gray-500">Late</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Collection */}
        <div className="chart-container">
          <h3 className="chart-title">Fee Collection</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Collection Rate</span>
              <span className="text-2xl font-bold text-blue-600">
                {stats?.fees?.collectionRate || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${stats?.fees?.collectionRate || 0}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  ${stats?.fees?.paidAmount || 0}
                </p>
                <p className="text-sm text-gray-500">Collected</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  ${stats?.fees?.pendingAmount || 0}
                </p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities and Top Students */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="chart-container">
          <h3 className="chart-title">Recent Students</h3>
          <div className="space-y-3">
            {stats?.recentActivities?.students?.map((student, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">
                    Admitted: {new Date(student.admissionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Students */}
        <div className="chart-container">
          <h3 className="chart-title">Top Performing Students</h3>
          <div className="space-y-3">
            {topStudents?.map((student, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-medium text-sm">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.className}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    {student.averagePercentage}%
                  </p>
                  <p className="text-xs text-gray-500">GPA: {student.averageGPA}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Distribution */}
      <div className="chart-container">
        <h3 className="chart-title">Student Distribution by Class</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {stats?.classDistribution?.map((cls, index) => (
            <div key={index} className="text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-blue-600 font-bold text-lg">
                  {cls.studentCount}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">{cls.className}</p>
              <p className="text-xs text-gray-500">{cls.classCode}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
