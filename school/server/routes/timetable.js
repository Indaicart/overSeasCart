const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// Create timetable entry
router.post('/', authenticateToken, requireAdmin, [
  body('classId').isUUID(),
  body('subjectId').isUUID(),
  body('teacherId').isUUID(),
  body('dayOfWeek').isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room } = req.body;

    // Check for time conflicts
    const conflict = await checkTimeConflict(teacherId, classId, dayOfWeek, startTime, endTime);
    if (conflict) {
      return res.status(400).json({ 
        message: 'Time conflict detected',
        conflict: conflict
      });
    }

    const [timetableEntry] = await db('timetable').insert({
      class_id: classId,
      subject_id: subjectId,
      teacher_id: teacherId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      room: room
    }).returning('*');

    res.status(201).json({
      message: 'Timetable entry created successfully',
      timetable: {
        id: timetableEntry.id,
        dayOfWeek: timetableEntry.day_of_week,
        startTime: timetableEntry.start_time,
        endTime: timetableEntry.end_time
      }
    });
  } catch (error) {
    console.error('Create timetable error:', error);
    res.status(500).json({ message: 'Failed to create timetable entry' });
  }
});

// Get timetable for a class
router.get('/class/:classId', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { classId } = req.params;

    const timetable = await db('timetable')
      .join('subjects', 'timetable.subject_id', 'subjects.id')
      .join('teachers', 'timetable.teacher_id', 'teachers.id')
      .join('users', 'teachers.user_id', 'users.id')
      .select(
        'timetable.*',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'users.first_name as teacher_first_name',
        'users.last_name as teacher_last_name'
      )
      .where('timetable.class_id', classId)
      .where('timetable.is_active', true)
      .orderBy('timetable.day_of_week', 'asc')
      .orderBy('timetable.start_time', 'asc');

    // Group by day
    const timetableByDay = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      timetableByDay[day] = [];
    });

    timetable.forEach(entry => {
      timetableByDay[entry.day_of_week].push({
        id: entry.id,
        subjectId: entry.subject_id,
        subjectName: entry.subject_name,
        subjectCode: entry.subject_code,
        teacherId: entry.teacher_id,
        teacherName: `${entry.teacher_first_name} ${entry.teacher_last_name}`,
        startTime: entry.start_time,
        endTime: entry.end_time,
        room: entry.room
      });
    });

    res.json(timetableByDay);
  } catch (error) {
    console.error('Get class timetable error:', error);
    res.status(500).json({ message: 'Failed to fetch class timetable' });
  }
});

// Get timetable for a teacher
router.get('/teacher/:teacherId', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { teacherId } = req.params;

    const timetable = await db('timetable')
      .join('subjects', 'timetable.subject_id', 'subjects.id')
      .join('classes', 'timetable.class_id', 'classes.id')
      .select(
        'timetable.*',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'classes.name as class_name',
        'classes.code as class_code'
      )
      .where('timetable.teacher_id', teacherId)
      .where('timetable.is_active', true)
      .orderBy('timetable.day_of_week', 'asc')
      .orderBy('timetable.start_time', 'asc');

    // Group by day
    const timetableByDay = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      timetableByDay[day] = [];
    });

    timetable.forEach(entry => {
      timetableByDay[entry.day_of_week].push({
        id: entry.id,
        classId: entry.class_id,
        className: entry.class_name,
        classCode: entry.class_code,
        subjectId: entry.subject_id,
        subjectName: entry.subject_name,
        subjectCode: entry.subject_code,
        startTime: entry.start_time,
        endTime: entry.end_time,
        room: entry.room
      });
    });

    res.json(timetableByDay);
  } catch (error) {
    console.error('Get teacher timetable error:', error);
    res.status(500).json({ message: 'Failed to fetch teacher timetable' });
  }
});

