const mongoose = require('mongoose');

const announcementSchema = mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  body: { type: String, required: true, trim: true, maxlength: 3000 },
  type: { type: String, enum: ['info', 'success', 'warning', 'critical'], default: 'info' },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft', index: true },
  startsAt: { type: Date, default: Date.now },
  endsAt: { type: Date, default: null },
  createdBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
announcementSchema.index({ status: 1, startsAt: 1, endsAt: 1 });
module.exports = mongoose.model('Announcement', announcementSchema);
