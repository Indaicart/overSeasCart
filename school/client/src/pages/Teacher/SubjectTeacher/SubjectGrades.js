import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  ArrowLeftIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const SubjectGrades = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubjectData();
  }, [subjectId]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndGrades();
    }
  }, [selectedClass]);

  const fetchSubjectData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/subject-teacher/subjects/${subjectId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setSubject(result.data.subject);
        const uniqueClasses = [...new Set(result.data.students.map(s => s.className))];
        const classData = uniqueClasses.map((className, index) => ({
          id: `class-${index}`,
          name: className
        }));
        setClasses(classData);
        if (classData.length > 0) {
          setSelectedClass(classData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching subject data:', error);
    }
  };

  const fetchStudentsAndGrades = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch students
      const studentsResponse = await fetch(`http://localhost:5000/api/subject-teacher/subjects/${subjectId}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const studentsResult = await studentsResponse.json();
      
      if (studentsResult.success) {
        const className = classes.find(c => c.id === selectedClass)?.name;
        const classStudents = studentsResult.data.students.filter(s => s.className === className);
        setStudents(classStudents);
        
        // Initialize grades from existing data
        const initialGrades = {};
        classStudents.forEach(student => {
          if (student.grade) {
            initialGrades[student.id] = {
              examScore: student.grade.examScore || '',
              assignmentScore: student.grade.assignmentScore || '',
              projectScore: student.grade.projectScore || ''
            };
          } else {
            initialGrades[student.id] = {
              examScore: '',
              assignmentScore: '',
              projectScore: ''
            };
          }
        });
        setGrades(initialGrades);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    // Only allow numbers between 0-100
    const numValue = value === '' ? '' : Math.min(100, Math.max(0, Number(value)));
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numValue
      }
    }));
  };

  const calculateTotal = (studentGrades) => {
    const exam = Number(studentGrades.examScore) || 0;
    const assignment = Number(studentGrades.assignmentScore) || 0;
    const project = Number(studentGrades.projectScore) || 0;
    
    // Weighted average: 50% exam, 30% assignment, 20% project
    return (exam * 0.5 + assignment * 0.3 + project * 0.2).toFixed(1);
  };

  const handleSaveGrade = async (studentId) => {
    setError('');
    setSuccess('');

    const studentGrades = grades[studentId];
    if (!studentGrades.examScore && !studentGrades.assignmentScore && !studentGrades.projectScore) {
      setError('Please enter at least one score');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/subject-teacher/subjects/${subjectId}/grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId,
          examScore: Number(studentGrades.examScore) || 0,
          assignmentScore: Number(studentGrades.assignmentScore) || 0,
          projectScore: Number(studentGrades.projectScore) || 0
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccess(`Grade saved for student`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to save grade');
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      setError('Failed to save grade');
    }
  };

  const handleSaveAll = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      let savedCount = 0;
      for (const student of students) {
        const studentGrades = grades[student.id];
        if (studentGrades.examScore || studentGrades.assignmentScore || studentGrades.projectScore) {
          await handleSaveGrade(student.id);
          savedCount++;
        }
      }
      setSuccess(`Saved grades for ${savedCount} students!`);
      setTimeout(() => {
        navigate(`/teacher/subject/${subjectId}/students`);
      }, 2000);
    } catch (error) {
      console.error('Error saving all grades:', error);
      setError('Failed to save some grades');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toString().includes(searchTerm)
  );

  const getGradeColor = (total) => {
    if (total >= 90) return 'text-green-600';
    if (total >= 75) return 'text-blue-600';
    if (total >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/teacher/subject/${subjectId}/students`)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          Back to Students
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <AcademicCapIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Enter Grades - {subject?.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Subject Code: {subject?.code}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Student
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Students ({filteredStudents.length})
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Grading Formula: Exam (50%) + Assignment (30%) + Project (20%)
          </p>
        </div>
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
                  Exam (50%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Assignment (30%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Project (20%)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const studentGrades = grades[student.id] || {};
                  const total = calculateTotal(studentGrades);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.className}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentGrades.examScore}
                          onChange={(e) => handleGradeChange(student.id, 'examScore', e.target.value)}
                          placeholder="0-100"
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentGrades.assignmentScore}
                          onChange={(e) => handleGradeChange(student.id, 'assignmentScore', e.target.value)}
                          placeholder="0-100"
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={studentGrades.projectScore}
                          onChange={(e) => handleGradeChange(student.id, 'projectScore', e.target.value)}
                          placeholder="0-100"
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-lg font-bold ${getGradeColor(parseFloat(total))}`}>
                          {total}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSaveGrade(student.id)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center text-sm"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate(`/teacher/subject/${subjectId}/students`)}
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={loading || students.length === 0}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save All Grades'}
        </button>
      </div>
    </div>
  );
};

export default SubjectGrades;
