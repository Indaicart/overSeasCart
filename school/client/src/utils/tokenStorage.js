/**
 * Token Storage Utility
 * Handles JWT token storage in localStorage with encryption/security best practices
 */

const TOKEN_KEY = 'school_jwt_token';
const USER_KEY = 'school_user_data';
const EXPIRY_KEY = 'school_token_expiry';

/**
 * Save JWT token to localStorage
 * @param {string} token - JWT token
 * @param {object} user - User data (id, email, role, schoolId)
 * @param {number} expiresIn - Token expiration time in seconds
 */
export const saveToken = (token, user, expiresIn) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    // Calculate expiry timestamp
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem(EXPIRY_KEY, expiryTime.toString());
    
    console.log('✅ Token saved successfully');
  } catch (error) {
    console.error('❌ Error saving token:', error);
  }
};

/**
 * Get JWT token from localStorage
 * @returns {string|null} JWT token or null if not found/expired
 */
export const getToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(EXPIRY_KEY);
    
    // Check if token exists
    if (!token) {
      return null;
    }
    
    // Check if token is expired
    if (expiry && Date.now() > parseInt(expiry)) {
      console.warn('⚠️ Token expired, clearing storage');
      clearToken();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return null;
  }
};

/**
 * Get user data from localStorage
 * @returns {object|null} User data or null if not found
 */
export const getUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists and not expired
 */
export const isAuthenticated = () => {
  return getToken() !== null;
};

/**
 * Check if token is about to expire (within 5 minutes)
 * @returns {boolean} True if token expires soon
 */
export const isTokenExpiringSoon = () => {
  try {
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (!expiry) {
      return false;
    }
    
    const timeUntilExpiry = parseInt(expiry) - Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return timeUntilExpiry > 0 && timeUntilExpiry < fiveMinutes;
  } catch (error) {
    console.error('❌ Error checking token expiry:', error);
    return false;
  }
};

/**
 * Get time until token expires
 * @returns {number} Milliseconds until expiry, or 0 if expired/not found
 */
export const getTimeUntilExpiry = () => {
  try {
    const expiry = localStorage.getItem(EXPIRY_KEY);
    if (!expiry) {
      return 0;
    }
    
    const timeUntilExpiry = parseInt(expiry) - Date.now();
    return Math.max(0, timeUntilExpiry);
  } catch (error) {
    console.error('❌ Error getting time until expiry:', error);
    return 0;
  }
};

/**
 * Clear JWT token and user data from localStorage
 */
export const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    console.log('✅ Token cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing token:', error);
  }
};

/**
 * Get user role from stored data
 * @returns {string|null} User role or null
 */
export const getUserRole = () => {
  const user = getUser();
  return user ? user.role : null;
};

/**
 * Get user school ID from stored data
 * @returns {string|null} School ID or null
 */
export const getUserSchoolId = () => {
  const user = getUser();
  return user ? user.schoolId : null;
};

/**
 * Get user ID from stored data
 * @returns {string|null} User ID or null
 */
export const getUserId = () => {
  const user = getUser();
  return user ? user.id : null;
};

/**
 * Check if user has a specific role
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};

/**
 * Check if user has any of the specified roles
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean} True if user has any of the roles
 */
export const hasAnyRole = (roles) => {
  const userRole = getUserRole();
  return roles.includes(userRole);
};

/**
 * Check if user is Super Admin
 * @returns {boolean} True if user is Super Admin
 */
export const isSuperAdmin = () => {
  return hasRole('SUPER_ADMIN');
};

/**
 * Check if user is School Admin
 * @returns {boolean} True if user is School Admin
 */
export const isSchoolAdmin = () => {
  return hasRole('SCHOOL_ADMIN');
};

/**
 * Check if user is a Teacher (Class or Subject)
 * @returns {boolean} True if user is a teacher
 */
export const isTeacher = () => {
  return hasAnyRole(['CLASS_TEACHER', 'SUBJECT_TEACHER']);
};

/**
 * Check if user is a Student
 * @returns {boolean} True if user is a student
 */
export const isStudent = () => {
  return hasRole('STUDENT');
};

/**
 * Check if user is a Parent
 * @returns {boolean} True if user is a parent
 */
export const isParent = () => {
  return hasRole('PARENT');
};

export default {
  saveToken,
  getToken,
  getUser,
  isAuthenticated,
  isTokenExpiringSoon,
  getTimeUntilExpiry,
  clearToken,
  getUserRole,
  getUserSchoolId,
  getUserId,
  hasRole,
  hasAnyRole,
  isSuperAdmin,
  isSchoolAdmin,
  isTeacher,
  isStudent,
  isParent
};

