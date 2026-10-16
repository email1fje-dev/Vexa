const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  authorId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  replyTo: { type: mongoose.SchemaTypes.ObjectId },
  threadRootId: { type: mongoose.SchemaTypes.ObjectId },
  attachments: { type: [{ name: { type: String, maxlength: 180 }, url: { type: String, maxlength: 420000 }, mimeType: { type: String, maxlength: 120 }, size: { type: Number, min: 0 } }], default: [] },
  reactions: { type: [{ emoji: { type: String, maxlength: 16 }, userIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }] }], default: [] },
  createdAt: { type: Date, default: Date.now },
}, { _id: true, id: false });

const channelSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 50 },
  type: { type: String, enum: ['text', 'announcement', 'voice'], default: 'text' },
  category: { type: String, trim: true, maxlength: 60, default: 'عمومی' },
  topic: { type: String, trim: true, maxlength: 240, default: '' },
  slowModeSeconds: { type: Number, min: 0, max: 21600, default: 0 },
  readOnly: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },
  private: { type: Boolean, default: false },
  allowedRoleIds: [{ type: mongoose.SchemaTypes.ObjectId }],
  pinnedMessageIds: [{ type: mongoose.SchemaTypes.ObjectId }],
  pollSchema: { type: [{ question: { type: String, maxlength: 240 }, options: [{ label: { type: String, maxlength: 100 }, voterIds: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }] }], createdBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now }, endsAt: { type: Date, default: null } }], default: [] },
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
  icon: { type: String, trim: true, maxlength: 500000, default: '' },
  banner: { type: String, trim: true, maxlength: 500000, default: '' },
  category: { type: String, enum: ['gaming', 'community', 'education', 'technology', 'art', 'music', 'other'], default: 'community', index: true },
  tags: { type: [{ type: String, trim: true, maxlength: 24 }], default: [], validate: value => value.length <= 5 },
  inviteCode: { type: String, required: true, unique: true, index: true },
  inviteExpiresAt: { type: Date, default: null },
  inviteMaxUses: { type: Number, min: 0, max: 10000, default: 0 },
  inviteUseCount: { type: Number, min: 0, default: 0 },
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
