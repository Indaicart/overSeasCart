import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const ClassStudents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClassStudents();
  }, []);

  const fetchClassStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/class-teacher/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.data.students || []);
        setClassInfo(data.data.classInfo);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching class students:', error);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 9) return 'text-green-600';
    if (gpa >= 7.5) return 'text-blue-600';
    if (gpa >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toString().includes(searchTerm)
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/teacher/class/dashboard')}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <UserGroupIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Class Students - {classInfo?.name || 'N/A'}
        </h1>
        <p className="text-gray-600 mt-2">
          Total Students: {students.length} • Class Teacher: {user?.name}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => alert('Export functionality')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Export List
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Roll No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  GPA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No students found matching your search' : 'No students in this class'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {student.rollNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.admissionNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.email}</div>
                      <div className="text-sm text-gray-500">{student.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-bold ${getGPAColor(student.gpa || 0)}`}>
                        {student.gpa || '0.0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-sm font-semibold rounded-full ${getAttendanceColor(student.attendancePercentage || 0)}`}>
                        {student.attendancePercentage || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/teacher/class/students/${student.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-indigo-600">{students.length}</p>
            <p className="text-sm text-gray-600">Total Students</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {students.filter(s => (s.attendancePercentage || 0) >= 90).length}
            </p>
            <p className="text-sm text-gray-600">Good Attendance (≥90%)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {students.filter(s => (s.gpa || 0) >= 8).length}
            </p>
            <p className="text-sm text-gray-600">High Performers (GPA ≥8)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {students.filter(s => (s.gpa || 0) < 6).length}
            </p>
            <p className="text-sm text-gray-600">Need Support (GPA <6)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassStudents;
