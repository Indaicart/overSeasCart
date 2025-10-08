import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import SessionTimeoutWarning from '../SessionTimeoutWarning';
import useSessionTimeout from '../../hooks/useSessionTimeout';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Session timeout: 30 minutes timeout, 5 minutes warning
  const { showWarning, timeLeft, extendSession, handleLogout } = useSessionTimeout(
    30 * 60 * 1000, // 30 minutes
    5 * 60 * 1000   // 5 minutes warning
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Session Timeout Warning Modal */}
      <SessionTimeoutWarning
        show={showWarning}
        timeLeft={timeLeft}
        onExtend={extendSession}
        onLogout={handleLogout}
      />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
