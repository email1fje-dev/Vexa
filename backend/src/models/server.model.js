const mongoose = require('mongoose');

const serverSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  inviteCode: { type: String, required: true, unique: true, index: true },
  ownerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true, index: true },
  memberIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'suspended', 'archived'], default: 'active', index: true },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  createdByAdmin: { type: Boolean, default: false },
}, { timestamps: true });
serverSchema.index({ name: 'text', description: 'text' });
module.exports = mongoose.model('VexaServer', serverSchema);
