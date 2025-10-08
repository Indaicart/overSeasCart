const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');

// Get all super admins
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const superAdmins = await db('users')
      .where({ role: 'super_admin' })
      .select('id', 'email', 'first_name', 'last_name', 'is_active', 'created_at', 'updated_at')
      .orderBy('created_at', 'desc');

    res.json({
      success: true,
      data: superAdmins
    });
  } catch (error) {
    console.error('Error fetching super admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch super admins'
    });
  }
});

// Get single super admin by ID
router.get('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const superAdmin = await db('users')
      .where({ id, role: 'super_admin' })
      .select('id', 'email', 'first_name', 'last_name', 'is_active', 'created_at', 'updated_at')
      .first();

    if (!superAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super admin not found'
      });
    }

    res.json({
      success: true,
      data: superAdmin
    });
  } catch (error) {
    console.error('Error fetching super admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch super admin'
    });
  }
});

// Create new super admin
router.post(
  '/',
  authenticateToken,
  requireSuperAdmin,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required')
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

      const { email, password, first_name, last_name } = req.body;

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

      // Create super admin user
      const [newSuperAdmin] = await db('users')
        .insert({
          email,
          password_hash: hashedPassword,
          first_name,
          last_name,
          role: 'super_admin',
          is_active: true
        })
        .returning(['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']);

      res.status(201).json({
        success: true,
        message: 'Super admin created successfully',
        data: newSuperAdmin
      });
    } catch (error) {
      console.error('Error creating super admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create super admin'
      });
    }
  }
);

// Update super admin details
router.put(
  '/:id',
  authenticateToken,
  requireSuperAdmin,
  [
    body('first_name').optional().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required')
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
      const { first_name, last_name, email } = req.body;

      // Check if super admin exists
      const existingSuperAdmin = await db('users')
        .where({ id, role: 'super_admin' })
        .first();

      if (!existingSuperAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Super admin not found'
        });
      }

      // Check if trying to update to an email that already exists
      if (email && email !== existingSuperAdmin.email) {
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
      updateData.updated_at = db.fn.now();

      // Update super admin
      await db('users')
        .where({ id })
        .update(updateData);

      // Fetch updated super admin
      const updatedSuperAdmin = await db('users')
        .where({ id })
        .select('id', 'email', 'first_name', 'last_name', 'is_active', 'created_at', 'updated_at')
        .first();

      res.json({
        success: true,
        message: 'Super admin updated successfully',
        data: updatedSuperAdmin
      });
    } catch (error) {
      console.error('Error updating super admin:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update super admin'
      });
    }
  }
);

// Change super admin password
router.put(
  '/:id/password',
  authenticateToken,
  requireSuperAdmin,
  [
    body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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
      const { new_password } = req.body;

      // Check if super admin exists
      const existingSuperAdmin = await db('users')
        .where({ id, role: 'super_admin' })
        .first();

      if (!existingSuperAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Super admin not found'
        });
      }

      // Prevent changing own password through this endpoint
      if (req.user.id === id) {
        return res.status(400).json({
          success: false,
          message: 'Use the profile password change endpoint to change your own password'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 10);

      // Update password
      await db('users')
        .where({ id })
        .update({
          password_hash: hashedPassword,
          updated_at: db.fn.now()
        });

      res.json({
        success: true,
        message: 'Super admin password updated successfully'
      });
    } catch (error) {
      console.error('Error updating super admin password:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update super admin password'
      });
    }
  }
);

// Deactivate super admin
router.put('/:id/deactivate', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deactivating self
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Check if super admin exists
    const existingSuperAdmin = await db('users')
      .where({ id, role: 'super_admin' })
      .first();

    if (!existingSuperAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super admin not found'
      });
    }

    // Check if already deactivated
    if (!existingSuperAdmin.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Super admin is already deactivated'
      });
    }

    // Deactivate super admin
    await db('users')
      .where({ id })
      .update({
        is_active: false,
        updated_at: db.fn.now()
      });

    res.json({
      success: true,
      message: 'Super admin deactivated successfully'
    });
  } catch (error) {
    console.error('Error deactivating super admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate super admin'
    });
  }
});

// Reactivate super admin
router.put('/:id/activate', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if super admin exists
    const existingSuperAdmin = await db('users')
      .where({ id, role: 'super_admin' })
      .first();

    if (!existingSuperAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super admin not found'
      });
    }

    // Check if already active
    if (existingSuperAdmin.is_active) {
      return res.status(400).json({
        success: false,
        message: 'Super admin is already active'
      });
    }

    // Reactivate super admin
    await db('users')
      .where({ id })
      .update({
        is_active: true,
        updated_at: db.fn.now()
      });

    res.json({
      success: true,
      message: 'Super admin activated successfully'
    });
  } catch (error) {
    console.error('Error activating super admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate super admin'
    });
  }
});

// Delete super admin (soft delete by deactivating)
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Check if super admin exists
    const existingSuperAdmin = await db('users')
      .where({ id, role: 'super_admin' })
      .first();

    if (!existingSuperAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Super admin not found'
      });
    }

    // Soft delete by deactivating
    await db('users')
      .where({ id })
      .update({
        is_active: false,
        updated_at: db.fn.now()
      });

    res.json({
      success: true,
      message: 'Super admin deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting super admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete super admin'
    });
  }
});

module.exports = router;