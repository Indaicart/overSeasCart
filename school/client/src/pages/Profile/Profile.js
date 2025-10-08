import React from 'react';

const Profile = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your profile and account settings</p>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <h3 className="empty-state-title">Profile Management</h3>
            <p className="empty-state-description">Update your profile information, change password, and manage account settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
