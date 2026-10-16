const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  authorId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
}, { _id: true, id: false });

const channelSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  type: { type: String, enum: ['text'], default: 'text' },
  createdBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  messages: { type: [messageSchema], default: [] },
}, { timestamps: true });

const serverSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  inviteCode: { type: String, required: true, unique: true, index: true },
  ownerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true, index: true },
  memberIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
  channels: { type: [channelSchema], default: () => [{ name: 'general', type: 'text' }] },
  status: { type: String, enum: ['active', 'suspended', 'archived'], default: 'active', index: true },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  isVerifiedBadge: { type: Boolean, default: false, index: true },
  createdByAdmin: { type: Boolean, default: false },
}, { timestamps: true });
serverSchema.index({ name: 'text', description: 'text' });
module.exports = mongoose.model('VexaServer', serverSchema);
