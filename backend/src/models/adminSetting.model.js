const mongoose = require('mongoose');

const adminSettingSchema = mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  value: { type: mongoose.Schema.Types.Mixed, default: null },
  updatedBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
module.exports = mongoose.model('AdminSetting', adminSettingSchema);
