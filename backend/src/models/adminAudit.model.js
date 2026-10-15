const mongoose = require('mongoose');

const adminAuditSchema = mongoose.Schema({
  actorId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true, trim: true, maxlength: 100 },
  targetId: { type: String, default: '', maxlength: 100 },
  details: { type: Object, default: {} },
}, { timestamps: true });

adminAuditSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminAudit', adminAuditSchema);
