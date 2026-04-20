const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('user', 'name email');

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Return all fields clearly
    res.json({
      _id: student._id,
      user: {
        name: student.user?.name,
        email: student.user?.email
      },
      rollNumber: student.rollNumber,
      department: student.department,
      year: student.year,
      phone: student.phone,
      totalHours: student.totalHours
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get dashboard stats
exports.getDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const attendanceCount = await Attendance.countDocuments({
      student: student._id,
      status: 'present'
    });

    res.json({
      serviceHours: student.totalHours,
      activities: attendanceCount,
      targetHours: 120,
      certificates: student.totalHours >= 120 ? 1 : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};