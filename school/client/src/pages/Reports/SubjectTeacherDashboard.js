import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpenIcon,
  AcademicCapIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

const SubjectTeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/role-reports/subject-teacher/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        if (result.data.subjects.length > 0) {
          setSelectedSubject(result.data.subjects[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching subject teacher dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6"><div className="text-center py-12">Loading...</div></div>;
  }

  if (!data || !data.subjects || data.subjects.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-gray-500">
          No subjects assigned. Please contact administrator.
        </div>
      </div>
    );
  }

  const currentSubject = selectedSubject || data.subjects[0];

  // Prepare grade distribution for selected subject
  const gradeDistribution = currentSubject.performance.gradeDistribution.map(item => ({
    name: item.grade,
    value: parseInt(item.count)
  }));

  // Prepare class-wise performance
  const classPerformance = currentSubject.classes.map(cls => ({
    name: cls.class_name,
    average: parseFloat(cls.average),
    students: cls.studentCount
  }));

  // Get low performers
  const lowPerformers = currentSubject.performance.lowPerformers || [];
  const topPerformers = currentSubject.performance.topPerformers || [];

  // Calculate alerts
  const alerts = [];
  data.subjects.forEach(subject => {
    if (subject.performance.classAverage < 50) {
      alerts.push({
        type: 'error',
        subject: subject.name,
        message: `Critical: Class average is ${subject.performance.classAverage}%`
      });
    }
    if (subject.performance.lowPerformers.length >= 5) {
      alerts.push({
        type: 'warning',
        subject: subject.name,
        message: `${subject.performance.lowPerformers.length} students scoring below 40%`
      });
    }
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <BookOpenIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Subject Teacher Dashboard
        </h1>
        <p className="text-gray-600 mt-1">Teacher: {data.teacher.name}</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Alerts</h3>
              <div className="space-y-1">
                {alerts.slice(0, 5).map((alert, index) => (
                  <p key={index} className="text-sm text-yellow-800">
                    • <strong>{alert.subject}:</strong> {alert.message}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Subjects</p>
              <p className="text-3xl font-bold mt-1">{data.subjects.length}</p>
            </div>
            <BookOpenIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Students</p>
              <p className="text-3xl font-bold mt-1">
                {data.subjects.reduce((sum, s) => sum + s.totalStudents, 0)}
              </p>
            </div>
            <UsersIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg Performance</p>
              <p className="text-3xl font-bold mt-1">
                {(data.subjects.reduce((sum, s) => sum + parseFloat(s.performance.classAverage), 0) / data.subjects.length).toFixed(1)}%
              </p>
            </div>
            <AcademicCapIcon className="w-12 h-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Total Classes</p>
              <p className="text-3xl font-bold mt-1">
                {data.subjects.reduce((sum, s) => sum + s.classes.length, 0)}
              </p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Subject Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
        <select
          value={currentSubject.id}
          onChange={(e) => {
            const subject = data.subjects.find(s => s.id === parseInt(e.target.value));
            setSelectedSubject(subject);
          }}
          className="block w-full md:w-1/2 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {data.subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name} ({subject.totalStudents} students, {subject.classes.length} classes)
            </option>
          ))}
        </select>
      </div>

      {/* Subject Overview */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white mb-6">
        <h2 className="text-2xl font-bold mb-4">{currentSubject.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-indigo-100 text-sm">Total Students</p>
            <p className="text-2xl font-bold">{currentSubject.totalStudents}</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Class Average</p>
            <p className="text-2xl font-bold">{currentSubject.performance.classAverage}%</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Highest Score</p>
            <p className="text-2xl font-bold">{currentSubject.performance.highest}%</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Lowest Score</p>
            <p className="text-2xl font-bold">{currentSubject.performance.lowest}%</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Grade Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Class-wise Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Class-wise Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#4F46E5" name="Average %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top & Low Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🏆 Top Performers
          </h2>
          {topPerformers.length > 0 ? (
            <div className="space-y-3">
              {topPerformers.slice(0, 5).map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-green-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">{student.student_name}</p>
                      <p className="text-sm text-gray-500">{student.class_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">{student.average}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </div>

        {/* Low Performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            ⚠️ Students Needing Attention
          </h2>
          {lowPerformers.length > 0 ? (
            <div className="space-y-3">
              {lowPerformers.slice(0, 5).map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{student.student_name}</p>
                    <p className="text-sm text-gray-500">{student.class_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-600">{student.average}%</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">All students performing well! 🎉</p>
          )}
        </div>
      </div>

      {/* Class Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Class-wise Details</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Students
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class Average
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentSubject.classes.map((cls, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {cls.class_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cls.studentCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-lg font-semibold ${
                    cls.average >= 75 ? 'text-green-600' :
                    cls.average >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {cls.average}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-semibold ${
                    cls.attendanceRate >= 90 ? 'text-green-600' :
                    cls.attendanceRate >= 75 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {cls.attendanceRate}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => navigate(`/teacher/subject/${currentSubject.id}/students?class=${cls.class_id}`)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    View Students
                  </button>
                  <button
                    onClick={() => navigate(`/teacher/subject/${currentSubject.id}/grades?class=${cls.class_id}`)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Manage Grades
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* All Subjects Summary */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All My Subjects Overview</h2>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Classes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Students
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class Average
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.subjects.map((subject, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {subject.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subject.classes.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subject.totalStudents}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-lg font-semibold ${
                    subject.performance.classAverage >= 75 ? 'text-green-600' :
                    subject.performance.classAverage >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {subject.performance.classAverage}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    subject.performance.classAverage >= 75 ? 'bg-green-100 text-green-800' :
                    subject.performance.classAverage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {subject.performance.classAverage >= 75 ? 'Excellent' :
                     subject.performance.classAverage >= 50 ? 'Average' : 'Needs Attention'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => setSelectedSubject(subject)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubjectTeacherDashboard;
