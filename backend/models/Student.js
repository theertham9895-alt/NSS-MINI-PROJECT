const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rollNumber: { type: String, required: true, unique: true },
  department: String,
  year: Number,
  totalHours: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);