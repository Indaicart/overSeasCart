const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all subscriptions (super admin only)
router.get('/', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, plan_type } = req.query;
    const offset = (page - 1) * limit;

    let query = db('subscriptions')
      .join('schools', 'subscriptions.school_id', 'schools.id')
      .select(
        'subscriptions.*',
        'schools.name as school_name',
        'schools.email as school_email'
      );

    if (status) {
      query = query.where('subscriptions.status', status);
    }
    if (plan_type) {
      query = query.where('subscriptions.plan_type', plan_type);
    }

    const subscriptions = await query
      .orderBy('subscriptions.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('subscriptions').count('* as count').first();

    res.json({
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        schoolId: sub.school_id,
        schoolName: sub.school_name,
        schoolEmail: sub.school_email,
        planType: sub.plan_type,
        status: sub.status,
        startDate: sub.start_date,
        endDate: sub.end_date,
        trialEndDate: sub.trial_end_date,
        monthlyPrice: sub.monthly_price,
        annualPrice: sub.annual_price,
        billingCycle: sub.billing_cycle,
        maxStudents: sub.max_students,
        maxTeachers: sub.max_teachers,
        maxStorageGb: sub.max_storage_gb,
        hasAdvancedAnalytics: sub.has_advanced_analytics,
        hasCustomBranding: sub.has_custom_branding,
        hasApiAccess: sub.has_api_access,
        hasPrioritySupport: sub.has_priority_support,
        features: sub.features,
        createdAt: sub.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Failed to fetch subscriptions' });
  }
});

// Get subscription for current school
router.get('/my-school', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const subscription = await db('subscriptions')
      .where('school_id', req.user.school_id)
      .first();

    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found for this school' });
    }

    res.json({
      id: subscription.id,
      planType: subscription.plan_type,
      status: subscription.status,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      trialEndDate: subscription.trial_end_date,
      monthlyPrice: subscription.monthly_price,
      annualPrice: subscription.annual_price,
      billingCycle: subscription.billing_cycle,
      maxStudents: subscription.max_students,
      maxTeachers: subscription.max_teachers,
      maxStorageGb: subscription.max_storage_gb,
      hasAdvancedAnalytics: subscription.has_advanced_analytics,
      hasCustomBranding: subscription.has_custom_branding,
      hasApiAccess: subscription.has_api_access,
      hasPrioritySupport: subscription.has_priority_support,
      features: subscription.features
    });
  } catch (error) {
    console.error('Get school subscription error:', error);
    res.status(500).json({ message: 'Failed to fetch subscription' });
  }
});

// Create new subscription
router.post('/', authenticateToken, requireSuperAdmin, [
  body('schoolId').isUUID(),
  body('planType').isIn(['basic', 'standard', 'premium', 'enterprise']),
  body('monthlyPrice').isFloat({ min: 0 }),
  body('maxStudents').isInt({ min: 1 }),
  body('maxTeachers').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      schoolId, planType, startDate, endDate, trialEndDate,
      monthlyPrice, annualPrice, billingCycle, maxStudents,
      maxTeachers, maxStorageGb, hasAdvancedAnalytics,
      hasCustomBranding, hasApiAccess, hasPrioritySupport, features
    } = req.body;

    // Check if school already has an active subscription
    const existingSubscription = await db('subscriptions')
      .where('school_id', schoolId)
      .whereIn('status', ['active', 'trial'])
      .first();

    if (existingSubscription) {
      return res.status(400).json({ message: 'School already has an active subscription' });
    }

    const [subscription] = await db('subscriptions').insert({
      school_id: schoolId,
      plan_type: planType,
      start_date: startDate || new Date(),
      end_date: endDate,
      trial_end_date: trialEndDate,
      monthly_price: monthlyPrice,
      annual_price: annualPrice,
      billing_cycle: billingCycle || 'monthly',
      max_students: maxStudents,
      max_teachers: maxTeachers,
      max_storage_gb: maxStorageGb || 5,
      has_advanced_analytics: hasAdvancedAnalytics || false,
      has_custom_branding: hasCustomBranding || false,
      has_api_access: hasApiAccess || false,
      has_priority_support: hasPrioritySupport || false,
      features: features ? JSON.stringify(features) : null
    }).returning('*');

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: {
        id: subscription.id,
        planType: subscription.plan_type,
        status: subscription.status
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
});

