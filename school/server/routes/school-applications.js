const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Submit school application (public endpoint)
router.post('/apply', [
  body('schoolInfo.name').notEmpty().trim(),
  body('schoolInfo.email').isEmail().normalizeEmail(),
  body('schoolInfo.phone').notEmpty().trim(),
  body('schoolInfo.address').notEmpty().trim(),
  body('requirements.estimatedStudents').isInt({ min: 1 }),
  body('requirements.estimatedTeachers').isInt({ min: 1 }),
  body('contactInfo.contactPerson').notEmpty().trim(),
  body('contactInfo.email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { schoolInfo, requirements, contactInfo } = req.body;

    // Check if application already exists for this email
    const existingApplication = await db('school_applications')
      .where('contact_email', schoolInfo.email)
      .whereIn('status', ['pending', 'approved'])
      .first();

    if (existingApplication) {
      return res.status(400).json({ 
        message: 'An application already exists for this email address' 
      });
    }

    // Suggest plan based on requirements
    const suggestedPlan = suggestPlan(requirements);

    // Create application
    const [application] = await db('school_applications').insert({
      school_name: schoolInfo.name,
      contact_email: schoolInfo.email,
      contact_phone: schoolInfo.phone,
      school_address: schoolInfo.address,
      website: schoolInfo.website,
      contact_person: contactInfo.contactPerson,
      contact_position: contactInfo.position,
      estimated_students: requirements.estimatedStudents,
      estimated_teachers: requirements.estimatedTeachers,
      estimated_classes: requirements.estimatedClasses,
      needed_features: JSON.stringify(requirements.neededFeatures || []),
      budget_range: requirements.budgetRange,
      preferred_plan: requirements.preferredPlan,
      requested_plan: suggestedPlan,
      trial_period_days: requirements.trialPeriod || 30
    }).returning('*');

    // TODO: Send email notification to super admin
    // TODO: Send confirmation email to school

    res.status(201).json({
      message: 'School application submitted successfully',
      applicationId: application.id,
      suggestedPlan: suggestedPlan,
      status: 'pending'
    });
  } catch (error) {
    console.error('School application error:', error);
    res.status(500).json({ message: 'Failed to submit application' });
  }
});