// Get timetable for a room
router.get('/room/:room', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { room } = req.params;

    const timetable = await db('timetable')
      .join('subjects', 'timetable.subject_id', 'subjects.id')
      .join('classes', 'timetable.class_id', 'classes.id')
      .join('teachers', 'timetable.teacher_id', 'teachers.id')
      .join('users', 'teachers.user_id', 'users.id')
      .select(
        'timetable.*',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'classes.name as class_name',
        'classes.code as class_code',
        'users.first_name as teacher_first_name',
        'users.last_name as teacher_last_name'
      )
      .where('timetable.room', room)
      .where('timetable.is_active', true)
      .orderBy('timetable.day_of_week', 'asc')
      .orderBy('timetable.start_time', 'asc');

    // Group by day
    const timetableByDay = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      timetableByDay[day] = [];
    });

    timetable.forEach(entry => {
      timetableByDay[entry.day_of_week].push({
        id: entry.id,
        classId: entry.class_id,
        className: entry.class_name,
        classCode: entry.class_code,
        subjectId: entry.subject_id,
        subjectName: entry.subject_name,
        subjectCode: entry.subject_code,
        teacherId: entry.teacher_id,
        teacherName: `${entry.teacher_first_name} ${entry.teacher_last_name}`,
        startTime: entry.start_time,
        endTime: entry.end_time
      });
    });

    res.json(timetableByDay);
  } catch (error) {
    console.error('Get room timetable error:', error);
    res.status(500).json({ message: 'Failed to fetch room timetable' });
  }
});

// Update timetable entry
router.put('/:id', authenticateToken, requireAdmin, [
  body('dayOfWeek').optional().isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, room, isActive } = req.body;

    const timetableEntry = await db('timetable').where('id', req.params.id).first();
    if (!timetableEntry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    // Check for time conflicts if time is being changed
    if (startTime || endTime || dayOfWeek || teacherId || classId) {
      const finalTeacherId = teacherId || timetableEntry.teacher_id;
      const finalClassId = classId || timetableEntry.class_id;
      const finalDayOfWeek = dayOfWeek || timetableEntry.day_of_week;
      const finalStartTime = startTime || timetableEntry.start_time;
      const finalEndTime = endTime || timetableEntry.end_time;

      const conflict = await checkTimeConflict(
        finalTeacherId, 
        finalClassId, 
        finalDayOfWeek, 
        finalStartTime, 
        finalEndTime, 
        req.params.id
      );
      
      if (conflict) {
        return res.status(400).json({ 
          message: 'Time conflict detected',
          conflict: conflict
        });
      }
    }

    const updateData = {};
    if (classId) updateData.class_id = classId;
    if (subjectId) updateData.subject_id = subjectId;
    if (teacherId) updateData.teacher_id = teacherId;
    if (dayOfWeek) updateData.day_of_week = dayOfWeek;
    if (startTime) updateData.start_time = startTime;
    if (endTime) updateData.end_time = endTime;
    if (room !== undefined) updateData.room = room;
    if (isActive !== undefined) updateData.is_active = isActive;

    await db('timetable').where('id', req.params.id).update(updateData);

    res.json({ message: 'Timetable entry updated successfully' });
  } catch (error) {
    console.error('Update timetable error:', error);
    res.status(500).json({ message: 'Failed to update timetable entry' });
  }
});

// Delete timetable entry
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const timetableEntry = await db('timetable').where('id', req.params.id).first();
    if (!timetableEntry) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    await db('timetable').where('id', req.params.id).del();

    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    console.error('Delete timetable error:', error);
    res.status(500).json({ message: 'Failed to delete timetable entry' });
  }
});

