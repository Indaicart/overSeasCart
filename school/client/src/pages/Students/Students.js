import React from 'react';

const Students = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Students</h1>
        <p className="page-subtitle">Manage student information and records</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="empty-state-title">Student Management</h3>
            <p className="empty-state-description">
              This page will contain the student management interface with features like:
            </p>
            <ul className="mt-4 text-sm text-gray-500 text-left max-w-md mx-auto">
              <li>• View all students with search and filters</li>
              <li>• Add new students</li>
              <li>• Edit student information</li>
              <li>• View student profiles</li>
              <li>• Manage student classes and subjects</li>
              <li>• Track student attendance and grades</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;
