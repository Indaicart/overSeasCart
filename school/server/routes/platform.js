const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Get platform statistics
router.get('/stats', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    // Get basic counts
    const [
      totalSchools,
      activeSubscriptions,
      totalUsers,
      totalRevenue
    ] = await Promise.all([
      db('schools').count('* as count').first(),
      db('subscriptions').where('status', 'active').count('* as count').first(),
      db('users').count('* as count').first(),
      db('billing_history')
        .where('status', 'paid')
        .sum('amount as total')
        .first()
    ]);

    // Get subscription status breakdown
    const subscriptionStatus = await db('subscriptions')
      .select('status')
      .count('* as count')
      .groupBy('status');

    // Get plan distribution
    const planDistribution = await db('subscriptions')
      .select('plan_type')
      .count('* as count')
      .groupBy('plan_type');

    // Get recent activity
    const recentSchools = await db('schools')
      .select('name', 'email', 'created_at')
      .orderBy('created_at', 'desc')
      .limit(5);

    const recentSubscriptions = await db('subscriptions')
      .join('schools', 'subscriptions.school_id', 'schools.id')
      .select('schools.name', 'subscriptions.plan_type', 'subscriptions.status', 'subscriptions.created_at')
      .orderBy('subscriptions.created_at', 'desc')
      .limit(5);

    // Calculate percentages for plan distribution
    const totalSubscriptions = parseInt(totalSchools.count);
    const planDistributionWithPercentage = planDistribution.map(plan => ({
      plan: plan.plan_type,
      count: parseInt(plan.count),
      percentage: totalSubscriptions > 0 ? Math.round((parseInt(plan.count) / totalSubscriptions) * 100) : 0
    }));

    res.json({
      totalSchools: parseInt(totalSchools.count),
      activeSubscriptions: parseInt(activeSubscriptions.count),
      totalUsers: parseInt(totalUsers.count),
      totalRevenue: parseFloat(totalRevenue.total) || 0,
      subscriptionStatus: subscriptionStatus.map(status => ({
        status: status.status,
        count: parseInt(status.count)
      })),
      planDistribution: planDistributionWithPercentage,
      recentSchools: recentSchools.map(school => ({
        name: school.name,
        email: school.email,
        createdAt: school.created_at
      })),
      recentSubscriptions: recentSubscriptions.map(sub => ({
        schoolName: sub.name,
        planType: sub.plan_type,
        status: sub.status,
        createdAt: sub.created_at
      }))
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ message: 'Failed to fetch platform statistics' });
  }
});

// Get platform analytics
router.get('/analytics', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get usage trends
    let usageQuery = db('usage_analytics');
    if (startDate) {
      usageQuery = usageQuery.where('date', '>=', startDate);
    }
    if (endDate) {
      usageQuery = usageQuery.where('date', '<=', endDate);
    }

    const usageTrends = await usageQuery
      .select(
        'date',
        db.raw('SUM(active_users) as total_active_users'),
        db.raw('SUM(total_students) as total_students'),
        db.raw('SUM(total_teachers) as total_teachers'),
        db.raw('SUM(storage_used_mb) as total_storage_mb'),
        db.raw('SUM(api_calls) as total_api_calls')
      )
      .groupBy('date')
      .orderBy('date', 'desc')
      .limit(30);

    // Get revenue trends
    let revenueQuery = db('billing_history')
      .where('status', 'paid');
    
    if (startDate) {
      revenueQuery = revenueQuery.where('billing_date', '>=', startDate);
    }
    if (endDate) {
      revenueQuery = revenueQuery.where('billing_date', '<=', endDate);
    }

    const revenueTrends = await revenueQuery
      .select(
        db.raw('DATE_TRUNC(\'month\', billing_date) as month'),
        db.raw('SUM(amount) as total_revenue'),
        db.raw('COUNT(*) as transaction_count')
      )
      .groupBy(db.raw('DATE_TRUNC(\'month\', billing_date)'))
      .orderBy('month', 'desc')
      .limit(12);

    res.json({
      usageTrends: usageTrends.map(trend => ({
        date: trend.date,
        totalActiveUsers: parseInt(trend.total_active_users),
        totalStudents: parseInt(trend.total_students),
        totalTeachers: parseInt(trend.total_teachers),
        totalStorageMb: parseInt(trend.total_storage_mb),
        totalApiCalls: parseInt(trend.total_api_calls)
      })),
      revenueTrends: revenueTrends.map(trend => ({
        month: trend.month,
        totalRevenue: parseFloat(trend.total_revenue),
        transactionCount: parseInt(trend.transaction_count)
      }))
    });
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch platform analytics' });
  }
});

// Get top performing schools
router.get('/top-schools', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topSchools = await db('schools')
      .join('subscriptions', 'schools.id', 'subscriptions.school_id')
      .leftJoin('users', 'schools.id', 'users.school_id')
      .select(
        'schools.id',
        'schools.name',
        'schools.email',
        'subscriptions.plan_type',
        'subscriptions.status',
        db.raw('COUNT(users.id) as user_count')
      )
      .groupBy('schools.id', 'schools.name', 'schools.email', 'subscriptions.plan_type', 'subscriptions.status')
      .orderBy('user_count', 'desc')
      .limit(parseInt(limit));

    res.json(topSchools.map(school => ({
      id: school.id,
      name: school.name,
      email: school.email,
      planType: school.plan_type,
      status: school.status,
      userCount: parseInt(school.user_count)
    })));
  } catch (error) {
    console.error('Get top schools error:', error);
    res.status(500).json({ message: 'Failed to fetch top schools' });
  }
});

module.exports = router;
