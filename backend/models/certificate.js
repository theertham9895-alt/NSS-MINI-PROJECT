const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  activity: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  title: { type: String, required: true },
  type: { type: String, enum: ['Participation', 'Appreciation', 'Achievement'], default: 'Participation' },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileUrl: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);