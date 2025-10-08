import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for handling session timeout
 * @param {number} timeout - Timeout in milliseconds (default: 30 minutes)
 * @param {number} warningTime - Warning time in milliseconds before timeout (default: 5 minutes)
 */
const useSessionTimeout = (timeout = 30 * 60 * 1000, warningTime = 5 * 60 * 1000) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timeoutId = useRef(null);
  const warningTimeoutId = useRef(null);
  const intervalId = useRef(null);

  const resetTimer = () => {
    // Clear existing timers
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    if (warningTimeoutId.current) {
      clearTimeout(warningTimeoutId.current);
    }
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }

    // Hide warning
    setShowWarning(false);

    // Only set timers if user is logged in
    if (!user) return;

    // Set warning timer
    warningTimeoutId.current = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(warningTime);

      // Start countdown
      intervalId.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }, timeout - warningTime);

    // Set logout timer
    timeoutId.current = setTimeout(() => {
      handleLogout();
    }, timeout);
  };

  const handleLogout = () => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    setShowWarning(false);
    logout();
    navigate('/login');
  };

  const extendSession = () => {
    resetTimer();
  };

  useEffect(() => {
    if (!user) return;

    // Initialize timer
    resetTimer();

    // Events that should reset the timer
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on user activity
    const handleUserActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity);
    });

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      if (warningTimeoutId.current) {
        clearTimeout(warningTimeoutId.current);
      }
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, [user]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    showWarning,
    timeLeft: formatTime(timeLeft),
    extendSession,
    handleLogout,
  };
};

export default useSessionTimeout;
