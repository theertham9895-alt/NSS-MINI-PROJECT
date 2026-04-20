const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/Student');
const User = require('../models/User');
const { getProfile, getDashboard } = require('../controllers/studentController');

// Get all students (for coordinator)
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find().populate('user', 'name email');
    const result = students.map(s => ({
      _id: s._id,
      name: s.user?.name,
      email: s.user?.email,
      rollNumber: s.rollNumber,
      department: s.department,
      year: s.year,
      totalHours: s.totalHours
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new student
router.post('/add', auth, async (req, res) => {
  try {
    const { userId, rollNumber, department, year, phone } = req.body;
    const student = await Student.create({
      user: userId, rollNumber, department, year, phone
    });
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete student
router.delete('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    await User.findByIdAndDelete(student.user);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update my profile (for student)
router.put('/profile/update', auth, async (req, res) => {
  try {
    const { phone, department, year } = req.body;
    const student = await Student.findOneAndUpdate(
      { user: req.user.id },
      { phone, department, year },
      { new: true }
    ).populate('user', 'name email');
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my profile (for student)
router.get('/profile', auth, getProfile);

// Get dashboard stats (for student)
router.get('/dashboard', auth, getDashboard);

module.exports = router;