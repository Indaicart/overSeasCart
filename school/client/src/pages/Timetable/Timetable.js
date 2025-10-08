import React from 'react';

const Timetable = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Timetable</h1>
        <p className="page-subtitle">Manage class schedules and timetables</p>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <h3 className="empty-state-title">Timetable Management</h3>
            <p className="empty-state-description">Create and manage class schedules, teacher assignments, and room allocations.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
