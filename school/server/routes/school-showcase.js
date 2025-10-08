const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { body, validationResult } = require('express-validator');
const authenticateToken = require('../middleware/auth');

// ============================================================================
// ACHIEVEMENTS
// ============================================================================

// Get all achievements for school (Admin)
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { category } = req.query;
    
    let query = db('achievements')
      .where({ school_id: schoolId })
      .orderBy('achievement_date', 'desc');
    
    if (category) {
      query = query.where({ category });
    }
    
    const achievements = await query;
    
    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements'
    });
  }
});

// Get public achievements (no auth required)
router.get('/public/:schoolId/achievements', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const achievements = await db('achievements')
      .where({ 
        school_id: schoolId,
        is_published: true
      })
      .orderBy('achievement_date', 'desc')
      .limit(20);
    
    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Error fetching public achievements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch achievements'
    });
  }
});

// Create achievement
router.post('/achievements', authenticateToken, [
  body('title').notEmpty().withMessage('Title is required'),
  body('category').isIn(['academic', 'sports', 'cultural', 'other']).withMessage('Invalid category')
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
      title, description, category, achievement_date,
      award_by, image_url, participants, is_featured, is_published
    } = req.body;

    const [achievement] = await db('achievements').insert({
      school_id: req.user.schoolId,
      title,
      description,
      category,
      achievement_date,
      award_by,
      image_url,
      participants: participants ? JSON.stringify(participants) : null,
      is_featured: is_featured || false,
      is_published: is_published !== undefined ? is_published : true
    }).returning('*');

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: achievement
    });
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create achievement'
    });
  }
});

// Update achievement
router.put('/achievements/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const achievement = await db('achievements')
      .where({ id, school_id: schoolId })
      .first();

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    const updateData = {};
    const allowedFields = ['title', 'description', 'category', 'achievement_date', 
                          'award_by', 'image_url', 'participants', 'is_featured', 'is_published'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = field === 'participants' && req.body[field]
          ? JSON.stringify(req.body[field])
          : req.body[field];
      }
    });

    updateData.updated_at = db.fn.now();

    await db('achievements').where({ id }).update(updateData);

    const updated = await db('achievements').where({ id }).first();

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update achievement'
    });
  }
});

// Delete achievement
router.delete('/achievements/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    await db('achievements')
      .where({ id, school_id: schoolId })
      .del();

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete achievement'
    });
  }
});

// ============================================================================
// GALLERY
// ============================================================================

// Get all gallery albums
router.get('/gallery', authenticateToken, async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { category } = req.query;
    
    let query = db('gallery')
      .where({ school_id: schoolId })
      .orderBy('event_date', 'desc');
    
    if (category) {
      query = query.where({ category });
    }
    
    const albums = await query;
    
    res.json({
      success: true,
      data: albums
    });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery'
    });
  }
});

// Get public gallery
router.get('/public/:schoolId/gallery', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const albums = await db('gallery')
      .where({ 
        school_id: schoolId,
        is_published: true
      })
      .orderBy('event_date', 'desc');
    
    res.json({
      success: true,
      data: albums
    });
  } catch (error) {
    console.error('Error fetching public gallery:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery'
    });
  }
});

// Create gallery album
router.post('/gallery', authenticateToken, [
  body('album_name').notEmpty().withMessage('Album name is required'),
  body('category').isIn(['sports', 'cultural', 'academic', 'festival', 'excursion', 'other'])
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
      album_name, description, category, event_date,
      image_url, images, tags, is_featured, is_published
    } = req.body;

    const [album] = await db('gallery').insert({
      school_id: req.user.schoolId,
      album_name,
      description,
      category,
      event_date,
      image_url,
      images: images ? JSON.stringify(images) : null,
      tags: tags ? JSON.stringify(tags) : null,
      is_featured: is_featured || false,
      is_published: is_published !== undefined ? is_published : true
    }).returning('*');

    res.status(201).json({
      success: true,
      message: 'Gallery album created successfully',
      data: album
    });
  } catch (error) {
    console.error('Error creating gallery album:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create gallery album'
    });
  }
});

// Update gallery album
router.put('/gallery/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const album = await db('gallery')
      .where({ id, school_id: schoolId })
      .first();

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found'
      });
    }

    const updateData = {};
    const allowedFields = ['album_name', 'description', 'category', 'event_date', 
                          'image_url', 'images', 'tags', 'is_featured', 'is_published'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = (field === 'images' || field === 'tags') && req.body[field]
          ? JSON.stringify(req.body[field])
          : req.body[field];
      }
    });

    updateData.updated_at = db.fn.now();

    await db('gallery').where({ id }).update(updateData);

    const updated = await db('gallery').where({ id }).first();

    res.json({
      success: true,
      message: 'Gallery album updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating gallery album:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update gallery album'
    });
  }
});

// Delete gallery album
router.delete('/gallery/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    await db('gallery')
      .where({ id, school_id: schoolId })
      .del();

    res.json({
      success: true,
      message: 'Gallery album deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting gallery album:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete gallery album'
    });
  }
});

// ============================================================================
// EVENTS
// ============================================================================

// Get all events
router.get('/events', authenticateToken, async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { status, event_type } = req.query;
    
    let query = db('school_events')
      .where({ school_id: schoolId })
      .orderBy('event_date', 'desc');
    
    if (status) {
      query = query.where({ status });
    }
    
    if (event_type) {
      query = query.where({ event_type });
    }
    
    const events = await query;
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// Get public events
router.get('/public/:schoolId/events', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    const events = await db('school_events')
      .where({ 
        school_id: schoolId,
        is_published: true
      })
      .orderBy('event_date', 'desc');
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
});

// Create event
router.post('/events', authenticateToken, [
  body('event_name').notEmpty().withMessage('Event name is required'),
  body('event_type').isIn(['sports', 'cultural', 'festival', 'academic', 'competition', 'other']),
  body('event_date').notEmpty().withMessage('Event date is required')
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
      event_name, description, event_type, event_date, end_date,
      venue, organizer, image_url, highlights, status, is_featured, is_published
    } = req.body;

    const [event] = await db('school_events').insert({
      school_id: req.user.schoolId,
      event_name,
      description,
      event_type,
      event_date,
      end_date,
      venue,
      organizer,
      image_url,
      highlights: highlights ? JSON.stringify(highlights) : null,
      status: status || 'upcoming',
      is_featured: is_featured || false,
      is_published: is_published !== undefined ? is_published : true
    }).returning('*');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

// Update event
router.put('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const event = await db('school_events')
      .where({ id, school_id: schoolId })
      .first();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const updateData = {};
    const allowedFields = ['event_name', 'description', 'event_type', 'event_date', 'end_date',
                          'venue', 'organizer', 'image_url', 'highlights', 'status', 'is_featured', 'is_published'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = field === 'highlights' && req.body[field]
          ? JSON.stringify(req.body[field])
          : req.body[field];
      }
    });

    updateData.updated_at = db.fn.now();

    await db('school_events').where({ id }).update(updateData);

    const updated = await db('school_events').where({ id }).first();

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
});

// Delete event
router.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    await db('school_events')
      .where({ id, school_id: schoolId })
      .del();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
});

module.exports = router;
