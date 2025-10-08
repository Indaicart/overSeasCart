import React, { useState } from 'react';
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const BulkOperations = () => {
  const [activeTab, setActiveTab] = useState('import');
  const [selectedType, setSelectedType] = useState('students');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError('');
      setResult(null);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bulk/import/${selectedType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        setFile(null);
        // Reset file input
        document.getElementById('file-upload').value = '';
      } else {
        setError(data.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      setError('Failed to import data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (exportType) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bulk/export/${exportType}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportType}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bulk/templates/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-template.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Download template error:', error);
      setError('Failed to download template');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ArrowUpTrayIcon className="w-8 h-8 mr-2 text-indigo-600" />
          Bulk Operations
        </h1>
        <p className="text-gray-600 mt-2">
          Import and export data in bulk using CSV files
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('import');
              setResult(null);
              setError('');
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ArrowUpTrayIcon className="w-5 h-5 inline mr-2" />
            Import Data
          </button>
          <button
            onClick={() => {
              setActiveTab('export');
              setResult(null);
              setError('');
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ArrowDownTrayIcon className="w-5 h-5 inline mr-2" />
            Export Data
          </button>
        </nav>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Import Type Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Import Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setSelectedType('students');
                  setFile(null);
                  setResult(null);
                }}
                className={`p-6 border-2 rounded-lg transition-all ${
                  selectedType === 'students'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Import Students</h3>
                <p className="text-sm text-gray-600 mt-1">Upload student data in bulk</p>
              </button>
              
              <button
                onClick={() => {
                  setSelectedType('teachers');
                  setFile(null);
                  setResult(null);
                }}
                className={`p-6 border-2 rounded-lg transition-all ${
                  selectedType === 'teachers'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                <AcademicCapIcon className="w-12 h-12 mx-auto mb-3 text-indigo-600" />
                <h3 className="font-semibold text-gray-900">Import Teachers</h3>
                <p className="text-sm text-gray-600 mt-1">Upload teacher data in bulk</p>
              </button>
            </div>
          </div>

          {/* Template Download */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <DocumentArrowDownIcon className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900">Download Template First</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Download the CSV template, fill in your data, and upload it below.
                </p>
                <button
                  onClick={() => downloadTemplate(selectedType)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Download {selectedType === 'students' ? 'Students' : 'Teachers'} Template
                </button>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
            <form onSubmit={handleImport}>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ArrowUpTrayIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Choose a file
                  </span>
                  <span className="text-gray-600"> or drag and drop</span>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">CSV file up to 10MB</p>
                {file && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg inline-block">
                    <CheckCircleIcon className="w-5 h-5 inline text-green-600 mr-2" />
                    <span className="text-green-800 text-sm font-medium">{file.name}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={!file || loading}
                className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? 'Importing...' : `Import ${selectedType === 'students' ? 'Students' : 'Teachers'}`}
              </button>
            </form>
          </div>

          {/* Import Results */}
          {result && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-600 text-sm font-medium">Successfully Imported</p>
                  <p className="text-3xl font-bold text-green-900">{result.imported}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-600 text-sm font-medium">Failed</p>
                  <p className="text-3xl font-bold text-red-900">{result.failed}</p>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                    Errors ({result.errors.length})
                  </h3>
                  <div className="max-h-64 overflow-y-auto border border-red-200 rounded-lg">
                    <table className="min-w-full divide-y divide-red-200">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700">Line</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700">Error</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-red-700">Data</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-red-200">
                        {result.errors.map((err, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{err.line}</td>
                            <td className="px-4 py-2 text-sm text-red-700">{err.error}</td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {JSON.stringify(err.data).substring(0, 50)}...
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <UserGroupIcon className="w-12 h-12 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Students</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download all student data as CSV
            </p>
            <button
              onClick={() => handleExport('students')}
              disabled={loading}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export Students'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <AcademicCapIcon className="w-12 h-12 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Teachers</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download all teacher data as CSV
            </p>
            <button
              onClick={() => handleExport('teachers')}
              disabled={loading}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export Teachers'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <DocumentArrowDownIcon className="w-12 h-12 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Attendance</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download attendance records as CSV
            </p>
            <button
              onClick={() => handleExport('attendance')}
              disabled={loading}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export Attendance'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <DocumentArrowDownIcon className="w-12 h-12 text-indigo-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Grades</h3>
            <p className="text-sm text-gray-600 mb-4">
              Download grade records as CSV
            </p>
            <button
              onClick={() => handleExport('grades')}
              disabled={loading}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export Grades'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOperations;
