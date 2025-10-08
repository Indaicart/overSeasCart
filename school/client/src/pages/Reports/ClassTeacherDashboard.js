import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  AcademicCapIcon,
  CalendarIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  ChartBarIcon
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

const ClassTeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/role-reports/class-teacher/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching class teacher dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6"><div className="text-center py-12">Loading...</div></div>;
  }

  if (!data) {
    return <div className="p-6"><div className="text-center py-12 text-gray-500">No data available</div></div>;
  }

  // Prepare charts data
  const attendanceDistribution = [
    { name: '90-100%', value: data.students.filter(s => s.attendance_percentage >= 90).length },
    { name: '75-89%', value: data.students.filter(s => s.attendance_percentage >= 75 && s.attendance_percentage < 90).length },
    { name: '60-74%', value: data.students.filter(s => s.attendance_percentage >= 60 && s.attendance_percentage < 75).length },
    { name: '<60%', value: data.students.filter(s => s.attendance_percentage < 60).length }
  ];

  const gradeDistribution = [
    { name: 'A+/A', value: data.students.filter(s => s.average_grade === 'A+' || s.average_grade === 'A').length },
    { name: 'B+/B', value: data.students.filter(s => s.average_grade === 'B+' || s.average_grade === 'B').length },
    { name: 'C', value: data.students.filter(s => s.average_grade === 'C').length },
    { name: 'D/F', value: data.students.filter(s => s.average_grade === 'D' || s.average_grade === 'F').length }
  ];

  const subjectPerformance = data.subjectStats.map(subject => ({
    name: subject.subject_name,
    average: parseFloat(subject.class_average)
  }));

  // Get at-risk students
  const atRiskStudents = data.students.filter(
    s => s.attendance_percentage < 75 || s.average_percentage < 50
  );

  const topPerformers = [...data.students]
    .sort((a, b) => b.average_percentage - a.average_percentage)
    .slice(0, 5);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <UsersIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Class {data.class.name} Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Class Teacher: {data.teacher.name} • Total Students: {data.students.length}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Students</p>
              <p className="text-3xl font-bold mt-1">{data.students.length}</p>
            </div>
            <UsersIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Class Average</p>
              <p className="text-3xl font-bold mt-1">{data.classStats.averagePercentage}%</p>
            </div>
            <AcademicCapIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Avg Attendance</p>
              <p className="text-3xl font-bold mt-1">{data.classStats.averageAttendance}%</p>
            </div>
            <CalendarIcon className="w-12 h-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">At-Risk Students</p>
              <p className="text-3xl font-bold mt-1">{atRiskStudents.length}</p>
            </div>
            <ExclamationCircleIcon className="w-12 h-12 text-red-200" />
          </div>
        </div>
      </div>

      {/* Alerts for At-Risk Students */}
      {atRiskStudents.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationCircleIcon className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ Students Needing Attention</h3>
              <div className="space-y-1">
                {atRiskStudents.slice(0, 5).map((student, index) => (
                  <p key={index} className="text-sm text-red-800">
                    • <strong>{student.student_name}</strong> (Roll: {student.roll_number}) - 
                    {student.attendance_percentage < 75 && ` Low Attendance: ${student.attendance_percentage}%`}
                    {student.average_percentage < 50 && ` Poor Performance: ${student.average_percentage}%`}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          {['overview', 'performance', 'attendance', 'students'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                selectedTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Attendance Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {attendanceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Grade Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#4F46E5" name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrophyIcon className="w-6 h-6 text-yellow-500 mr-2" />
              Top 5 Performers
            </h2>
            <div className="space-y-3">
              {topPerformers.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-indigo-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">{student.student_name}</p>
                      <p className="text-sm text-gray-500">Roll No: {student.roll_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">{student.average_percentage}%</p>
                    <p className="text-sm text-gray-500">Grade: {student.average_grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'performance' && (
        <div className="space-y-6">
          {/* Subject Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Performance</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" fill="#4F46E5" name="Class Average %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Stats Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class Average
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Highest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lowest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students Assessed
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.subjectStats.map((subject, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {subject.subject_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-indigo-600">
                        {subject.class_average}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                      {subject.highest_score}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">
                      {subject.lowest_score}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {subject.students_assessed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">✅ Excellent (&gt;90%)</h3>
              <p className="text-3xl font-bold text-green-600">
                {data.students.filter(s => s.attendance_percentage >= 90).length}
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Warning (75-89%)</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {data.students.filter(s => s.attendance_percentage >= 75 && s.attendance_percentage < 90).length}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-2">❌ Critical (&lt;75%)</h3>
              <p className="text-3xl font-bold text-red-600">
                {data.students.filter(s => s.attendance_percentage < 75).length}
              </p>
            </div>
          </div>

          {/* Student Attendance Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attendance %
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...data.students].sort((a, b) => a.roll_number - b.roll_number).map((student, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.roll_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.student_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-semibold ${
                        student.attendance_percentage >= 90 ? 'text-green-600' :
                        student.attendance_percentage >= 75 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {student.attendance_percentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.present_days} / {student.total_days}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.attendance_percentage >= 90 ? 'bg-green-100 text-green-800' :
                        student.attendance_percentage >= 75 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {student.attendance_percentage >= 90 ? 'Excellent' :
                         student.attendance_percentage >= 75 ? 'Warning' : 'Critical'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedTab === 'students' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Students</h2>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...data.students].sort((a, b) => a.roll_number - b.roll_number).map((student, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.roll_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.student_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-indigo-600">
                      {student.average_percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.average_grade === 'A+' || student.average_grade === 'A' ? 'bg-green-100 text-green-800' :
                      student.average_grade === 'B' || student.average_grade === 'B+' ? 'bg-blue-100 text-blue-800' :
                      student.average_grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.average_grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.attendance_percentage}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/teacher/class/students/${student.student_id}`)}
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
      )}
    </div>
  );
};

export default ClassTeacherDashboard;
