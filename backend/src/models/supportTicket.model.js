const mongoose = require('mongoose');
const supportTicketSchema = mongoose.Schema({
  userId: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, enum: ['account', 'bug', 'safety', 'other'], default: 'other' },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['open', 'in_review', 'resolved', 'closed'], default: 'open', index: true },
  adminReply: { type: String, trim: true, maxlength: 3000, default: '' },
  repliedBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', default: null },
  repliedAt: { type: Date, default: null },
}, { timestamps: true });
supportTicketSchema.index({ createdAt: -1 });
module.exports = mongoose.model('SupportTicket', supportTicketSchema);