// Get all applications (super admin only)
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    let query = db('school_applications');

    if (status) {
      query = query.where('status', status);
    }

    if (search) {
      query = query.where(function() {
        this.where('school_name', 'ilike', `%${search}%`)
          .orWhere('contact_email', 'ilike', `%${search}%`)
          .orWhere('contact_person', 'ilike', `%${search}%`);
      });
    }

    const applications = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('school_applications').count('* as count').first();

    res.json({
      applications: applications.map(app => ({
        id: app.id,
        schoolName: app.school_name,
        contactEmail: app.contact_email,
        contactPerson: app.contact_person,
        estimatedStudents: app.estimated_students,
        estimatedTeachers: app.estimated_teachers,
        preferredPlan: app.preferred_plan,
        requestedPlan: app.requested_plan,
        status: app.status,
        createdAt: app.created_at,
        neededFeatures: app.needed_features ? JSON.parse(app.needed_features) : []
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
});

// Get application details (super admin only)
router.get('/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const application = await db('school_applications')
      .where('id', req.params.id)
      .first();

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({
      id: application.id,
      schoolInfo: {
        name: application.school_name,
        email: application.contact_email,
        phone: application.contact_phone,
        address: application.school_address,
        website: application.website
      },
      contactInfo: {
        person: application.contact_person,
        position: application.contact_position,
        email: application.contact_email,
        phone: application.contact_phone
      },
      requirements: {
        estimatedStudents: application.estimated_students,
        estimatedTeachers: application.estimated_teachers,
        estimatedClasses: application.estimated_classes,
        neededFeatures: application.needed_features ? JSON.parse(application.needed_features) : [],
        budgetRange: application.budget_range,
        preferredPlan: application.preferred_plan,
        trialPeriod: application.trial_period_days
      },
      status: application.status,
      requestedPlan: application.requested_plan,
      assignedPlan: application.assigned_plan,
      superAdminNotes: application.super_admin_notes,
      createdAt: application.created_at,
      updatedAt: application.updated_at
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ message: 'Failed to fetch application' });
  }
});

// Approve application and create school (super admin only)
router.post('/:id/approve', authenticateToken, requireSuperAdmin, [
  body('assignedPlan').isIn(['basic', 'standard', 'premium', 'enterprise']),
  body('adminEmail').optional().isEmail(),
  body('adminPassword').optional().isLength({ min: 6 }),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignedPlan, adminEmail, adminPassword, notes } = req.body;

    const application = await db('school_applications')
      .where('id', req.params.id)
      .where('status', 'pending')
      .first();

    if (!application) {
      return res.status(404).json({ message: 'Application not found or already processed' });
    }

    const trx = await db.transaction();

    try {
      // Update application status
      await trx('school_applications')
        .where('id', req.params.id)
        .update({
          status: 'approved',
          assigned_plan: assignedPlan,
          super_admin_notes: notes,
          updated_at: new Date()
        });

      // Create school
      const [school] = await trx('schools').insert({
        name: application.school_name,
        email: application.contact_email,
        phone: application.contact_phone,
        address: application.school_address,
        website: application.website,
        principal_name: application.contact_person,
        description: `School created from application ${application.id}`
      }).returning('*');

      // Create admin user
      const bcrypt = require('bcryptjs');
      const adminPasswordHash = await bcrypt.hash(
        adminPassword || 'password123', 
        12
      );
      
      const [adminUser] = await trx('users').insert({
        email: adminEmail || application.contact_email,
        password_hash: adminPasswordHash,
        first_name: application.contact_person.split(' ')[0] || 'Admin',
        last_name: application.contact_person.split(' ')[1] || 'User',
        role: 'admin',
        school_id: school.id,
        is_active: true
      }).returning('*');

      // Create subscription
      const planDetails = getPlanDetails(assignedPlan);
      const [subscription] = await trx('subscriptions').insert({
        school_id: school.id,
        plan_type: assignedPlan,
        status: 'trial',
        start_date: new Date(),
        trial_end_date: new Date(Date.now() + application.trial_period_days * 24 * 60 * 60 * 1000),
        monthly_price: planDetails.monthlyPrice,
        annual_price: planDetails.annualPrice,
        billing_cycle: 'monthly',
        max_students: planDetails.maxStudents,
        max_teachers: planDetails.maxTeachers,
        max_storage_gb: planDetails.maxStorageGb,
        has_advanced_analytics: planDetails.hasAdvancedAnalytics,
        has_custom_branding: planDetails.hasCustomBranding,
        has_api_access: planDetails.hasApiAccess,
        has_priority_support: planDetails.hasPrioritySupport
      }).returning('*');

      await trx.commit();

      // TODO: Send approval email to school
      // TODO: Send login credentials

      res.json({
        message: 'Application approved and school created successfully',
        school: {
          id: school.id,
          name: school.name,
          email: school.email
        },
        admin: {
          id: adminUser.id,
          email: adminUser.email
        },
        subscription: {
          id: subscription.id,
          planType: subscription.plan_type,
          status: subscription.status,
          trialEndDate: subscription.trial_end_date
        }
      });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Approve application error:', error);
    res.status(500).json({ message: 'Failed to approve application' });
  }
});

// Reject application (super admin only)
router.post('/:id/reject', authenticateToken, requireSuperAdmin, [
  body('reason').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reason } = req.body;

    const application = await db('school_applications')
      .where('id', req.params.id)
      .where('status', 'pending')
      .first();

    if (!application) {
      return res.status(404).json({ message: 'Application not found or already processed' });
    }

    await db('school_applications')
      .where('id', req.params.id)
      .update({
        status: 'rejected',
        super_admin_notes: reason,
        updated_at: new Date()
      });

    // TODO: Send rejection email to school

    res.json({ message: 'Application rejected successfully' });
  } catch (error) {
    console.error('Reject application error:', error);
    res.status(500).json({ message: 'Failed to reject application' });
  }
});

