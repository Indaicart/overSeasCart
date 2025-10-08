import React from 'react';

const Notifications = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">View and manage notifications</p>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <h3 className="empty-state-title">Notifications</h3>
            <p className="empty-state-description">View system notifications, announcements, and alerts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
