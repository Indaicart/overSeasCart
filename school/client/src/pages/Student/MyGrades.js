import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ChartBarIcon, 
  DocumentArrowDownIcon,
  AcademicCapIcon 
} from '@heroicons/react/24/outline';

const MyGrades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('all');

  useEffect(() => {
    fetchMyGrades();
  }, [selectedTerm]);

  const fetchMyGrades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/student/grades?term=${selectedTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setGrades(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      setError('Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  };

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => sum + (grade.percentage || 0), 0);
    return (total / grades.length / 10).toFixed(2);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getGradeLetter = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <AcademicCapIcon className="w-8 h-8 mr-2 text-indigo-600" />
          My Grades
        </h1>
        <p className="text-gray-600 mt-2">View your academic performance across all subjects</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall GPA</p>
              <p className="text-3xl font-bold text-indigo-600">{calculateGPA()}</p>
              <p className="text-sm text-gray-500 mt-1">out of 10</p>
            </div>
            <ChartBarIcon className="w-12 h-12 text-indigo-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Subjects</p>
              <p className="text-3xl font-bold text-blue-600">{grades.length}</p>
              <p className="text-sm text-gray-500 mt-1">enrolled</p>
            </div>
            <AcademicCapIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average</p>
              <p className="text-3xl font-bold text-green-600">
                {grades.length > 0 
                  ? (grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">across subjects</p>
            </div>
            <DocumentArrowDownIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Terms</option>
          <option value="term1">Term 1</option>
          <option value="term2">Term 2</option>
          <option value="term3">Term 3</option>
        </select>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Subject-wise Performance</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Exams
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Assignments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No grades available yet
                  </td>
                </tr>
              ) : (
                grades.map((grade, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {grade.subject_name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {grade.teacher_name || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.exam_score || 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.assignment_score || 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grade.project_score || 0}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-gray-900">
                        {grade.percentage || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getGradeColor(grade.percentage || 0)}`}>
                        {getGradeLetter(grade.percentage || 0)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Report Card */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => alert('Download functionality will be implemented')}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
          Download Report Card
        </button>
      </div>
    </div>
  );
};

export default MyGrades;
