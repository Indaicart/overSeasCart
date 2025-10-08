const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, and TXT files are allowed.'));
    }
  }
});

// Upload document
router.post('/upload', authenticateToken, requireTeacher, upload.single('file'), [
  body('title').notEmpty().trim(),
  body('category').isIn(['academic', 'administrative', 'student_record', 'teacher_record', 'general']),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, category, studentId, teacherId, isPublic } = req.body;

    const [document] = await db('documents').insert({
      title,
      description,
      file_name: req.file.originalname,
      file_path: req.file.path,
      file_type: req.file.mimetype,
      file_size: req.file.size,
      category,
      uploaded_by: req.user.id,
      student_id: studentId || null,
      teacher_id: teacherId || null,
      is_public: isPublic === 'true'
    }).returning('*');

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        title: document.title,
        fileName: document.file_name,
        fileSize: document.file_size,
        category: document.category
      }
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: 'Failed to upload document' });
  }
});

// Get documents
router.get('/', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      studentId, 
      teacherId, 
      isPublic,
      search 
    } = req.query;
    const offset = (page - 1) * limit;

    let query = db('documents')
      .join('users', 'documents.uploaded_by', 'users.id')
      .leftJoin('students', 'documents.student_id', 'students.id')
      .leftJoin('teachers', 'documents.teacher_id', 'teachers.id')
      .leftJoin('users as student_users', 'students.user_id', 'student_users.id')
      .leftJoin('users as teacher_users', 'teachers.user_id', 'teacher_users.id')
      .select(
        'documents.*',
        'users.first_name as uploader_first_name',
        'users.last_name as uploader_last_name',
        'student_users.first_name as student_first_name',
        'student_users.last_name as student_last_name',
        'teacher_users.first_name as teacher_first_name',
        'teacher_users.last_name as teacher_last_name'
      );

    // Apply filters
    if (category) {
      query = query.where('documents.category', category);
    }
    if (studentId) {
      query = query.where('documents.student_id', studentId);
    }
    if (teacherId) {
      query = query.where('documents.teacher_id', teacherId);
    }
    if (isPublic !== undefined) {
      query = query.where('documents.is_public', isPublic === 'true');
    }
    if (search) {
      query = query.where(function() {
        this.where('documents.title', 'ilike', `%${search}%`)
          .orWhere('documents.description', 'ilike', `%${search}%`)
          .orWhere('documents.file_name', 'ilike', `%${search}%`);
      });
    }

    // If user is not admin, only show public documents or documents they uploaded
    if (req.user.role !== 'admin') {
      query = query.where(function() {
        this.where('documents.is_public', true)
          .orWhere('documents.uploaded_by', req.user.id);
      });
    }

    const documents = await query
      .orderBy('documents.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('documents')
      .join('users', 'documents.uploaded_by', 'users.id')
      .count('* as count')
      .first();

    res.json({
      documents: documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        description: doc.description,
        fileName: doc.file_name,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        category: doc.category,
        isPublic: doc.is_public,
        uploaderName: `${doc.uploader_first_name} ${doc.uploader_last_name}`,
        studentName: doc.student_first_name && doc.student_last_name 
          ? `${doc.student_first_name} ${doc.student_last_name}` 
          : null,
        teacherName: doc.teacher_first_name && doc.teacher_last_name 
          ? `${doc.teacher_first_name} ${doc.teacher_last_name}` 
          : null,
        createdAt: doc.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Failed to fetch documents' });
  }
});

// Get document by ID
router.get('/:id', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const document = await db('documents')
      .join('users', 'documents.uploaded_by', 'users.id')
      .leftJoin('students', 'documents.student_id', 'students.id')
      .leftJoin('teachers', 'documents.teacher_id', 'teachers.id')
      .leftJoin('users as student_users', 'students.user_id', 'student_users.id')
      .leftJoin('users as teacher_users', 'teachers.user_id', 'teacher_users.id')
      .select(
        'documents.*',
        'users.first_name as uploader_first_name',
        'users.last_name as uploader_last_name',
        'student_users.first_name as student_first_name',
        'student_users.last_name as student_last_name',
        'teacher_users.first_name as teacher_first_name',
        'teacher_users.last_name as teacher_last_name'
      )
      .where('documents.id', req.params.id)
      .first();

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        !document.is_public && 
        document.uploaded_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      id: document.id,
      title: document.title,
      description: document.description,
      fileName: document.file_name,
      fileType: document.file_type,
      fileSize: document.file_size,
      category: document.category,
      isPublic: document.is_public,
      uploaderName: `${document.uploader_first_name} ${document.uploader_last_name}`,
      studentName: document.student_first_name && document.student_last_name 
        ? `${document.student_first_name} ${document.student_last_name}` 
        : null,
      teacherName: document.teacher_first_name && document.teacher_last_name 
        ? `${document.teacher_first_name} ${document.teacher_last_name}` 
        : null,
      createdAt: document.created_at
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Failed to fetch document' });
  }
});

// Download document
router.get('/:id/download', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const document = await db('documents')
      .where('id', req.params.id)
      .first();

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permissions
    if (req.user.role !== 'admin' && 
        !document.is_public && 
        document.uploaded_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(document.file_path, document.file_name);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ message: 'Failed to download document' });
  }
});

// Update document
router.put('/:id', authenticateToken, requireTeacher, [
  body('title').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('category').optional().isIn(['academic', 'administrative', 'student_record', 'teacher_record', 'general'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, isPublic } = req.body;

    const document = await db('documents').where('id', req.params.id).first();
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check permissions (only admin or document uploader can update)
    if (req.user.role !== 'admin' && document.uploaded_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (isPublic !== undefined) updateData.is_public = isPublic === 'true';

    await db('documents').where('id', req.params.id).update(updateData);

    res.json({ message: 'Document updated successfully' });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Failed to update document' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, requireTeacher, async (req, res) => {
  try {
    const document = await db('documents').where('id', req.params.id).first();
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check permissions (only admin or document uploader can delete)
    if (req.user.role !== 'admin' && document.uploaded_by !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    // Delete database record
    await db('documents').where('id', req.params.id).del();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Failed to delete document' });
  }
});

// Get document statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = db('documents');

    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }
    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const stats = await query
      .select(
        'category',
        db.raw('COUNT(*) as count'),
        db.raw('SUM(file_size) as total_size'),
        db.raw('COUNT(CASE WHEN is_public = true THEN 1 END) as public_count'),
        db.raw('COUNT(CASE WHEN is_public = false THEN 1 END) as private_count')
      )
      .groupBy('category');

    const formattedStats = stats.map(stat => ({
      category: stat.category,
      totalCount: parseInt(stat.count),
      totalSize: parseInt(stat.total_size),
      publicCount: parseInt(stat.public_count),
      privateCount: parseInt(stat.private_count),
      averageSize: Math.round(parseInt(stat.total_size) / parseInt(stat.count))
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Get document stats error:', error);
    res.status(500).json({ message: 'Failed to fetch document statistics' });
  }
});

module.exports = router;
