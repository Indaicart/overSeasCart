const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// Mark attendance for a class on a specific date
router.post('/mark', authenticateToken, requireTeacher, [
  body('classId').isUUID(),
  body('date').isISO8601(),
  body('attendance').isArray(),
  body('attendance.*.studentId').isUUID(),
  body('attendance.*.status').isIn(['present', 'absent', 'late', 'excused'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { classId, date, attendance } = req.body;

    // Check if attendance already marked for this date and class
    const existingAttendance = await db('attendance')
      .where('class_id', classId)
      .where('date', date)
      .first();

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }

    const trx = await db.transaction();

    try {
      // Insert attendance records
      const attendanceRecords = attendance.map(record => ({
        student_id: record.studentId,
        class_id: classId,
        date,
        status: record.status,
        remarks: record.remarks || null,
        marked_by: req.user.id
      }));

      await trx('attendance').insert(attendanceRecords);

      await trx.commit();

      res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
});

// Get attendance for a class on a specific date
router.get('/class/:classId/date/:date', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { classId, date } = req.params;

    const attendance = await db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('users', 'students.user_id', 'users.id')
      .select(
        'attendance.*',
        'students.student_id',
        'students.roll_number',
        'users.first_name',
        'users.last_name'
      )
      .where('attendance.class_id', classId)
      .where('attendance.date', date)
      .orderBy('students.roll_number', 'asc');

    res.json(attendance.map(record => ({
      id: record.id,
      studentId: record.student_id,
      studentUserId: record.student_id,
      studentIdNumber: record.student_id,
      rollNumber: record.roll_number,
      firstName: record.first_name,
      lastName: record.last_name,
      status: record.status,
      remarks: record.remarks,
      markedBy: record.marked_by,
      createdAt: record.created_at
    })));
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

// Get attendance for a student
router.get('/student/:studentId', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { startDate, endDate, limit = 30 } = req.query;

    let query = db('attendance')
      .join('classes', 'attendance.class_id', 'classes.id')
      .select(
        'attendance.*',
        'classes.name as class_name',
        'classes.code as class_code'
      )
      .where('attendance.student_id', studentId);

    if (startDate) {
      query = query.where('attendance.date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('attendance.date', '<=', endDate);
    }

    const attendance = await query
      .orderBy('attendance.date', 'desc')
      .limit(parseInt(limit));

    res.json(attendance.map(record => ({
      id: record.id,
      date: record.date,
      status: record.status,
      remarks: record.remarks,
      className: record.class_name,
      classCode: record.class_code,
      markedBy: record.marked_by,
      createdAt: record.created_at
    })));
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch student attendance' });
  }
});

// Get attendance summary for a class
router.get('/class/:classId/summary', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { classId } = req.params;
    const { startDate, endDate } = req.query;

    // Get all students in the class
    const students = await db('students')
      .join('users', 'students.user_id', 'users.id')
      .select(
        'students.id',
        'students.student_id',
        'students.roll_number',
        'users.first_name',
        'users.last_name'
      )
      .where('students.class_id', classId)
      .where('students.status', 'active')
      .orderBy('students.roll_number', 'asc');

    // Get attendance records for the period
    let attendanceQuery = db('attendance')
      .select('student_id', 'status', 'date')
      .where('class_id', classId);

    if (startDate) {
      attendanceQuery = attendanceQuery.where('date', '>=', startDate);
    }
    if (endDate) {
      attendanceQuery = attendanceQuery.where('date', '<=', endDate);
    }

    const attendanceRecords = await attendanceQuery;

    // Calculate summary for each student
    const studentSummaries = students.map(student => {
      const studentAttendance = attendanceRecords.filter(record => 
        record.student_id === student.id
      );

      const totalDays = studentAttendance.length;
      const presentDays = studentAttendance.filter(record => 
        record.status === 'present' || record.status === 'late'
      ).length;
      const absentDays = studentAttendance.filter(record => 
        record.status === 'absent'
      ).length;
      const lateDays = studentAttendance.filter(record => 
        record.status === 'late'
      ).length;
      const excusedDays = studentAttendance.filter(record => 
        record.status === 'excused'
      ).length;

      const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

      return {
        studentId: student.id,
        studentIdNumber: student.student_id,
        rollNumber: student.roll_number,
        firstName: student.first_name,
        lastName: student.last_name,
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100
      };
    });

    res.json(studentSummaries);
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance summary' });
  }
});

// Update attendance record
router.put('/:id', authenticateToken, requireTeacher, [
  body('status').isIn(['present', 'absent', 'late', 'excused']),
  body('remarks').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, remarks } = req.body;

    const attendance = await db('attendance').where('id', req.params.id).first();
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    await db('attendance')
      .where('id', req.params.id)
      .update({
        status,
        remarks,
        marked_by: req.user.id
      });

    res.json({ message: 'Attendance updated successfully' });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ message: 'Failed to update attendance' });
  }
});

// Get attendance calendar for a class
router.get('/class/:classId/calendar', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { classId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await db('attendance')
      .select('date', 'status')
      .where('class_id', classId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate);

    // Group by date and calculate summary
    const calendarData = {};
    attendance.forEach(record => {
      const date = record.date.toISOString().split('T')[0];
      if (!calendarData[date]) {
        calendarData[date] = {
          date,
          totalStudents: 0,
          presentStudents: 0,
          absentStudents: 0,
          lateStudents: 0,
          excusedStudents: 0
        };
      }

      calendarData[date].totalStudents++;
      switch (record.status) {
        case 'present':
          calendarData[date].presentStudents++;
          break;
        case 'absent':
          calendarData[date].absentStudents++;
          break;
        case 'late':
          calendarData[date].lateStudents++;
          break;
        case 'excused':
          calendarData[date].excusedStudents++;
          break;
      }
    });

    res.json(Object.values(calendarData));
  } catch (error) {
    console.error('Get attendance calendar error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance calendar' });
  }
});

// Get attendance statistics
router.get('/stats', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { classId, startDate, endDate } = req.query;

    let query = db('attendance')
      .join('students', 'attendance.student_id', 'students.id')
      .join('classes', 'students.class_id', 'classes.id');

    if (classId) {
      query = query.where('students.class_id', classId);
    }
    if (startDate) {
      query = query.where('attendance.date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('attendance.date', '<=', endDate);
    }

    const stats = await query
      .select(
        'classes.name as class_name',
        'classes.code as class_code',
        db.raw('COUNT(*) as total_records'),
        db.raw('COUNT(CASE WHEN status = \'present\' THEN 1 END) as present_count'),
        db.raw('COUNT(CASE WHEN status = \'absent\' THEN 1 END) as absent_count'),
        db.raw('COUNT(CASE WHEN status = \'late\' THEN 1 END) as late_count'),
        db.raw('COUNT(CASE WHEN status = \'excused\' THEN 1 END) as excused_count')
      )
      .groupBy('classes.id', 'classes.name', 'classes.code');

    const formattedStats = stats.map(stat => ({
      className: stat.class_name,
      classCode: stat.class_code,
      totalRecords: parseInt(stat.total_records),
      presentCount: parseInt(stat.present_count),
      absentCount: parseInt(stat.absent_count),
      lateCount: parseInt(stat.late_count),
      excusedCount: parseInt(stat.excused_count),
      attendanceRate: stat.total_records > 0 
        ? Math.round(((parseInt(stat.present_count) + parseInt(stat.late_count)) / parseInt(stat.total_records)) * 10000) / 100
        : 0
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance statistics' });
  }
});

module.exports = router;
