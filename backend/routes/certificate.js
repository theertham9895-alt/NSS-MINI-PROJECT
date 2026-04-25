const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { notifyUser } = require('../services/notificationService');

// Create uploads folder if it doesn't exist
const uploadDir = 'uploads/certificates';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/certificates/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

const isAdmin = (req) => ['admin', 'coordinator'].includes(req.user?.role);

const resolveCertificateFilePath = (fileUrl) => {
  if (!fileUrl) return null;
  const normalized = path.normalize(fileUrl).replace(/^([/\\])+/, '');
  return path.join(__dirname, '..', normalized);
};

// ========== GET MY CERTIFICATES (student) ==========
router.get('/my', auth, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.json([]);

    const certs = await Certificate.find({ student: student._id })
      .populate('activity', 'title');

    const result = certs.map(cert => ({
      _id: cert._id,
      title: cert.title,
      type: cert.type,
      activityTitle: cert.activity?.title || cert.title,
      activity: cert.activity,
      fileUrl: cert.fileUrl,
      createdAt: cert.createdAt
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GET ALL CERTIFICATES (coordinator) ==========
router.get('/', auth, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const certs = await Certificate.find()
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('activity', 'title');

    const result = certs.map(cert => ({
      _id: cert._id,
      title: cert.title,
      type: cert.type,
      studentName: cert.student?.user?.name || 'N/A',
      activityTitle: cert.activity?.title || cert.title,
      activity: cert.activity,
      fileUrl: cert.fileUrl,
      createdAt: cert.createdAt
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== CREATE CERTIFICATE (coordinator) ==========
router.post('/', auth, upload.single('certificate'), async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { studentId, activityId, title, type } = req.body;
    if (!studentId || !title || !type) {
      return res.status(400).json({ message: 'studentId, title and type are required' });
    }

    const cert = await Certificate.create({
      student: studentId,
      activity: activityId,
      title,
      type,
      issuedBy: req.user.id,
      fileUrl: req.file ? `/uploads/certificates/${req.file.filename}` : null
    });

    const targetStudent = await Student.findById(studentId).populate('user', '_id');
    if (targetStudent?.user?._id) {
      await notifyUser({
        recipientId: targetStudent.user._id,
        title: 'New Certificate Added',
        message: `${title} certificate has been issued to your account.`,
        type: 'certificate',
        createdBy: req.user.id
      });
    }

    res.status(201).json(cert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, upload.single('certificate'), async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { activityId, title, type } = req.body;
    if (!title || !type) {
      return res.status(400).json({ message: 'title and type are required' });
    }

    const cert = await Certificate.findById(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    cert.title = title;
    cert.type = type;
    cert.activity = activityId || cert.activity;

    if (req.file) {
      if (cert.fileUrl) {
        const oldFilePath = resolveCertificateFilePath(cert.fileUrl);
        if (oldFilePath && fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      cert.fileUrl = `/uploads/certificates/${req.file.filename}`;
    }

    await cert.save();

    const targetStudent = await Student.findById(cert.student).populate('user', '_id');
    if (targetStudent?.user?._id) {
      await notifyUser({
        recipientId: targetStudent.user._id,
        title: 'Certificate Updated',
        message: `${title} certificate has been updated by coordinator.`,
        type: 'certificate',
        createdBy: req.user.id
      });
    }

    return res.json({ message: 'Certificate updated successfully', certificate: cert });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// ========== DOWNLOAD CERTIFICATE (student owner or coordinator) ==========
router.get('/:id/download', auth, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate('student', 'user');
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    if (!cert.fileUrl) return res.status(404).json({ message: 'Certificate file not found' });

    const studentUserId = cert.student?.user?.toString();
    const isOwner = studentUserId && studentUserId === req.user.id;
    if (!isAdmin(req) && !isOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const filePath = resolveCertificateFilePath(cert.fileUrl);
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Certificate file not found' });
    }

    const safeTitle = (cert.title || 'certificate').replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'certificate';
    const ext = path.extname(filePath) || '';
    const downloadName = `NSS_Certificate_${safeTitle}${ext}`;
    return res.download(filePath, downloadName);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ========== DELETE CERTIFICATE (coordinator) ==========
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    // Delete file if exists
    if (cert.fileUrl) {
      const filePath = resolveCertificateFilePath(cert.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: 'Certificate deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;