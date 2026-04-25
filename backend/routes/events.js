const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');
const { notifyUser } = require('../services/notificationService');
const { getAllEvents, createEvent, deleteEvent } = require('../controllers/eventController');
const isCoordinator = (req) => ['admin', 'coordinator'].includes(req.user?.role);

router.get('/', auth, getAllEvents);
router.post('/', auth, (req, res, next) => {
  if (!isCoordinator(req)) return res.status(403).json({ message: 'Access denied' });
  return createEvent(req, res, next);
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (!isCoordinator(req)) return res.status(403).json({ message: 'Access denied' });
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const students = await User.find({ role: 'student' }).select('_id');
    await Promise.all(students.map((student) => notifyUser({
      recipientId: student._id,
      title: 'Activity Updated',
      message: `${event.title} activity has been updated.`,
      type: 'activity',
      createdBy: req.user.id
    })));

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, (req, res, next) => {
  if (!isCoordinator(req)) return res.status(403).json({ message: 'Access denied' });
  return deleteEvent(req, res, next);
});

module.exports = router;