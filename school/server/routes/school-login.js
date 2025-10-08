const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * POST /api/school-login/verify
 * Verify school ID and return available login types based on subscription
 */
router.post('/verify', async (req, res) => {
  try {
    const { schoolId } = req.body;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID is required'
      });
    }

    // Find school by school_code or id
    const school = await db('schools')
      .where('school_code', schoolId)
      .orWhere('id', schoolId)
      .first('*');

    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'Invalid School ID. Please check and try again.'
      });
    }

    if (school.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This school account is not active. Please contact support.'
      });
    }

    // Get subscription details
    const subscription = await db('subscriptions')
      .join('subscription_plans', 'subscriptions.plan_id', 'subscription_plans.id')
      .where('subscriptions.school_id', school.id)
      .where('subscriptions.status', 'active')
      .first(
        'subscriptions.*',
        'subscription_plans.name as plan_name',
        'subscription_plans.features'
      );

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No active subscription found for this school. Please contact admin.'
      });
    }

    // Get features enabled for this school's plan
    const planFeatures = await db('plan_features')
      .join('features', 'plan_features.feature_id', 'features.id')
      .where('plan_features.plan_id', subscription.plan_id)
      .where('features.is_active', true)
      .select('features.feature_key', 'features.name');

    const enabledFeatures = planFeatures.map(f => f.feature_key);

    // Determine available login types based on features
    const availableLogins = [];

    // Admin login is always available
    availableLogins.push({
      type: 'admin',
      label: 'School Admin',
      icon: 'shield',
      description: 'School administrators and management'
    });

    // Teacher login - check if teacher management is enabled
    if (enabledFeatures.includes('teacher_management')) {
      availableLogins.push({
        type: 'teacher',
        label: 'Teacher',
        icon: 'academic-cap',
        description: 'Faculty and teaching staff'
      });
    }

    // Student login - check if student management is enabled
    if (enabledFeatures.includes('student_management')) {
      availableLogins.push({
        type: 'student',
        label: 'Student',
        icon: 'user',
        description: 'Students and learners'
      });
    }

    // Parent login - check if parent portal is enabled
    if (enabledFeatures.includes('parent_portal')) {
      availableLogins.push({
        type: 'parent',
        label: 'Parent',
        icon: 'users',
        description: 'Parents and guardians'
      });
    }

    // Get school statistics
    const stats = await getSchoolStats(school.id);

    res.json({
      success: true,
      data: {
        school: {
          id: school.id,
          name: school.name,
          code: school.school_code,
          logo: school.logo_url || null,
          address: school.address,
          phone: school.phone,
          email: school.email
        },
        subscription: {
          plan: subscription.plan_name,
          status: subscription.status,
          expiryDate: subscription.end_date
        },
        availableLogins,
        stats,
        message: `Welcome to ${school.name}!`
      }
    });
  } catch (error) {
    console.error('School verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify school. Please try again.'
    });
  }
});

/**
 * POST /api/school-login/authenticate
 * Authenticate user with school context
 */
router.post('/authenticate', async (req, res) => {
  try {
    const { schoolId, email, password, loginType } = req.body;

    if (!schoolId || !email || !password || !loginType) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Verify school exists and is active
    const school = await db('schools')
      .where('school_code', schoolId)
      .orWhere('id', schoolId)
      .first('*');

    if (!school || school.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Invalid school or school is not active'
      });
    }

    // Find user by email and school
    const user = await db('users')
      .where('email', email)
      .where('school_id', school.id)
      .first('*');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify user role matches login type
    if (user.role !== loginType) {
      return res.status(403).json({
        success: false,
        message: `This account is not registered as a ${loginType}. Please select the correct login type.`
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the school admin.'
      });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        schoolId: school.id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          schoolId: school.id,
          schoolName: school.name
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.'
    });
  }
});

// Helper function to get school statistics
async function getSchoolStats(schoolId) {
  try {
    const students = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .where('students.status', 'active')
      .count('* as count')
      .first();

    const teachers = await db('teachers')
      .join('users', 'teachers.user_id', 'users.id')
      .where('users.school_id', schoolId)
      .count('* as count')
      .first();

    const classes = await db('classes')
      .where('school_id', schoolId)
      .count('* as count')
      .first();

    return {
      students: parseInt(students?.count || 0),
      teachers: parseInt(teachers?.count || 0),
      classes: parseInt(classes?.count || 0)
    };
  } catch (error) {
    console.error('Get school stats error:', error);
    return {
      students: 0,
      teachers: 0,
      classes: 0
    };
  }
}

module.exports = router;
