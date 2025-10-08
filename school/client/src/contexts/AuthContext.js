import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import axiosInstance, { publicRequest } from '../utils/axiosConfig';
import { 
  saveToken, 
  getToken, 
  getUser, 
  clearToken, 
  isAuthenticated 
} from '../utils/tokenStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      // Check if token exists and is valid
      if (isAuthenticated()) {
        try {
          // Get user data from localStorage
          const userData = getUser();
          if (userData) {
            setUser(userData);
            console.log('✅ User authenticated from localStorage:', userData.email);
          } else {
            // Token exists but no user data, clear everything
            clearToken();
          }
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          clearToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, schoolCode = null) => {
    try {
      // Use publicRequest for login (no auth required)
      const response = await publicRequest.post('/auth/login', {
        email,
        password,
        schoolCode
      });

      const { token, user: userData, expiresIn } = response.data;
      
      // Save token and user data using tokenStorage utility
      saveToken(token, userData, expiresIn || 86400); // Default 24 hours
      
      // Update state
      setUser(userData);
      
      toast.success(`Welcome back, ${userData.email}!`);
      console.log('✅ Login successful:', userData.role);
      
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      console.error('❌ Login error:', error);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      // Use publicRequest for registration (no auth required)
      const response = await publicRequest.post('/auth/register', userData);

      const { token, user: newUser, expiresIn } = response.data;
      
      // Save token and user data
      saveToken(token, newUser, expiresIn || 86400);
      
      // Update state
      setUser(newUser);
      
      toast.success('Registration successful! Welcome aboard!');
      console.log('✅ Registration successful:', newUser.email);
      
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
      console.error('❌ Registration error:', error);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    // Clear token and user data
    clearToken();
    
    // Update state
    setUser(null);
    
    toast.success('Logged out successfully. See you next time!');
    console.log('✅ User logged out');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axiosInstance.put(`/users/${user.id}`, profileData);
      
      // Update user data in state and localStorage
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      
      // Update localStorage
      const token = getToken();
      const expiresIn = 86400; // Keep same expiry
      saveToken(token, updatedUser, expiresIn);
      
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axiosInstance.put(`/users/${user.id}/password`, {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
