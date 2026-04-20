const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Event = require('../models/Event');
const { getAllEvents, createEvent, deleteEvent } = require('../controllers/eventController');

router.get('/', auth, getAllEvents);
router.post('/', auth, createEvent);

router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, deleteEvent);

module.exports = router;