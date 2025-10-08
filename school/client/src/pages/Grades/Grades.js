import React from 'react';

const Grades = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Grades</h1>
        <p className="page-subtitle">Manage student grades and assessments</p>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <h3 className="empty-state-title">Grade Management</h3>
            <p className="empty-state-description">Record grades, manage assessments, and generate report cards.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Grades;