// Get available plans (public endpoint)
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'basic',
        name: 'Basic',
        description: 'Perfect for small schools',
        monthlyPrice: 29.99,
        annualPrice: 299.99,
        maxStudents: 100,
        maxTeachers: 10,
        maxStorageGb: 5,
        features: [
          'Student Management',
          'Teacher Management',
          'Basic Attendance',
          'Grade Management',
          'Basic Reports',
          'Email Support'
        ]
      },
      {
        id: 'standard',
        name: 'Standard',
        description: 'Ideal for growing schools',
        monthlyPrice: 59.99,
        annualPrice: 599.99,
        maxStudents: 500,
        maxTeachers: 25,
        maxStorageGb: 20,
        features: [
          'Everything in Basic',
          'Advanced Analytics',
          'Fee Management',
          'Parent Portal',
          'Timetable Management',
          'Document Management',
          'Priority Support'
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        description: 'For established schools',
        monthlyPrice: 99.99,
        annualPrice: 999.99,
        maxStudents: 1000,
        maxTeachers: 50,
        maxStorageGb: 50,
        features: [
          'Everything in Standard',
          'Custom Branding',
          'API Access',
          'Advanced Reporting',
          'Multi-campus Support',
          'Phone Support',
          'Custom Integrations'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large school districts',
        monthlyPrice: 199.99,
        annualPrice: 1999.99,
        maxStudents: -1,
        maxTeachers: -1,
        maxStorageGb: 200,
        features: [
          'Everything in Premium',
          'Unlimited Users',
          'White-label Solution',
          'Dedicated Support',
          'Custom Development',
          'SLA Guarantee',
          'On-premise Option'
        ]
      }
    ];

    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
});

// Helper function to suggest plan based on requirements
function suggestPlan(requirements) {
  const { estimatedStudents, estimatedTeachers, neededFeatures } = requirements;
  
  // Check for enterprise features
  if (neededFeatures && neededFeatures.includes('White-label Solution')) {
    return 'enterprise';
  }
  
  // Check for premium features
  if (neededFeatures && (
    neededFeatures.includes('Custom Branding') || 
    neededFeatures.includes('API Access') ||
    neededFeatures.includes('Multi-campus Support')
  )) {
    return 'premium';
  }
  
  // Check for standard features
  if (neededFeatures && (
    neededFeatures.includes('Advanced Analytics') ||
    neededFeatures.includes('Fee Management') ||
    neededFeatures.includes('Parent Portal')
  )) {
    return 'standard';
  }
  
  // Size-based recommendation
  if (estimatedStudents <= 100 && estimatedTeachers <= 10) {
    return 'basic';
  } else if (estimatedStudents <= 500 && estimatedTeachers <= 25) {
    return 'standard';
  } else if (estimatedStudents <= 1000 && estimatedTeachers <= 50) {
    return 'premium';
  } else {
    return 'enterprise';
  }
}

// Helper function to get plan details
function getPlanDetails(planType) {
  const plans = {
    basic: {
      monthlyPrice: 29.99,
      annualPrice: 299.99,
      maxStudents: 100,
      maxTeachers: 10,
      maxStorageGb: 5,
      hasAdvancedAnalytics: false,
      hasCustomBranding: false,
      hasApiAccess: false,
      hasPrioritySupport: false
    },
    standard: {
      monthlyPrice: 59.99,
      annualPrice: 599.99,
      maxStudents: 500,
      maxTeachers: 25,
      maxStorageGb: 20,
      hasAdvancedAnalytics: true,
      hasCustomBranding: false,
      hasApiAccess: false,
      hasPrioritySupport: true
    },
    premium: {
      monthlyPrice: 99.99,
      annualPrice: 999.99,
      maxStudents: 1000,
      maxTeachers: 50,
      maxStorageGb: 50,
      hasAdvancedAnalytics: true,
      hasCustomBranding: true,
      hasApiAccess: true,
      hasPrioritySupport: true
    },
    enterprise: {
      monthlyPrice: 199.99,
      annualPrice: 1999.99,
      maxStudents: -1,
      maxTeachers: -1,
      maxStorageGb: 200,
      hasAdvancedAnalytics: true,
      hasCustomBranding: true,
      hasApiAccess: true,
      hasPrioritySupport: true
    }
  };
  
  return plans[planType] || plans.basic;
}

module.exports = router;
