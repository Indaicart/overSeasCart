import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowUpTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const MyAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchMyAssignments();
  }, []);

  const fetchMyAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/student/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAssignments(data.data || []);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (assignmentId) => {
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    alert(`Submitting assignment ${assignmentId} with file: ${selectedFile.name}`);
    // Implementation will include actual file upload
  };

  const getFilteredAssignments = () => {
    return assignments.filter(a => {
      if (activeTab === 'pending') return a.status === 'pending' || a.status === 'assigned';
      if (activeTab === 'submitted') return a.status === 'submitted';
      if (activeTab === 'graded') return a.status === 'graded';
      return true;
    });
  };

  const getDaysLeft = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (daysLeft) => {
    if (daysLeft < 0) return 'border-red-500 bg-red-50';
    if (daysLeft <= 1) return 'border-red-400 bg-red-50';
    if (daysLeft <= 3) return 'border-yellow-400 bg-yellow-50';
    return 'border-blue-400 bg-blue-50';
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const filteredAssignments = getFilteredAssignments();
  const pendingCount = assignments.filter(a => a.status === 'pending' || a.status === 'assigned').length;
  const submittedCount = assignments.filter(a => a.status === 'submitted').length;
  const gradedCount = assignments.filter(a => a.status === 'graded').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <DocumentTextIcon className="w-8 h-8 mr-2 text-indigo-600" />
          My Assignments
        </h1>
        <p className="text-gray-600 mt-2">View and submit your assignments</p>
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
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-red-600">{pendingCount}</p>
            </div>
            <ClockIcon className="w-12 h-12 text-red-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="text-3xl font-bold text-blue-600">{submittedCount}</p>
            </div>
            <ArrowUpTrayIcon className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Graded</p>
              <p className="text-3xl font-bold text-green-600">{gradedCount}</p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'submitted', label: 'Submitted', count: submittedCount },
            { key: 'graded', label: 'Graded', count: gradedCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No {activeTab} assignments</p>
          </div>
        ) : (
          filteredAssignments.map((assignment, index) => {
            const daysLeft = getDaysLeft(assignment.due_date);
            const isOverdue = daysLeft < 0;

            return (
              <div
                key={index}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 ${
                  activeTab === 'pending' ? getPriorityColor(daysLeft) : 'border-gray-300'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    {/* Assignment Info */}
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {assignment.title || 'Assignment Title'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {assignment.subject_name || 'Subject'} • {assignment.teacher_name || 'Teacher'}
                          </p>
                          <p className="text-gray-700 mb-3">
                            {assignment.description || 'No description provided'}
                          </p>
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center text-sm mb-3">
                        <ClockIcon className="w-4 h-4 mr-1 text-gray-500" />
                        <span className={isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                          {isOverdue
                            ? `Overdue by ${Math.abs(daysLeft)} days`
                            : daysLeft === 0
                            ? 'Due today'
                            : daysLeft === 1
                            ? 'Due tomorrow'
                            : `Due in ${daysLeft} days`
                          } • {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      </div>

                      {/* For Graded Assignments */}
                      {assignment.status === 'graded' && (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-900">Grade:</span>
                            <span className="text-2xl font-bold text-green-600">
                              {assignment.grade || 'A+'} ({assignment.score || 95}%)
                            </span>
                          </div>
                          {assignment.feedback && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-green-900">Feedback:</span>
                              <p className="text-sm text-green-800 mt-1">{assignment.feedback}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* For Submitted Assignments */}
                      {assignment.status === 'submitted' && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-sm text-blue-900">
                              Submitted on {new Date(assignment.submitted_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 md:ml-4">
                      {assignment.status === 'pending' || assignment.status === 'assigned' ? (
                        <>
                          <input
                            type="file"
                            id={`file-${index}`}
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <label
                            htmlFor={`file-${index}`}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer text-center text-sm"
                          >
                            Choose File
                          </label>
                          {selectedFile && (
                            <p className="text-xs text-gray-600 text-center">{selectedFile.name}</p>
                          )}
                          <button
                            onClick={() => handleSubmit(assignment.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center text-sm"
                          >
                            <ArrowUpTrayIcon className="w-4 h-4 mr-1" />
                            Submit
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => alert('View details functionality')}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center text-sm"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyAssignments;
