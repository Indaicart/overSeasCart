const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all schools (super admin only)
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (page - 1) * limit;

    let query = db('schools')
      .leftJoin('subscriptions', 'schools.id', 'subscriptions.school_id')
      .select(
        'schools.*',
        'subscriptions.plan_type',
        'subscriptions.status as subscription_status',
        'subscriptions.end_date as subscription_end_date'
      );

    if (search) {
      query = query.where(function() {
        this.where('schools.name', 'ilike', `%${search}%`)
          .orWhere('schools.email', 'ilike', `%${search}%`)
          .orWhere('schools.phone', 'ilike', `%${search}%`);
      });
    }

    const schools = await query
      .orderBy('schools.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('schools').count('* as count').first();

    res.json({
      schools: schools.map(school => ({
        id: school.id,
        name: school.name,
        address: school.address,
        phone: school.phone,
        email: school.email,
        website: school.website,
        principalName: school.principal_name,
        description: school.description,
        academicYear: school.academic_year,
        academicYearStart: school.academic_year_start,
        academicYearEnd: school.academic_year_end,
        settings: school.settings,
        planType: school.plan_type,
        subscriptionStatus: school.subscription_status,
        subscriptionEndDate: school.subscription_end_date,
        createdAt: school.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ message: 'Failed to fetch schools' });
  }
});

// Get school by ID
router.get('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const school = await db('schools')
      .leftJoin('subscriptions', 'schools.id', 'subscriptions.school_id')
      .select(
        'schools.*',
        'subscriptions.plan_type',
        'subscriptions.status as subscription_status',
        'subscriptions.end_date as subscription_end_date',
        'subscriptions.max_students',
        'subscriptions.max_teachers',
        'subscriptions.max_storage_gb'
      )
      .where('schools.id', req.params.id)
      .first();

    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Get school statistics
    const stats = await Promise.all([
      db('users').where('school_id', req.params.id).count('* as count').first(),
      db('students').join('users', 'students.user_id', 'users.id')
        .where('users.school_id', req.params.id).count('* as count').first(),
      db('teachers').join('users', 'teachers.user_id', 'users.id')
        .where('users.school_id', req.params.id).count('* as count').first(),
      db('classes').where('school_id', req.params.id).count('* as count').first()
    ]);

    res.json({
      id: school.id,
      name: school.name,
      address: school.address,
      phone: school.phone,
      email: school.email,
      website: school.website,
      logo: school.logo,
      principalName: school.principal_name,
      description: school.description,
      academicYear: school.academic_year,
      academicYearStart: school.academic_year_start,
      academicYearEnd: school.academic_year_end,
      settings: school.settings,
      planType: school.plan_type,
      subscriptionStatus: school.subscription_status,
      subscriptionEndDate: school.subscription_end_date,
      limits: {
        maxStudents: school.max_students,
        maxTeachers: school.max_teachers,
        maxStorageGb: school.max_storage_gb
      },
      stats: {
        totalUsers: parseInt(stats[0].count),
        totalStudents: parseInt(stats[1].count),
        totalTeachers: parseInt(stats[2].count),
        totalClasses: parseInt(stats[3].count)
      },
      createdAt: school.created_at
    });
  } catch (error) {
    console.error('Get school error:', error);
    res.status(500).json({ message: 'Failed to fetch school' });
  }
});