// Get available time slots for a teacher
router.get('/teacher/:teacherId/available', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { dayOfWeek } = req.query;

    if (!dayOfWeek) {
      return res.status(400).json({ message: 'Day of week is required' });
    }

    // Get teacher's current schedule for the day
    const currentSchedule = await db('timetable')
      .select('start_time', 'end_time')
      .where('teacher_id', teacherId)
      .where('day_of_week', dayOfWeek)
      .where('is_active', true)
      .orderBy('start_time', 'asc');

    // Generate available time slots (assuming 8 AM to 5 PM)
    const availableSlots = [];
    const startHour = 8;
    const endHour = 17;
    const slotDuration = 1; // 1 hour slots

    for (let hour = startHour; hour < endHour; hour += slotDuration) {
      const slotStart = `${hour.toString().padStart(2, '0')}:00`;
      const slotEnd = `${(hour + slotDuration).toString().padStart(2, '0')}:00`;

      // Check if this slot conflicts with existing schedule
      const hasConflict = currentSchedule.some(schedule => {
        return (slotStart < schedule.end_time && slotEnd > schedule.start_time);
      });

      if (!hasConflict) {
        availableSlots.push({
          startTime: slotStart,
          endTime: slotEnd
        });
      }
    }

    res.json(availableSlots);
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ message: 'Failed to fetch available time slots' });
  }
});

// Get timetable statistics
router.get('/stats', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { classId, teacherId } = req.query;

    let query = db('timetable')
      .join('classes', 'timetable.class_id', 'classes.id')
      .join('subjects', 'timetable.subject_id', 'subjects.id')
      .join('teachers', 'timetable.teacher_id', 'teachers.id')
      .join('users', 'teachers.user_id', 'users.id');

    if (classId) {
      query = query.where('timetable.class_id', classId);
    }
    if (teacherId) {
      query = query.where('timetable.teacher_id', teacherId);
    }

    const stats = await query
      .select(
        'classes.name as class_name',
        'classes.code as class_code',
        'subjects.name as subject_name',
        'subjects.code as subject_code',
        'users.first_name as teacher_first_name',
        'users.last_name as teacher_last_name',
        db.raw('COUNT(*) as total_periods'),
        db.raw('COUNT(DISTINCT timetable.day_of_week) as days_per_week')
      )
      .where('timetable.is_active', true)
      .groupBy('classes.id', 'classes.name', 'classes.code', 'subjects.id', 'subjects.name', 'subjects.code', 'teachers.id', 'users.first_name', 'users.last_name');

    const formattedStats = stats.map(stat => ({
      className: stat.class_name,
      classCode: stat.class_code,
      subjectName: stat.subject_name,
      subjectCode: stat.subject_code,
      teacherName: `${stat.teacher_first_name} ${stat.teacher_last_name}`,
      totalPeriods: parseInt(stat.total_periods),
      daysPerWeek: parseInt(stat.days_per_week)
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Get timetable stats error:', error);
    res.status(500).json({ message: 'Failed to fetch timetable statistics' });
  }
});

// Helper function to check time conflicts
async function checkTimeConflict(teacherId, classId, dayOfWeek, startTime, endTime, excludeId = null) {
  // Check teacher conflicts
  let teacherQuery = db('timetable')
    .where('teacher_id', teacherId)
    .where('day_of_week', dayOfWeek)
    .where('is_active', true)
    .where(function() {
      this.where('start_time', '<', endTime)
        .andWhere('end_time', '>', startTime);
    });

  if (excludeId) {
    teacherQuery = teacherQuery.where('id', '!=', excludeId);
  }

  const teacherConflict = await teacherQuery.first();
  if (teacherConflict) {
    return {
      type: 'teacher',
      message: 'Teacher has another class at this time'
    };
  }

  // Check class conflicts
  let classQuery = db('timetable')
    .where('class_id', classId)
    .where('day_of_week', dayOfWeek)
    .where('is_active', true)
    .where(function() {
      this.where('start_time', '<', endTime)
        .andWhere('end_time', '>', startTime);
    });

  if (excludeId) {
    classQuery = classQuery.where('id', '!=', excludeId);
  }

  const classConflict = await classQuery.first();
  if (classConflict) {
    return {
      type: 'class',
      message: 'Class has another subject at this time'
    };
  }

  return null;
}

module.exports = router;
