import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const SubjectDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjectDashboard();
  }, []);

  const fetchSubjectDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/subject-teacher/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSubjectData(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching subject dashboard:', error);
      setError('Failed to fetch subject information');
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

  const stats = subjectData?.stats || {};
  const mySubjects = subjectData?.subjects || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          My Subjects Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Teacher: {user?.name} • {mySubjects.length} Subject{mySubjects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalStudents || 0}</p>
              <p className="text-xs text-gray-500">Across all subjects</p>
            </div>
            <UserGroupIcon className="w-12 h-12 text-indigo-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Classes Teaching</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalClasses || 0}</p>
            </div>
            <AcademicCapIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Attendance</p>
              <p className="text-3xl font-bold text-green-600">{stats.avgAttendance || 0}%</p>
            </div>
            <CalendarIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Performance</p>
              <p className="text-3xl font-bold text-purple-600">{stats.avgGrade || 0}%</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* My Subjects */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">My Subjects</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySubjects.map((subject, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/teacher/subject/${subject.id}/students`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{subject.name}</h3>
                    <p className="text-sm text-gray-500">{subject.code}</p>
                  </div>
                  <AcademicCapIcon className="w-6 h-6 text-indigo-500" />
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <UserGroupIcon className="w-4 h-4 mr-2" />
                    <span>{subject.totalStudents} students</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <AcademicCapIcon className="w-4 h-4 mr-2" />
                    <span>{subject.classes.length} classes</span>
                  </div>
                </div>

                <div className="text-sm text-gray-500 mb-3">
                  <span className="font-medium">Classes:</span> {subject.classes.join(', ')}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/subject/${subject.id}/attendance`);
                    }}
                    className="text-xs px-3 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                  >
                    Attendance
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/subject/${subject.id}/grades`);
                    }}
                    className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100"
                  >
                    Grades
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/teacher/attendance')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
        >
          <CalendarIcon className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Mark Attendance</h3>
          <p className="text-sm text-gray-600">Take attendance for your classes</p>
        </button>

        <button
          onClick={() => navigate('/teacher/grades')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
        >
          <ChartBarIcon className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Grades</h3>
          <p className="text-sm text-gray-600">Record student grades and marks</p>
        </button>

        <button
          onClick={() => navigate('/teacher/timetable')}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
        >
          <ClockIcon className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Timetable</h3>
          <p className="text-sm text-gray-600">View your teaching schedule</p>
        </button>
      </div>
    </div>
  );
};

export default SubjectDashboard;
