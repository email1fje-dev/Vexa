const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { User, Room, Message } = require('../../models');
const AdminAudit = require('../../models/adminAudit.model');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const safeUserFields = 'username email role isVerifiedBadge isEmailVerified shortId createdAt avatar bio';
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getMe = catchAsync(async (req, res) => {
  res.send({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    isVerifiedBadge: req.user.isVerifiedBadge,
  });
});

const getOverview = catchAsync(async (req, res) => {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [users, verifiedUsers, rooms, messages, newUsersToday, newUsersWeek, messagesToday, recentUsers] =
    await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ isVerifiedBadge: true }),
      Room.countDocuments({}),
      Message.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Message.countDocuments({ createdAt: { $gte: today } }),
      User.find({}).select(safeUserFields).sort({ createdAt: -1 }).limit(8).lean(),
    ]);

  res.send({
    stats: { users, verifiedUsers, rooms, messages, newUsersToday, newUsersWeek, messagesToday },
    recentUsers,
    system: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'production',
    },
    modules: {
      servers: { available: false, reason: 'در مدل فعلی Vexa موجودیت Server/Guild وجود ندارد.' },
      reports: { available: false, reason: 'در مدل فعلی Vexa سامانه گزارش تخلف وجود ندارد.' },
      announcements: { available: false, reason: 'ارسال اعلان سراسری هنوز به کلاینت‌ها متصل نشده است.' },
      settings: { available: false, reason: 'تنظیمات عمومی هنوز به منطق اصلی برنامه متصل نشده است.' },
    },
  });
});

const getUsers = catchAsync(async (req, res) => {
  const query = String(req.query.q || '').trim().slice(0, 80);
  const page = Math.max(1, Math.min(100000, Number.parseInt(req.query.page, 10) || 1));
  const limit = Math.max(1, Math.min(50, Number.parseInt(req.query.limit, 10) || 20));
  const filter = {};

  if (query) {
    const regex = new RegExp(escapeRegex(query), 'i');
    filter.$or = [{ username: regex }, { email: regex }, { shortId: regex }];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).select(safeUserFields).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);

  res.send({ results: users, page, limit, total, totalPages: Math.ceil(total / limit) });
});

const setVerifiedBadge = catchAsync(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user id');
  }
  if (String(req.params.userId) === String(req.user.id)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Owner badge cannot be changed from this panel');
  }

  const value = req.body && req.body.isVerifiedBadge;
  if (typeof value !== 'boolean') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'isVerifiedBadge must be a boolean');
  }

  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const previous = Boolean(user.isVerifiedBadge);
  user.isVerifiedBadge = value;
  await user.save();
  await AdminAudit.create({
    actorId: req.user._id,
    action: value ? 'user.verified_badge.granted' : 'user.verified_badge.removed',
    targetId: String(user._id),
    details: { username: user.username, previous, current: value },
  });

  res.send({
    id: user.id,
    username: user.username,
    shortId: user.shortId,
    isVerifiedBadge: user.isVerifiedBadge,
  });
});

const getAudit = catchAsync(async (req, res) => {
  const page = Math.max(1, Math.min(100000, Number.parseInt(req.query.page, 10) || 1));
  const limit = Math.max(1, Math.min(50, Number.parseInt(req.query.limit, 10) || 20));
  const [total, entries] = await Promise.all([
    AdminAudit.countDocuments({}),
    AdminAudit.find({})
      .populate('actorId', 'username email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);
  res.send({ results: entries, page, limit, total, totalPages: Math.ceil(total / limit) });
});

const getMessageSummary = catchAsync(async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const [total, lastWeek, today] = await Promise.all([
    Message.countDocuments({}),
    Message.countDocuments({ createdAt: { $gte: since } }),
    Message.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
  ]);
  res.send({ total, lastWeek, today, contentAccess: 'restricted-to-report-workflow' });
});

module.exports = { getMe, getOverview, getUsers, setVerifiedBadge, getAudit, getMessageSummary };
