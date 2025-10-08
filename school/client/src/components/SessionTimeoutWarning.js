import React from 'react';
import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

const SessionTimeoutWarning = ({ show, timeLeft, onExtend, onLogout }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Session Expiring Soon
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Your session will expire due to inactivity
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-yellow-100 rounded-full p-4">
              <ClockIcon className="h-12 w-12 text-yellow-600" />
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-700 mb-2">
              You will be automatically logged out in:
            </p>
            <div className="text-4xl font-bold text-yellow-600 mb-4">
              {timeLeft}
            </div>
            <p className="text-sm text-gray-600">
              Click "Stay Signed In" to extend your session, or you will be logged out for security.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          >
            Logout Now
          </button>
          <button
            onClick={onExtend}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Stay Signed In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