// Create new school
router.post('/', authenticateToken, requireSuperAdmin, [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('address').notEmpty().trim(),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, address, phone, email, website, principalName,
      description, academicYear, academicYearStart, academicYearEnd,
      settings, planType, adminEmail, adminPassword, adminFirstName, adminLastName
    } = req.body;

    // Check if school email already exists
    const existingSchool = await db('schools').where('email', email).first();
    if (existingSchool) {
      return res.status(400).json({ message: 'School with this email already exists' });
    }

    const trx = await db.transaction();

    try {
      // Create school
      const [school] = await trx('schools').insert({
        name,
        address,
        phone,
        email,
        website,
        principal_name: principalName,
        description,
        academic_year: academicYear || '2024-2025',
        academic_year_start: academicYearStart || '2024-08-15',
        academic_year_end: academicYearEnd || '2025-06-15',
        settings: settings ? JSON.stringify(settings) : null
      }).returning('*');

      // Create admin user for the school
      const bcrypt = require('bcryptjs');
      const adminPasswordHash = await bcrypt.hash(adminPassword || 'password123', 12);
      
      const [adminUser] = await trx('users').insert({
        email: adminEmail || `admin@${name.toLowerCase().replace(/\s+/g, '')}.com`,
        password_hash: adminPasswordHash,
        first_name: adminFirstName || 'Admin',
        last_name: adminLastName || 'User',
        role: 'admin',
        school_id: school.id,
        is_active: true
      }).returning('*');

      // Create default subscription (trial)
      const [subscription] = await trx('subscriptions').insert({
        school_id: school.id,
        plan_type: planType || 'basic',
        status: 'trial',
        start_date: new Date(),
        trial_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        monthly_price: 0,
        billing_cycle: 'monthly',
        max_students: 50,
        max_teachers: 5,
        max_storage_gb: 2
      }).returning('*');

      await trx.commit();

      res.status(201).json({
        message: 'School created successfully',
        school: {
          id: school.id,
          name: school.name,
          email: school.email
        },
        admin: {
          email: adminUser.email,
          password: adminPassword || 'password123'
        },
        subscription: {
          planType: subscription.plan_type,
          status: subscription.status
        }
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Create school error:', error);
    res.status(500).json({ message: 'Failed to create school' });
  }
});

// Update school
router.put('/:id', authenticateToken, requireSuperAdmin, [
  body('name').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, address, phone, email, website, principalName,
      description, academicYear, academicYearStart, academicYearEnd, settings
    } = req.body;

    const school = await db('schools').where('id', req.params.id).first();
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check if new email already exists (if email is being changed)
    if (email && email !== school.email) {
      const existingSchool = await db('schools').where('email', email).first();
      if (existingSchool) {
        return res.status(400).json({ message: 'School with this email already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (website) updateData.website = website;
    if (principalName) updateData.principal_name = principalName;
    if (description) updateData.description = description;
    if (academicYear) updateData.academic_year = academicYear;
    if (academicYearStart) updateData.academic_year_start = academicYearStart;
    if (academicYearEnd) updateData.academic_year_end = academicYearEnd;
    if (settings) updateData.settings = JSON.stringify(settings);

    await db('schools').where('id', req.params.id).update(updateData);

    res.json({ message: 'School updated successfully' });
  } catch (error) {
    console.error('Update school error:', error);
    res.status(500).json({ message: 'Failed to update school' });
  }
});

// Delete school
router.delete('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const school = await db('schools').where('id', req.params.id).first();
    if (!school) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check if school has users
    const userCount = await db('users')
      .where('school_id', req.params.id)
      .count('* as count')
      .first();

    if (parseInt(userCount.count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete school with existing users. Please transfer or delete users first.' 
      });
    }

    await db('schools').where('id', req.params.id).del();

    res.json({ message: 'School deleted successfully' });
  } catch (error) {
    console.error('Delete school error:', error);
    res.status(500).json({ message: 'Failed to delete school' });
  }
});

// Get school users
router.get('/:id/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { role } = req.query;

    let query = db('users')
      .select('*')
      .where('school_id', req.params.id);

    if (role) {
      query = query.where('role', role);
    }

    const users = await query.orderBy('created_at', 'desc');

    res.json(users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      phone: user.phone,
      isActive: user.is_active,
      lastLogin: user.last_login,
      createdAt: user.created_at
    })));
  } catch (error) {
    console.error('Get school users error:', error);
    res.status(500).json({ message: 'Failed to fetch school users' });
  }
});

// Get school analytics
router.get('/:id/analytics', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get usage analytics
    let usageQuery = db('usage_analytics')
      .where('school_id', req.params.id);

    if (startDate) {
      usageQuery = usageQuery.where('date', '>=', startDate);
    }
    if (endDate) {
      usageQuery = usageQuery.where('date', '<=', endDate);
    }

    const usage = await usageQuery.orderBy('date', 'desc').limit(30);

    // Get current stats
    const currentStats = await Promise.all([
      db('users').where('school_id', req.params.id).count('* as count').first(),
      db('students').join('users', 'students.user_id', 'users.id')
        .where('users.school_id', req.params.id).count('* as count').first(),
      db('teachers').join('users', 'teachers.user_id', 'users.id')
        .where('users.school_id', req.params.id).count('* as count').first(),
      db('classes').where('school_id', req.params.id).count('* as count').first(),
      db('attendance').join('students', 'attendance.student_id', 'students.id')
        .join('users', 'students.user_id', 'users.id')
        .where('users.school_id', req.params.id)
        .where('attendance.date', '>=', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .count('* as count').first()
    ]);

    res.json({
      currentStats: {
        totalUsers: parseInt(currentStats[0].count),
        totalStudents: parseInt(currentStats[1].count),
        totalTeachers: parseInt(currentStats[2].count),
        totalClasses: parseInt(currentStats[3].count),
        attendanceRecords: parseInt(currentStats[4].count)
      },
      usageHistory: usage.map(record => ({
        date: record.date,
        activeUsers: record.active_users,
        totalStudents: record.total_students,
        totalTeachers: record.total_teachers,
        storageUsedMb: record.storage_used_mb,
        apiCalls: record.api_calls
      }))
    });
  } catch (error) {
    console.error('Get school analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch school analytics' });
  }
});

module.exports = router;