// Update subscription
router.put('/:id', authenticateToken, requireSuperAdmin, [
  body('planType').optional().isIn(['basic', 'standard', 'premium', 'enterprise']),
  body('status').optional().isIn(['active', 'inactive', 'suspended', 'cancelled', 'trial'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      planType, status, endDate, monthlyPrice, annualPrice,
      maxStudents, maxTeachers, maxStorageGb, hasAdvancedAnalytics,
      hasCustomBranding, hasApiAccess, hasPrioritySupport, features
    } = req.body;

    const subscription = await db('subscriptions').where('id', req.params.id).first();
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    const updateData = {};
    if (planType) updateData.plan_type = planType;
    if (status) updateData.status = status;
    if (endDate) updateData.end_date = endDate;
    if (monthlyPrice) updateData.monthly_price = monthlyPrice;
    if (annualPrice) updateData.annual_price = annualPrice;
    if (maxStudents) updateData.max_students = maxStudents;
    if (maxTeachers) updateData.max_teachers = maxTeachers;
    if (maxStorageGb) updateData.max_storage_gb = maxStorageGb;
    if (hasAdvancedAnalytics !== undefined) updateData.has_advanced_analytics = hasAdvancedAnalytics;
    if (hasCustomBranding !== undefined) updateData.has_custom_branding = hasCustomBranding;
    if (hasApiAccess !== undefined) updateData.has_api_access = hasApiAccess;
    if (hasPrioritySupport !== undefined) updateData.has_priority_support = hasPrioritySupport;
    if (features) updateData.features = JSON.stringify(features);

    await db('subscriptions').where('id', req.params.id).update(updateData);

    res.json({ message: 'Subscription updated successfully' });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
});

// Get subscription plans (public endpoint for registration page)
router.get('/plans', async (req, res) => {
  try {
    const plans = await db('subscription_plans')
      .where('is_active', true)
      .orderBy('display_order', 'asc')
      .select('*');

    // Format the response
    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthly_price: parseFloat(plan.monthly_price),
      annual_price: parseFloat(plan.annual_price),
      max_students: plan.max_students,
      max_teachers: plan.max_teachers,
      storage_gb: plan.storage_gb,
      has_advanced_analytics: plan.has_advanced_analytics,
      has_custom_branding: plan.has_custom_branding,
      has_api_access: plan.has_api_access,
      has_priority_support: plan.has_priority_support,
      features: plan.features // Already a JSON string
    }));

    res.json({
      success: true,
      data: formattedPlans
    });
  } catch (error) {
    console.error('Get subscription plans error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch subscription plans' 
    });
  }
});

// Get usage analytics for school
router.get('/usage', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = db('usage_analytics')
      .where('school_id', req.user.school_id);

    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }

    const usage = await query
      .orderBy('date', 'desc')
      .limit(30);

    // Get current usage
    const currentUsage = await db('usage_analytics')
      .where('school_id', req.user.school_id)
      .orderBy('date', 'desc')
      .first();

    // Get subscription limits
    const subscription = await db('subscriptions')
      .where('school_id', req.user.school_id)
      .first();

    res.json({
      currentUsage: currentUsage ? {
        activeUsers: currentUsage.active_users,
        totalStudents: currentUsage.total_students,
        totalTeachers: currentUsage.total_teachers,
        totalClasses: currentUsage.total_classes,
        storageUsedMb: currentUsage.storage_used_mb,
        apiCalls: currentUsage.api_calls
      } : null,
      limits: subscription ? {
        maxStudents: subscription.max_students,
        maxTeachers: subscription.max_teachers,
        maxStorageGb: subscription.max_storage_gb
      } : null,
      history: usage.map(record => ({
        date: record.date,
        activeUsers: record.active_users,
        totalStudents: record.total_students,
        totalTeachers: record.total_teachers,
        storageUsedMb: record.storage_used_mb,
        apiCalls: record.api_calls
      }))
    });
  } catch (error) {
    console.error('Get usage analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch usage analytics' });
  }
});

module.exports = router;
