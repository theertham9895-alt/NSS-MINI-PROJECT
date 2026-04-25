const Event = require('../models/Event');
const User = require('../models/User');
const { notifyUser } = require('../services/notificationService');

const notifyAllStudents = async ({ title, message, createdBy }) => {
  const students = await User.find({ role: 'student' }).select('_id');
  await Promise.all(students.map((student) => notifyUser({
    recipientId: student._id,
    title,
    message,
    type: 'activity',
    createdBy
  })));
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).populate('createdBy', 'name');
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location, hours, maxParticipants, category } = req.body;
    const event = await Event.create({
      title,
      description,
      date,
      location,
      hours,
      maxParticipants,  // ← was missing!
      category,         // ← was missing!
      createdBy: req.user.id
    });

    await notifyAllStudents({
      title: 'New Activity Added',
      message: `${title} has been added. Check activities page for details.`,
      createdBy: req.user.id
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};