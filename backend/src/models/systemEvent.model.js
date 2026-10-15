const mongoose = require('mongoose');
const systemEventSchema = mongoose.Schema({
  level: { type: String, enum: ['warning', 'error'], default: 'error', index: true },
  message: { type: String, required: true, maxlength: 240 },
  method: { type: String, default: '', maxlength: 12 },
  route: { type: String, default: '', maxlength: 180 },
  statusCode: { type: Number, default: 500, index: true },
}, { timestamps: true });
systemEventSchema.index({ createdAt: -1 });
module.exports = mongoose.model('SystemEvent', systemEventSchema);
