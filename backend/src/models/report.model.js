const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
  reporterId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true, index: true },
  targetType: { type: String, enum: ['user', 'message'], required: true },
  targetId: { type: String, required: true, trim: true, maxlength: 100 },
  reason: { type: String, enum: ['spam', 'harassment', 'impersonation', 'inappropriate', 'scam', 'other'], required: true },
  details: { type: String, trim: true, maxlength: 1200, default: '' },
  status: { type: String, enum: ['open', 'in_review', 'resolved', 'dismissed'], default: 'open', index: true },
  resolutionNote: { type: String, trim: true, maxlength: 1200, default: '' },
  reviewedBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ reporterId: 1, targetType: 1, targetId: 1 });
module.exports = mongoose.model('Report', reportSchema);
