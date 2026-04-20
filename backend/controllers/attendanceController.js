const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Event = require('../models/Event');

exports.markAttendance = async (req, res) => {
  try {
    const { eventId, studentId, status } = req.body;

    // Check if attendance already exists
    const existing = await Attendance.findOne({ student: studentId, event: eventId });

    if (existing) {
      // If status changed from absent to present — add hours
      if (existing.status === 'absent' && status === 'present') {
        const event = await Event.findById(eventId);
        await Student.findByIdAndUpdate(studentId, { $inc: { totalHours: event.hours } });
      }
      // If status changed from present to absent — remove hours
      if (existing.status === 'present' && status === 'absent') {
        const event = await Event.findById(eventId);
        await Student.findByIdAndUpdate(studentId, { $inc: { totalHours: -event.hours } });
      }
      // Update existing record
      existing.status = status;
      await existing.save();
      return res.json(existing);
    }

    // Create new attendance record
    const attendance = await Attendance.create({ student: studentId, event: eventId, status });

    // Add hours if present
    if (status === 'present') {
      const event = await Event.findById(eventId);
      await Student.findByIdAndUpdate(studentId, { $inc: { totalHours: event.hours } });
    }

    res.status(201).json(attendance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const records = await Attendance.find({ student: student._id })
      .populate('event', 'title date location hours');
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};