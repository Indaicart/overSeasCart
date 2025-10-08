const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// Get user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, category } = req.query;
    const offset = (page - 1) * limit;

    let query = db('notifications')
      .select('*')
      .where('user_id', req.user.id);

    if (isRead !== undefined) {
      query = query.where('is_read', isRead === 'true');
    }
    if (category) {
      query = query.where('category', category);
    }

    const notifications = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('notifications')
      .where('user_id', req.user.id)
      .count('* as count')
      .first();

    res.json({
      notifications: notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        isRead: notification.is_read,
        metadata: notification.metadata,
        createdAt: notification.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await db('notifications')
      .where('user_id', req.user.id)
      .where('is_read', false)
      .count('* as count')
      .first();

    res.json({ count: parseInt(count.count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await db('notifications')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await db('notifications')
      .where('id', req.params.id)
      .update({ is_read: true });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await db('notifications')
      .where('user_id', req.user.id)
      .where('is_read', false)
      .update({ is_read: true });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Create notification (admin/teacher only)
router.post('/', authenticateToken, requireTeacher, [
  body('title').notEmpty().trim(),
  body('message').notEmpty().trim(),
  body('type').isIn(['info', 'warning', 'success', 'error']),
  body('category').isIn(['attendance', 'grades', 'fees', 'general', 'emergency'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type, category, userIds, classIds, metadata } = req.body;

    let targetUserIds = [];

    if (userIds && userIds.length > 0) {
      // Send to specific users
      targetUserIds = userIds;
    } else if (classIds && classIds.length > 0) {
      // Send to all students in specified classes
      const students = await db('students')
        .select('user_id')
        .whereIn('class_id', classIds)
        .where('status', 'active');
      
      targetUserIds = students.map(student => student.user_id);

      // Also send to parents of these students
      const parentIds = await db('student_parents')
        .join('students', 'student_parents.student_id', 'students.id')
        .select('student_parents.parent_id')
        .whereIn('students.class_id', classIds)
        .where('students.status', 'active');

      const parentUserIds = await db('parents')
        .join('users', 'parents.user_id', 'users.id')
        .select('users.id')
        .whereIn('parents.id', parentIds.map(p => p.parent_id));

      targetUserIds = [...targetUserIds, ...parentUserIds.map(p => p.id)];
    } else {
      // Send to all users
      const allUsers = await db('users').select('id').where('is_active', true);
      targetUserIds = allUsers.map(user => user.id);
    }

    // Create notifications for all target users
    const notifications = targetUserIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type,
      category,
      metadata: metadata ? JSON.stringify(metadata) : null
    }));

    await db('notifications').insert(notifications);

    res.status(201).json({
      message: 'Notifications sent successfully',
      count: notifications.length
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Failed to create notifications' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await db('notifications')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await db('notifications').where('id', req.params.id).del();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Get notification statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = db('notifications');

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }
    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const stats = await query
      .select(
        'category',
        'type',
        db.raw('COUNT(*) as count'),
        db.raw('COUNT(CASE WHEN is_read = true THEN 1 END) as read_count'),
        db.raw('COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count')
      )
      .groupBy('category', 'type');

    const formattedStats = stats.map(stat => ({
      category: stat.category,
      type: stat.type,
      totalCount: parseInt(stat.count),
      readCount: parseInt(stat.read_count),
      unreadCount: parseInt(stat.unread_count),
      readRate: stat.count > 0 ? Math.round((parseInt(stat.read_count) / parseInt(stat.count)) * 10000) / 100 : 0
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ message: 'Failed to fetch notification statistics' });
  }
});

// Helper function to create notification
async function createNotification(userId, title, message, type = 'info', category = 'general', metadata = null) {
  try {
    await db('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      category,
      metadata: metadata ? JSON.stringify(metadata) : null
    });
  } catch (error) {
    console.error('Create notification helper error:', error);
  }
}

module.exports = { router, createNotification };
