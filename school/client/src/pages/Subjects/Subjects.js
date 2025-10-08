import React from 'react';

const Subjects = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Subjects</h1>
        <p className="page-subtitle">Manage subjects and curriculum</p>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <h3 className="empty-state-title">Subject Management</h3>
            <p className="empty-state-description">Manage subjects, curriculum, and course materials.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subjects;
