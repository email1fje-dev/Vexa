const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { User, Room, Message, Report, Announcement, VexaServer, AdminSetting } = require('../../models');
const AdminAudit = require('../../models/adminAudit.model');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const safeUserFields = 'username email role isVerifiedBadge isEmailVerified shortId createdAt avatar bio';
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const paging = (req) => ({
  page: Math.max(1, Math.min(100000, Number.parseInt(req.query.page, 10) || 1)),
  limit: Math.max(1, Math.min(50, Number.parseInt(req.query.limit, 10) || 20)),
});
const audit = (req, action, targetId, details = {}) => AdminAudit.create({
  actorId: req.user._id, action, targetId: String(targetId || ''), details,
});

const getMe = catchAsync(async (req, res) => {
  res.send({ id: req.user.id, username: req.user.username, email: req.user.email, role: req.user.role, isVerifiedBadge: req.user.isVerifiedBadge });
});

const getOverview = catchAsync(async (req, res) => {
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 6); weekAgo.setHours(0, 0, 0, 0);
  const [users, verifiedUsers, rooms, messages, newUsersToday, newUsersWeek, messagesToday, openReports, publishedAnnouncements, servers, recentUsers, userTrend, messageTrend] = await Promise.all([
    User.countDocuments({}), User.countDocuments({ isVerifiedBadge: true }), Room.countDocuments({}), Message.countDocuments({}),
    User.countDocuments({ createdAt: { $gte: today } }), User.countDocuments({ createdAt: { $gte: weekAgo } }),
    Message.countDocuments({ createdAt: { $gte: today } }), Report.countDocuments({ status: { $in: ['open', 'in_review'] } }),
    Announcement.countDocuments({ status: 'published' }), VexaServer.countDocuments({ status: 'active' }),
    User.find({}).select(safeUserFields).sort({ createdAt: -1 }).limit(8).lean(),
    User.aggregate([{ $match: { createdAt: { $gte: weekAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    Message.aggregate([{ $match: { createdAt: { $gte: weekAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
  ]);
  const settingDocs = await AdminSetting.find({ key: { $in: ['maintenanceMode', 'registrationEnabled', 'publicServerDiscovery', 'maxMessageLength'] } }).lean();
  const settingMap = Object.fromEntries(settingDocs.map(x => [x.key, x.value]));
  res.send({
    stats: { users, verifiedUsers, rooms, messages, newUsersToday, newUsersWeek, messagesToday, openReports, publishedAnnouncements, servers },
    recentUsers,
    charts: { users: userTrend, messages: messageTrend },
    settings: { maintenanceMode: settingMap.maintenanceMode === true, registrationEnabled: settingMap.registrationEnabled !== false, publicServerDiscovery: settingMap.publicServerDiscovery !== false, maxMessageLength: Number(settingMap.maxMessageLength || 2000) },
    system: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptimeSeconds: Math.floor(process.uptime()), nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'production',
      memory: process.memoryUsage(),
      pid: process.pid,
    },
    modules: { servers: { available: true }, reports: { available: true }, announcements: { available: true }, settings: { available: true } },
  });
});

const getUsers = catchAsync(async (req, res) => {
  const query = String(req.query.q || '').trim().slice(0, 80);
  const { page, limit } = paging(req);
  const filter = {};
  if (query) { const regex = new RegExp(escapeRegex(query), 'i'); filter.$or = [{ username: regex }, { email: regex }, { shortId: regex }]; }
  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).select(safeUserFields).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  res.send({ results: users, page, limit, total, totalPages: Math.ceil(total / limit) });
});

const setVerifiedBadge = catchAsync(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user id');
  if (String(req.params.userId) === String(req.user.id)) throw new ApiError(httpStatus.BAD_REQUEST, 'Owner badge cannot be changed from this panel');
  const value = req.body && req.body.isVerifiedBadge;
  if (typeof value !== 'boolean') throw new ApiError(httpStatus.BAD_REQUEST, 'isVerifiedBadge must be a boolean');
  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  const previous = Boolean(user.isVerifiedBadge);
  user.isVerifiedBadge = value; await user.save();
  await audit(req, value ? 'user.verified_badge.granted' : 'user.verified_badge.removed', user._id, { username: user.username, previous, current: value });
  res.send({ id: user.id, username: user.username, shortId: user.shortId, isVerifiedBadge: user.isVerifiedBadge });
});

const getAudit = catchAsync(async (req, res) => {
  const { page, limit } = paging(req);
  const [total, entries] = await Promise.all([
    AdminAudit.countDocuments({}),
    AdminAudit.find({}).populate('actorId', 'username email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  res.send({ results: entries, page, limit, total, totalPages: Math.ceil(total / limit) });
});

const getMessageSummary = catchAsync(async (req, res) => {
  const week = new Date(Date.now() - 7 * 86400000);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [total, lastWeek, todayCount] = await Promise.all([
    Message.countDocuments({}), Message.countDocuments({ createdAt: { $gte: week } }), Message.countDocuments({ createdAt: { $gte: today } }),
  ]);
  res.send({ total, lastWeek, today: todayCount, contentAccess: 'restricted-to-report-workflow' });
});

const getReports = catchAsync(async (req, res) => {
  const { page, limit } = paging(req);
  const filter = {};
  if (['open', 'in_review', 'resolved', 'dismissed'].includes(req.query.status)) filter.status = req.query.status;
  const [total, results] = await Promise.all([
    Report.countDocuments(filter),
    Report.find(filter).populate('reporterId', 'username shortId email').populate('reviewedBy', 'username').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  res.send({ results, page, limit, total, totalPages: Math.ceil(total / limit) });
});

const updateReport = catchAsync(async (req, res) => {
  const { status, resolutionNote = '' } = req.body || {};
  if (!['open', 'in_review', 'resolved', 'dismissed'].includes(status)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid report status');
  if (String(resolutionNote).length > 1200) throw new ApiError(httpStatus.BAD_REQUEST, 'Resolution note is too long');
  const report = await Report.findById(req.params.reportId);
  if (!report) throw new ApiError(httpStatus.NOT_FOUND, 'Report not found');
  const previous = report.status;
  report.status = status; report.resolutionNote = String(resolutionNote).trim(); report.reviewedBy = req.user._id; report.reviewedAt = new Date();
  await report.save();
  await audit(req, 'report.status.updated', report._id, { previous, current: status, reason: report.reason });
  res.send({ id: report.id, status: report.status, resolutionNote: report.resolutionNote, reviewedAt: report.reviewedAt });
});

const getAnnouncements = catchAsync(async (req, res) => {
  const { page, limit } = paging(req);
  const filter = {};
  if (['draft', 'published', 'archived'].includes(req.query.status)) filter.status = req.query.status;
  const [total, results] = await Promise.all([
    Announcement.countDocuments(filter),
    Announcement.find(filter).populate('createdBy', 'username').populate('updatedBy', 'username').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  res.send({ results, page, limit, total, totalPages: Math.ceil(total / limit) });
});

const createAnnouncement = catchAsync(async (req, res) => {
  const title = String(req.body.title || '').trim(); const body = String(req.body.body || '').trim();
  const type = req.body.type || 'info'; const status = req.body.status || 'draft';
  if (!title || title.length > 120 || !body || body.length > 3000) throw new ApiError(httpStatus.BAD_REQUEST, 'Title and body are required and must fit the limits');
  if (!['info', 'success', 'warning', 'critical'].includes(type) || !['draft', 'published', 'archived'].includes(status)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid announcement type or status');
  const startsAt = req.body.startsAt ? new Date(req.body.startsAt) : new Date();
  const endsAt = req.body.endsAt ? new Date(req.body.endsAt) : null;
  if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime())) || (endsAt && endsAt <= startsAt)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid announcement dates');
  const item = await Announcement.create({ title, body, type, status, startsAt, endsAt, createdBy: req.user._id, updatedBy: req.user._id });
  await audit(req, 'announcement.created', item._id, { title, status });
  res.status(httpStatus.CREATED).send(item);
});

const updateAnnouncement = catchAsync(async (req, res) => {
  const item = await Announcement.findById(req.params.announcementId);
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, 'Announcement not found');
  const allowed = ['title', 'body', 'type', 'status', 'startsAt', 'endsAt'];
  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      if (key === 'title') { const value = String(req.body[key]).trim(); if (!value || value.length > 120) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid title'); item.title = value; }
      else if (key === 'body') { const value = String(req.body[key]).trim(); if (!value || value.length > 3000) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid body'); item.body = value; }
      else if (key === 'type') { if (!['info', 'success', 'warning', 'critical'].includes(req.body[key])) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid type'); item.type = req.body[key]; }
      else if (key === 'status') { if (!['draft', 'published', 'archived'].includes(req.body[key])) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid status'); item.status = req.body[key]; }
      else { const value = req.body[key] ? new Date(req.body[key]) : null; if (value && Number.isNaN(value.getTime())) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid date'); item[key] = value; }
    }
  }
  if (item.endsAt && item.endsAt <= item.startsAt) throw new ApiError(httpStatus.BAD_REQUEST, 'End date must be after start date');
  item.updatedBy = req.user._id; await item.save();
  await audit(req, 'announcement.updated', item._id, { title: item.title, status: item.status });
  res.send(item);
});

const deleteAnnouncement = catchAsync(async (req, res) => {
  const item = await Announcement.findById(req.params.announcementId);
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, 'Announcement not found');
  item.status = 'archived'; item.updatedBy = req.user._id; await item.save();
  await audit(req, 'announcement.archived', item._id, { title: item.title });
  res.status(httpStatus.NO_CONTENT).send();
});

const getServers = catchAsync(async (req, res) => {
  const { page, limit } = paging(req);
  const filter = {};
  if (['active', 'suspended', 'archived'].includes(req.query.status)) filter.status = req.query.status;
  const [total, results] = await Promise.all([
    VexaServer.countDocuments(filter),
    VexaServer.find(filter).populate('ownerId', 'username shortId email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  res.send({ results: results.map(s => ({ ...s, id: String(s._id), memberCount: (s.memberIds || []).length })), page, limit, total, totalPages: Math.ceil(total / limit) });
});

const updateServer = catchAsync(async (req, res) => {
  const server = await VexaServer.findById(req.params.serverId);
  if (!server) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  const { status, visibility } = req.body || {};
  if (status !== undefined) { if (!['active', 'suspended', 'archived'].includes(status)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid server status'); server.status = status; }
  if (visibility !== undefined) { if (!['public', 'private'].includes(visibility)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid visibility'); server.visibility = visibility; }
  await server.save();
  await audit(req, 'server.updated', server._id, { status: server.status, visibility: server.visibility });
  res.send({ id: String(server._id), name: server.name, status: server.status, visibility: server.visibility, memberCount: server.memberIds.length });
});

const getSettings = catchAsync(async (req, res) => {
  const docs = await AdminSetting.find({}).lean();
  const settings = { maintenanceMode: false, registrationEnabled: true, publicServerDiscovery: true, maxMessageLength: 2000 };
  docs.forEach(d => { settings[d.key] = d.value; });
  res.send(settings);
});

const updateSettings = catchAsync(async (req, res) => {
  const allowed = { maintenanceMode: 'boolean', registrationEnabled: 'boolean', publicServerDiscovery: 'boolean', maxMessageLength: 'number' };
  const updates = req.body || {}; const keys = Object.keys(updates);
  if (!keys.length || keys.some(key => !allowed[key])) throw new ApiError(httpStatus.BAD_REQUEST, 'Unsupported settings key');
  for (const key of keys) {
    const value = updates[key];
    if (typeof value !== allowed[key]) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid type for ' + key);
    if (key === 'maxMessageLength' && (!Number.isInteger(value) || value < 100 || value > 10000)) throw new ApiError(httpStatus.BAD_REQUEST, 'maxMessageLength must be between 100 and 10000');
  }
  for (const key of keys) await AdminSetting.findOneAndUpdate({ key }, { $set: { value: updates[key], updatedBy: req.user._id } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await audit(req, 'settings.updated', 'global', updates);
  res.send(await AdminSetting.find({}).lean().then(docs => {
    const result = { maintenanceMode: false, registrationEnabled: true, publicServerDiscovery: true, maxMessageLength: 2000 };
    docs.forEach(d => { result[d.key] = d.value; }); return result;
  }));
});

module.exports = {
  getMe, getOverview, getUsers, setVerifiedBadge, getAudit, getMessageSummary,
  getReports, updateReport, getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getServers, updateServer, getSettings, updateSettings,
};
