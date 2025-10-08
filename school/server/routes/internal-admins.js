const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');

// Middleware to check if user is a school admin
const requireSchoolAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. School admin privileges required.'
    });
  }
  next();
};

// Get all internal admins for the school
router.get('/', authenticateToken, requireSchoolAdmin, async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const internalAdmins = await db('users')
      .where({ 
        school_id: schoolId,
        role: 'admin'
      })
      .whereNot({ id: req.user.id }) // Exclude the current admin
      .select('id', 'email', 'first_name', 'last_name', 'is_active', 'permissions', 'created_at', 'updated_at')
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: internalAdmins
    });
  } catch (error) {
    console.error('Error fetching internal admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch internal admins'
    });
  }
});

// Create new internal admin
router.post(
  '/',
  authenticateToken,
  requireSchoolAdmin,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    body('permissions').optional().isObject().withMessage('Permissions must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { email, password, first_name, last_name, permissions } = req.body;
      const schoolId = req.user.schoolId;

      // Check if email already exists
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create internal admin user
      const [newAdmin] = await db('users')
        .insert({
          school_id: schoolId,
          email,
          password_hash: hashedPassword,
          first_name,
          last_name,
          role: 'admin',
          is_active: true,
          permissions: JSON.stringify(permissions || {})
        })
        .returning(['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'permissions', 'created_at']);

      res.status(201).json({
        success: true,
        message: 'Internal admin created successfully',
        data: newAdmin
      });
    } catch (error) {
      console.error('Error creating internal admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create internal admin'
      });
    }
  }
);

// Update internal admin
router.put(
  '/:id',
  authenticateToken,
  requireSchoolAdmin,
  [
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('permissions').optional().isObject().withMessage('Permissions must be an object')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { first_name, last_name, email, permissions } = req.body;
      const schoolId = req.user.schoolId;

      // Check if admin exists and belongs to the same school
      const existingAdmin = await db('users')
        .where({ 
          id, 
          school_id: schoolId,
          role: 'admin'
        })
        .first();

      if (!existingAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Internal admin not found'
        });
      }

      // Prevent admin from updating themselves through this endpoint
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Use the profile update endpoint to modify your own account'
        });
      }

      // Check if trying to update to an email that already exists
      if (email && email !== existingAdmin.email) {
        const emailExists = await db('users').where({ email }).first();
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (first_name) updateData.first_name = first_name;
      if (last_name) updateData.last_name = last_name;
      if (email) updateData.email = email;
      if (permissions) updateData.permissions = JSON.stringify(permissions);
      updateData.updated_at = db.fn.now();

      // Update internal admin
      await db('users')
        .where({ id })
        .update(updateData);

      // Fetch updated admin
      const updatedAdmin = await db('users')
        .where({ id })
        .select('id', 'email', 'first_name', 'last_name', 'is_active', 'permissions', 'created_at', 'updated_at')
        .first();

      res.json({
        success: true,
        message: 'Internal admin updated successfully',
        data: updatedAdmin
      });
    } catch (error) {
      console.error('Error updating internal admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update internal admin'
      });
    }
  }
);

// Deactivate internal admin
router.put('/:id/deactivate', authenticateToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    // Prevent deactivating self
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Check if admin exists and belongs to the same school
    const existingAdmin = await db('users')
      .where({ 
        id, 
        school_id: schoolId,
        role: 'admin'
      })
      .first();

    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Internal admin not found'
      });
    }

    // Check if already deactivated
    if (!existingAdmin.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Internal admin is already deactivated'
      });
    }

    // Deactivate admin
    await db('users')
      .where({ id })
      .update({
        is_active: false,
        updated_at: db.fn.now()
      });

    res.json({
      success: true,
      message: 'Internal admin deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating internal admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate internal admin'
    });
  }
});

// Activate internal admin
router.put('/:id/activate', authenticateToken, requireSchoolAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    // Check if admin exists and belongs to the same school
    const existingAdmin = await db('users')
      .where({ 
        id, 
        school_id: schoolId,
        role: 'admin'
      })
      .first();

    if (!existingAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Internal admin not found'
      });
    }

    // Check if already active
    if (existingAdmin.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Internal admin is already active'
      });
    }

    // Activate admin
    await db('users')
      .where({ id })
      .update({
        is_active: true,
        updated_at: db.fn.now()
      });

    res.json({
      success: true,
      message: 'Internal admin activated successfully'
    });
  } catch (error) {
    console.error('Error activating internal admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate internal admin'
    });
  }
});

module.exports = router;
