import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const SubjectStudents = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  useEffect(() => {
    fetchSubjectStudents();
  }, [subjectId]);

  const fetchSubjectStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/subject-teacher/subjects/${subjectId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error fetching subject students:', error);
      setError('Failed to fetch students');
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

  const students = data?.students || [];
  const subject = data?.subject || {};

  // Get unique classes
  const uniqueClasses = [...new Set(students.map(s => s.className))];

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.rollNumber.toString().includes(searchTerm);
    const matchesClass = filterClass === 'all' || student.className === filterClass;
    return matchesSearch && matchesClass;
  });

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/teacher/subject/dashboard')}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <AcademicCapIcon className="w-8 h-8 mr-2 text-indigo-600" />
              {subject.name} - Students
            </h1>
            <p className="text-gray-600 mt-2">
              Subject Code: {subject.code} • Total Students: {students.length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
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
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Classes</option>
          {uniqueClasses.map(className => (
            <option key={className} value={className}>{className}</option>
          ))}
        </select>
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
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterClass !== 'all' ? 'No students found matching your filters' : 'No students enrolled in this subject'}
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
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{student.className}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-sm font-semibold rounded-full ${getAttendanceColor(student.attendancePercentage)}`}>
                        {student.attendancePercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.grade ? (
                        <div className="text-sm">
                          <div>Exam: {student.grade.examScore}%</div>
                          <div className="text-gray-500">Assignment: {student.grade.assignmentScore}%</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not graded</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.grade ? (
                        <span className={`text-lg font-bold ${getGradeColor(parseFloat(student.grade.percentage))}`}>
                          {student.grade.percentage}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
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
            <p className="text-2xl font-bold text-indigo-600">{filteredStudents.length}</p>
            <p className="text-sm text-gray-600">Total Students</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">
              {filteredStudents.filter(s => s.attendancePercentage >= 90).length}
            </p>
            <p className="text-sm text-gray-600">Good Attendance (≥90%)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {filteredStudents.filter(s => s.grade && parseFloat(s.grade.percentage) >= 75).length}
            </p>
            <p className="text-sm text-gray-600">Good Performance (≥75%)</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {filteredStudents.filter(s => s.grade && parseFloat(s.grade.percentage) < 60).length}
            </p>
            <p className="text-sm text-gray-600">Need Support (<60%)</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`/teacher/subject/${subjectId}/attendance`)}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <CalendarIcon className="w-5 h-5 mr-2" />
          Mark Attendance
        </button>
        <button
          onClick={() => navigate(`/teacher/subject/${subjectId}/grades`)}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
        >
          <AcademicCapIcon className="w-5 h-5 mr-2" />
          Enter Grades
        </button>
      </div>
    </div>
  );
};

export default SubjectStudents;
