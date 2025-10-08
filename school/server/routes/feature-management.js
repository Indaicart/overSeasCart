const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');
const requireSuperAdmin = require('../middleware/requireSuperAdmin');

// ============================================================================
// FEATURE MANAGEMENT (Super Admin Only)
// ============================================================================

// Get all features
router.get('/features', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { category, is_active } = req.query;
    
    let query = db('features').select('*').orderBy('display_order', 'asc');
    
    if (category) {
      query = query.where('category', category');
    }
    
    if (is_active !== undefined) {
      query = query.where('is_active', is_active === 'true');
    }
    
    const features = await query;
    
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch features'
    });
  }
});

// Get single feature
router.get('/features/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const feature = await db('features').where({ id }).first();
    
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }
    
    res.json({
      success: true,
      data: feature
    });
  } catch (error) {
    console.error('Error fetching feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feature'
    });
  }
});

// Create new feature
router.post('/features', authenticateToken, requireSuperAdmin, [
  body('feature_key').notEmpty().withMessage('Feature key is required'),
  body('feature_name').notEmpty().withMessage('Feature name is required'),
  body('category').isIn(['core', 'academic', 'financial', 'communication', 'advanced']).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      feature_key, feature_name, description, category,
      icon, is_core, is_active, display_order, metadata
    } = req.body;

    // Check if feature_key already exists
    const existing = await db('features').where({ feature_key }).first();
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Feature key already exists'
      });
    }

    const [feature] = await db('features').insert({
      feature_key,
      feature_name,
      description,
      category,
      icon,
      is_core: is_core || false,
      is_active: is_active !== undefined ? is_active : true,
      display_order: display_order || 999,
      metadata: metadata ? JSON.stringify(metadata) : null
    }).returning('*');

    res.status(201).json({
      success: true,
      message: 'Feature created successfully',
      data: feature
    });
  } catch (error) {
    console.error('Error creating feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create feature'
    });
  }
});

// Update feature
router.put('/features/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      feature_name, description, category, icon,
      is_core, is_active, display_order, metadata
    } = req.body;

    const feature = await db('features').where({ id }).first();
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    const updateData = {};
    if (feature_name) updateData.feature_name = feature_name;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (icon !== undefined) updateData.icon = icon;
    if (is_core !== undefined) updateData.is_core = is_core;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata);
    updateData.updated_at = db.fn.now();

    await db('features').where({ id }).update(updateData);

    const updatedFeature = await db('features').where({ id }).first();

    res.json({
      success: true,
      message: 'Feature updated successfully',
      data: updatedFeature
    });
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update feature'
    });
  }
});

// Toggle feature (enable/disable)
router.put('/features/:id/toggle', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const feature = await db('features').where({ id }).first();
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    // Core features cannot be disabled
    if (feature.is_core) {
      return res.status(400).json({
        success: false,
        message: 'Core features cannot be disabled'
      });
    }

    const newStatus = !feature.is_active;
    await db('features').where({ id }).update({
      is_active: newStatus,
      updated_at: db.fn.now()
    });

    res.json({
      success: true,
      message: `Feature ${newStatus ? 'enabled' : 'disabled'} successfully`,
      data: { is_active: newStatus }
    });
  } catch (error) {
    console.error('Error toggling feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle feature'
    });
  }
});

// Delete feature
router.delete('/features/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const feature = await db('features').where({ id }).first();
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found'
      });
    }

    // Core features cannot be deleted
    if (feature.is_core) {
      return res.status(400).json({
        success: false,
        message: 'Core features cannot be deleted'
      });
    }

    // Delete feature (will cascade delete plan_features)
    await db('features').where({ id }).del();

    res.json({
      success: true,
      message: 'Feature deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feature:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feature'
    });
  }
});

// ============================================================================
// PLAN-FEATURE ASSIGNMENT (Super Admin Only)
// ============================================================================

// Get features for a specific plan
router.get('/plans/:planId/features', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { planId } = req.params;

    // Get plan
    const plan = await db('subscription_plans').where({ id: planId }).first();
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Get all features with their assignment status for this plan
    const allFeatures = await db('features')
      .select('features.*')
      .orderBy('features.display_order', 'asc');

    const planFeatures = await db('plan_features')
      .where({ plan_id: planId })
      .select('feature_id', 'is_included', 'limitations');

    const planFeatureMap = {};
    planFeatures.forEach(pf => {
      planFeatureMap[pf.feature_id] = {
        is_included: pf.is_included,
        limitations: pf.limitations
      };
    });

    const featuresWithStatus = allFeatures.map(feature => ({
      ...feature,
      is_assigned: !!planFeatureMap[feature.id],
      is_included: planFeatureMap[feature.id]?.is_included || false,
      limitations: planFeatureMap[feature.id]?.limitations || null
    }));

    res.json({
      success: true,
      data: {
        plan: plan,
        features: featuresWithStatus
      }
    });
  } catch (error) {
    console.error('Error fetching plan features:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan features'
    });
  }
});

// Assign/Update features to a plan
router.post('/plans/:planId/features', authenticateToken, requireSuperAdmin, [
  body('feature_ids').isArray().withMessage('feature_ids must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { planId } = req.params;
    const { feature_ids, limitations } = req.body;

    // Verify plan exists
    const plan = await db('subscription_plans').where({ id: planId }).first();
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Delete existing assignments
    await db('plan_features').where({ plan_id: planId }).del();

    // Insert new assignments
    if (feature_ids && feature_ids.length > 0) {
      const assignments = feature_ids.map(featureId => ({
        plan_id: planId,
        feature_id: featureId,
        is_included: true,
        limitations: limitations ? JSON.stringify(limitations) : null
      }));

      await db('plan_features').insert(assignments);
    }

    res.json({
      success: true,
      message: 'Plan features updated successfully'
    });
  } catch (error) {
    console.error('Error assigning features to plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign features'
    });
  }
});

// Remove feature from plan
router.delete('/plans/:planId/features/:featureId', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { planId, featureId } = req.params;

    await db('plan_features')
      .where({ plan_id: planId, feature_id: featureId })
      .del();

    res.json({
      success: true,
      message: 'Feature removed from plan successfully'
    });
  } catch (error) {
    console.error('Error removing feature from plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove feature'
    });
  }
});

// Get feature categories
router.get('/features/categories', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const categories = [
      { value: 'core', label: 'Core Features', description: 'Essential features available in all plans' },
      { value: 'academic', label: 'Academic', description: 'Student learning and assessment features' },
      { value: 'financial', label: 'Financial', description: 'Fee and payment management' },
      { value: 'communication', label: 'Communication', description: 'Messaging and notification features' },
      { value: 'advanced', label: 'Advanced', description: 'Advanced and optional features' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

module.exports = router;
