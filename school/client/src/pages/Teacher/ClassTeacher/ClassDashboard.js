import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  UserGroupIcon,
  AcademicCapIcon,
  CalendarIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

const ClassDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClassDashboard();
  }, []);

  const fetchClassDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/class-teacher/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setClassData(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching class dashboard:', error);
      setError('Failed to fetch class information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  const stats = classData?.stats || {};
  const topPerformers = classData?.topPerformers || [];
  const needsAttention = classData?.needsAttention || [];
  const recentActivity = classData?.recentActivity || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          My Class - {classData?.className || 'N/A'}
        </h1>
        <p className="text-gray-600 mt-2">
          Class Teacher: {user?.name} • {stats.totalStudents || 0} Students
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalStudents || 0}</p>
            </div>
            <UserGroupIcon className="w-12 h-12 text-indigo-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average GPA</p>
              <p className="text-3xl font-bold text-green-600">{stats.avgGPA || '0.0'}</p>
              <p className="text-xs text-gray-500">out of 10</p>
            </div>
            <AcademicCapIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attendance</p>
              <p className="text-3xl font-bold text-blue-600">{stats.avgAttendance || '0'}%</p>
            </div>
            <CalendarIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Class Rank</p>
              <p className="text-3xl font-bold text-purple-600">{stats.classRank || '-'}</p>
              <p className="text-xs text-gray-500">out of 12 classes</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate('/teacher/class/students')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
        >
          <UserGroupIcon className="w-8 h-8 text-indigo-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View All Students</h3>
          <p className="text-sm text-gray-600">Complete student profiles, grades, and records</p>
        </button>

        <button
          onClick={() => navigate('/teacher/class/attendance')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
        >
          <CalendarIcon className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mark Attendance</h3>
          <p className="text-sm text-gray-600">Take attendance for your class</p>
        </button>

        <button
          onClick={() => navigate('/teacher/class/grades')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
        >
          <ChartBarIcon className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Grades</h3>
          <p className="text-sm text-gray-600">See all subject grades and performance</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrophyIcon className="w-5 h-5 mr-2 text-yellow-500" />
              Top Performers
            </h2>
          </div>
          <div className="p-6">
            {topPerformers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No data available</p>
            ) : (
              <div className="space-y-4">
                {topPerformers.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        'bg-orange-300 text-orange-900'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">Roll No: {student.rollNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{student.gpa}</p>
                      <p className="text-xs text-gray-500">GPA</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Need Attention */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-500" />
              Need Attention
            </h2>
          </div>
          <div className="p-6">
            {needsAttention.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All students performing well!</p>
            ) : (
              <div className="space-y-4">
                {needsAttention.map((student, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">Roll No: {student.rollNumber}</p>
                      </div>
                      <button
                        onClick={() => navigate(`/teacher/class/students/${student.id}`)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        View
                      </button>
                    </div>
                    <div className="mt-2 space-y-1">
                      {student.issues.map((issue, idx) => (
                        <p key={idx} className="text-sm text-red-700">• {issue}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/teacher/class/parents')}
          className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Contact Parents
        </button>
        <button
          onClick={() => navigate('/teacher/class/reports')}
          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Generate Reports
        </button>
        <button
          onClick={() => navigate('/teacher/class/timetable')}
          className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          View Timetable
        </button>
      </div>
    </div>
  );
};

export default ClassDashboard;
