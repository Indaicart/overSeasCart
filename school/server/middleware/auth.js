const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const user = await db('users')
      .select('id', 'email', 'role', 'first_name', 'last_name', 'is_active')
      .where('id', decoded.userId)
      .first();

    if (!user || !user.is_active) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

const requireAdmin = requireRole(['admin']);
const requireTeacher = requireRole(['admin', 'teacher']);
const requireStudent = requireRole(['admin', 'teacher', 'student']);
const requireParent = requireRole(['admin', 'teacher', 'parent']);
const requireSuperAdmin = requireRole(['super_admin']);

// Middleware to check if user belongs to a school (for multi-tenancy)
const requireSchoolAccess = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Super admins can access any school
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Check if user has school_id
  if (!req.user.school_id) {
    return res.status(403).json({ message: 'No school access' });
  }

  // For school-specific requests, verify school access
  const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
  if (schoolId && schoolId !== req.user.school_id) {
    return res.status(403).json({ message: 'Access denied to this school' });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireTeacher,
  requireStudent,
  requireParent,
  requireSuperAdmin,
  requireSchoolAccess
};
