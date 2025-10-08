const express = require('express');
const router = express.Router();
const db = require('../db/connection');

/**
 * GET /api/activity-logs
 * Get activity logs for the school with pagination and filters
 */
router.get('/', async (req, res) => {
  try {
    const { schoolId, role } = req.user;
    const { 
      page = 1, 
      limit = 50, 
      action, 
      resourceType, 
      userId,
      startDate,
      endDate
    } = req.query;

    // Only admins can view activity logs
    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view activity logs'
      });
    }

    const offset = (page - 1) * limit;

    // Build query
    let query = db('activity_logs')
      .join('users', 'activity_logs.user_id', 'users.id')
      .where('activity_logs.school_id', schoolId)
      .select(
        'activity_logs.*',
        'users.name as user_name',
        'users.email as user_email'
      );

    // Apply filters
    if (action) {
      query = query.where('activity_logs.action', action);
    }
    if (resourceType) {
      query = query.where('activity_logs.resource_type', resourceType);
    }
    if (userId) {
      query = query.where('activity_logs.user_id', userId);
    }
    if (startDate) {
      query = query.where('activity_logs.created_at', '>=', startDate);
    }
    if (endDate) {
      query = query.where('activity_logs.created_at', '<=', endDate);
    }

    // Get total count
    const countQuery = query.clone();
    const [{ count }] = await countQuery.count('* as count');

    // Get logs
    const logs = await query
      .orderBy('activity_logs.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Parse metadata JSON
    const logsWithMetadata = logs.map(log => ({
      ...log,
      metadata: log.metadata ? JSON.parse(log.metadata) : null
    }));

    res.json({
      success: true,
      data: {
        logs: logsWithMetadata,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(count),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
});

/**
 * GET /api/activity-logs/summary
 * Get activity summary statistics
 */
router.get('/summary', async (req, res) => {
  try {
    const { schoolId, role } = req.user;
    const { startDate, endDate } = req.query;

    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view activity logs'
      });
    }

    let query = db('activity_logs')
      .where('school_id', schoolId);

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }
    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    // Get summary statistics
    const [totalLogs] = await query.clone().count('* as count');
    
    const actionCounts = await query.clone()
      .select('action')
      .count('* as count')
      .groupBy('action')
      .orderBy('count', 'desc');

    const resourceCounts = await query.clone()
      .select('resource_type')
      .count('* as count')
      .groupBy('resource_type')
      .orderBy('count', 'desc');

    const topUsers = await query.clone()
      .join('users', 'activity_logs.user_id', 'users.id')
      .select('users.id', 'users.name', 'users.email')
      .count('* as activity_count')
      .groupBy('users.id', 'users.name', 'users.email')
      .orderBy('activity_count', 'desc')
      .limit(10);

    // Recent activities
    const recentActivities = await query.clone()
      .join('users', 'activity_logs.user_id', 'users.id')
      .select(
        'activity_logs.*',
        'users.name as user_name',
        'users.email as user_email'
      )
      .orderBy('activity_logs.created_at', 'desc')
      .limit(10);

    res.json({
      success: true,
      data: {
        totalLogs: parseInt(totalLogs.count),
        actionCounts,
        resourceCounts,
        topUsers,
        recentActivities: recentActivities.map(log => ({
          ...log,
          metadata: log.metadata ? JSON.parse(log.metadata) : null
        }))
      }
    });
  } catch (error) {
    console.error('Get activity summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity summary'
    });
  }
});

/**
 * DELETE /api/activity-logs/cleanup
 * Delete old activity logs (older than specified days)
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const { schoolId, role } = req.user;
    const { days = 90 } = req.body; // Default: keep 90 days

    if (role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can cleanup activity logs'
      });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deleted = await db('activity_logs')
      .where('school_id', schoolId)
      .where('created_at', '<', cutoffDate)
      .delete();

    res.json({
      success: true,
      message: `Deleted ${deleted} old activity logs`,
      data: { deleted }
    });
  } catch (error) {
    console.error('Cleanup activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup activity logs'
    });
  }
});

module.exports = router;
