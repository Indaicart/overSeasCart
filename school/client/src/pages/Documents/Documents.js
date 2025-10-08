import React from 'react';

const Documents = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Documents</h1>
        <p className="page-subtitle">Manage school documents and files</p>
      </div>
      <div className="card">
        <div className="card-body">
          <div className="empty-state">
            <h3 className="empty-state-title">Document Management</h3>
            <p className="empty-state-description">Upload, organize, and manage school documents, reports, and files.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documents;
