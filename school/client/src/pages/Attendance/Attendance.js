import React from 'react';

const Attendance = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">Track and manage student attendance</p>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <h3 className="empty-state-title">Attendance Management</h3>
            <p className="empty-state-description">Track student attendance, generate reports, and manage attendance policies.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
