const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Report, User, Message } = require('../../models');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const createReport = catchAsync(async (req, res) => {
  const targetType = req.body && req.body.targetType;
  const targetId = String(req.body && req.body.targetId || '').trim();
  const reason = req.body && req.body.reason;
  const details = String(req.body && req.body.details || '').trim().slice(0, 1200);
  if (!['user', 'message'].includes(targetType) || !mongoose.Types.ObjectId.isValid(targetId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid report target');
  }
  if (!['spam', 'harassment', 'impersonation', 'inappropriate', 'scam', 'other'].includes(reason)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid report reason');
  }
  if (targetType === 'user' && String(targetId) === String(req.user.id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot report yourself');
  }
  if (targetType === 'user' && !(await User.exists({ _id: targetId }))) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Reported user not found');
  }
  if (targetType === 'message') {
    const message = await Message.findById(targetId).select('senderId');
    if (!message) throw new ApiError(httpStatus.NOT_FOUND, 'Reported message not found');
    if (String(message.senderId) === String(req.user.id)) throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot report your own message');
  }
  const recent = await Report.findOne({
    reporterId: req.user.id, targetType, targetId,
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    status: { $in: ['open', 'in_review'] },
  });
  if (recent) throw new ApiError(httpStatus.CONFLICT, 'A report for this target is already open');
  const report = await Report.create({ reporterId: req.user.id, targetType, targetId, reason, details });
  res.status(httpStatus.CREATED).send({
    id: report.id, targetType: report.targetType, targetId: report.targetId,
    reason: report.reason, status: report.status, createdAt: report.createdAt,
  });
});

module.exports = { createReport };
