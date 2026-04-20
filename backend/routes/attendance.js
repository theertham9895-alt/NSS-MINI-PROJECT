const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { markAttendance, getMyAttendance } = require('../controllers/attendanceController');

router.post('/mark', auth, markAttendance);
router.get('/my', auth, getMyAttendance);

module.exports = router;