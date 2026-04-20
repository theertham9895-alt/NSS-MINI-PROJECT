const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Certificate = require('../models/Certificate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// ========== GET MY CERTIFICATES (student) ==========
router.get('/my', auth, async (req, res) => {
  try {
    const Student = require('../models/Student');
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
    const { studentId, activityId, title, type } = req.body;
    const cert = await Certificate.create({
      student: studentId,
      activity: activityId,
      title,
      type,
      issuedBy: req.user.id,
      fileUrl: req.file ? `/uploads/certificates/${req.file.filename}` : null
    });
    res.status(201).json(cert);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ========== DELETE CERTIFICATE (coordinator) ==========
router.delete('/:id', auth, async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ message: 'Certificate not found' });

    // Delete file if exists
    if (cert.fileUrl) {
      const filePath = '.' + cert.fileUrl;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.json({ message: 'Certificate deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;