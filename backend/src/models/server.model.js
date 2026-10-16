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

const roleSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 40 },
  color: { type: String, default: '#34d36a', match: /^#[0-9a-fA-F]{6}$/ },
  permissions: { type: [String], enum: ['manageChannels', 'manageRoles', 'manageMessages', 'kickMembers', 'banMembers', 'manageEvents', 'viewAuditLog'], default: [] },
  memberIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
}, { timestamps: true });

const eventSchema = mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  startsAt: { type: Date, required: true },
  createdBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  attendeeIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
}, { timestamps: true });

const serverSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  inviteCode: { type: String, required: true, unique: true, index: true },
  ownerId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true, index: true },
  memberIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
  pendingJoinIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
  channels: { type: [channelSchema], default: () => [{ name: 'general', type: 'text' }] },
  roles: { type: [roleSchema], default: () => [
    { name: 'مدیر', color: '#4f8cff', permissions: ['manageChannels', 'manageRoles', 'manageMessages', 'kickMembers', 'banMembers', 'manageEvents', 'viewAuditLog'] },
    { name: 'عضو', color: '#34d36a', permissions: [] },
  ] },
  events: { type: [eventSchema], default: [] },
  welcomeMessage: { type: String, trim: true, maxlength: 500, default: '' },
  antiSpamEnabled: { type: Boolean, default: true },
  joinApproval: { type: Boolean, default: false },
  auditLog: { type: [{ actorId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' }, action: { type: String, maxlength: 80 }, target: { type: String, maxlength: 120 }, createdAt: { type: Date, default: Date.now } }], default: [] },
  status: { type: String, enum: ['active', 'suspended', 'archived'], default: 'active', index: true },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  isVerifiedBadge: { type: Boolean, default: false, index: true },
  createdByAdmin: { type: Boolean, default: false },
}, { timestamps: true });
serverSchema.index({ name: 'text', description: 'text' });
module.exports = mongoose.model('VexaServer', serverSchema);
