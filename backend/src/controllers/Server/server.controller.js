const httpStatus = require('http-status');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { VexaServer, AdminSetting, User } = require('../../models');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const maintenanceOn = async () => {
  const setting = await AdminSetting.findOne({ key: 'maintenanceMode' }).lean();
  return Boolean(setting && setting.value === true);
};
const makeInvite = () => { const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const bytes = crypto.randomBytes(10); return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join(''); };
const serialize = (server) => ({
  id: String(server._id), name: server.name, description: server.description || '',
  inviteCode: server.inviteCode, owner: server.ownerId,
  memberCount: (server.memberIds || []).length, status: server.status,
  visibility: server.visibility, isVerifiedBadge: Boolean(server.isVerifiedBadge), createdAt: server.createdAt,
});
const isMember = (server, userId) => (server.memberIds || []).some(id => String(id._id || id) === String(userId));
const ensureDefaultChannel = async (server) => {
  if (!server.channels || server.channels.length === 0) {
    server.channels = [{ name: 'general', type: 'text', messages: [] }];
    await server.save();
  }
};
const listPublic = catchAsync(async (req, res) => {
  const setting = await AdminSetting.findOne({ key: 'publicServerDiscovery' }).lean();
  if (setting && setting.value === false) return res.send([]);
  const items = await VexaServer.find({ status: 'active', visibility: 'public' })
    .select('name description inviteCode ownerId memberIds status visibility isVerifiedBadge createdAt')
    .populate('ownerId', 'username shortId avatar').sort({ createdAt: -1 }).limit(50).lean();
  res.send(items.map(s => ({ ...serialize(s), owner: s.ownerId })));
});
const mine = catchAsync(async (req, res) => {
  const items = await VexaServer.find({ memberIds: req.user.id, status: 'active' })
    .select('name description inviteCode ownerId memberIds status visibility isVerifiedBadge createdAt')
    .populate('ownerId', 'username shortId avatar').sort({ createdAt: -1 }).limit(100).lean();
  res.send(items.map(s => ({ ...serialize(s), owner: s.ownerId })));
});
const create = catchAsync(async (req, res) => {
  if (await maintenanceOn()) throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Vexa is in maintenance mode');
  const name = String(req.body.name || '').trim();
  const description = String(req.body.description || '').trim();
  if (name.length < 2 || name.length > 80 || description.length > 500) throw new ApiError(httpStatus.BAD_REQUEST, 'Server name must be 2-80 characters; description max is 500');
  let inviteCode = makeInvite();
  while (await VexaServer.exists({ inviteCode })) inviteCode = makeInvite();
  const server = await VexaServer.create({
    name, description, inviteCode, ownerId: req.user.id, memberIds: [req.user.id],
    channels: [{ name: 'general', type: 'text', createdBy: req.user.id, messages: [] }],
  });
  res.status(httpStatus.CREATED).send(serialize(server));
});
const join = catchAsync(async (req, res) => {
  if (await maintenanceOn()) throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Vexa is in maintenance mode');
  const code = String(req.body.inviteCode || '').trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{10}$/.test(code)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid invite code');
  const server = await VexaServer.findOne({ inviteCode: code, status: 'active' });
  if (!server) throw new ApiError(httpStatus.NOT_FOUND, 'Invite not found or server unavailable');
  if (!isMember(server, req.user.id)) { server.memberIds.push(req.user.id); await server.save(); }
  res.send(serialize(server));
});
const getOne = catchAsync(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.serverId)) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' });
  if (!server || !isMember(server, req.user.id)) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  await ensureDefaultChannel(server);
  const owner = await User.findById(server.ownerId).select('username shortId avatar').lean();
  const members = server.memberIds.length
    ? await User.find({ _id: { $in: server.memberIds } }).select('username shortId avatar presenceStatus').lean()
    : [];
  res.send({
    ...serialize(server), owner, members,
    isOwner: String(server.ownerId) === String(req.user.id),
    channels: server.channels.map(channel => ({ id: String(channel._id), name: channel.name, type: channel.type, createdAt: channel.createdAt })),
  });
});
const createChannel = catchAsync(async (req, res) => {
  if (await maintenanceOn()) throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Vexa is in maintenance mode');
  if (!mongoose.isValidObjectId(req.params.serverId)) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' });
  if (!server || !isMember(server, req.user.id)) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  if (String(server.ownerId) !== String(req.user.id)) throw new ApiError(httpStatus.FORBIDDEN, 'Only the server owner can create channels for now');
  const name = String(req.body.name || '').trim().replace(/\s+/g, '-');
  if (name.length < 2 || name.length > 50) throw new ApiError(httpStatus.BAD_REQUEST, 'Channel name must be 2-50 characters');
  if (server.channels.some(channel => channel.name.toLowerCase() === name.toLowerCase())) throw new ApiError(httpStatus.CONFLICT, 'A channel with that name already exists');
  server.channels.push({ name, type: 'text', createdBy: req.user.id, messages: [] });
  await server.save();
  const channel = server.channels[server.channels.length - 1];
  res.status(httpStatus.CREATED).send({ id: String(channel._id), name: channel.name, type: channel.type, createdAt: channel.createdAt });
});
const listMessages = catchAsync(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.serverId)) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' });
  if (!server || !isMember(server, req.user.id)) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  await ensureDefaultChannel(server);
  const channel = server.channels.id(req.params.channelId);
  if (!channel) throw new ApiError(httpStatus.NOT_FOUND, 'Channel not found');
  const limit = Math.max(1, Math.min(100, Number.parseInt(req.query.limit, 10) || 100));
  const items = channel.messages.slice(-limit);
  const authorIds = [...new Set(items.map(item => String(item.authorId)))];
  const users = authorIds.length ? await User.find({ _id: { $in: authorIds } }).select('username shortId avatar').lean() : [];
  const userMap = new Map(users.map(user => [String(user._id), user]));
  res.send(items.map(item => ({ id: String(item._id), text: item.text, createdAt: item.createdAt, author: userMap.get(String(item.authorId)) || { username: 'کاربر', shortId: '' } })));
});
const sendMessage = catchAsync(async (req, res) => {
  if (await maintenanceOn()) throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Vexa is in maintenance mode');
  if (!mongoose.isValidObjectId(req.params.serverId)) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' });
  if (!server || !isMember(server, req.user.id)) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  const channel = server.channels.id(req.params.channelId);
  if (!channel) throw new ApiError(httpStatus.NOT_FOUND, 'Channel not found');
  const text = String(req.body.text || '').trim();
  if (!text || text.length > 2000) throw new ApiError(httpStatus.BAD_REQUEST, 'Message must be 1-2000 characters');
  channel.messages.push({ authorId: req.user.id, text });
  if (channel.messages.length > 300) channel.messages.splice(0, channel.messages.length - 300);
  await server.save();
  const item = channel.messages[channel.messages.length - 1];
  const author = await User.findById(req.user.id).select('username shortId avatar').lean();
  res.status(httpStatus.CREATED).send({ id: String(item._id), text: item.text, createdAt: item.createdAt, author: author || { username: 'کاربر', shortId: '' } });
});

const getRoles = catchAsync(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.serverId)) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' }).select('ownerId memberIds roles').lean();
  if (!server || !isMember(server, req.user.id)) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  res.send((server.roles || []).map(role => ({ id: String(role._id), name: role.name, color: role.color, permissions: role.permissions || [], memberIds: (role.memberIds || []).map(String) })));
});
const createRole = catchAsync(async (req, res) => {
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' });
  if (!server || String(server.ownerId) !== String(req.user.id)) throw new ApiError(httpStatus.FORBIDDEN, 'Only the server owner can manage roles');
  const name = String(req.body.name || '').trim();
  const color = String(req.body.color || '#34d36a');
  const allowed = ['manageChannels', 'manageRoles', 'manageMessages', 'kickMembers', 'banMembers', 'manageEvents', 'viewAuditLog'];
  const permissions = Array.isArray(req.body.permissions) ? [...new Set(req.body.permissions.filter(p => allowed.includes(p)))] : [];
  if (name.length < 2 || name.length > 40 || !/^#[0-9a-fA-F]{6}$/.test(color)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid role name or color');
  if (server.roles.some(r => r.name.toLowerCase() === name.toLowerCase())) throw new ApiError(httpStatus.CONFLICT, 'Role name already exists');
  server.roles.push({ name, color, permissions });
  server.auditLog.push({ actorId: req.user.id, action: 'role_created', target: name });
  if (server.auditLog.length > 200) server.auditLog.splice(0, server.auditLog.length - 200);
  await server.save();
  const role = server.roles[server.roles.length - 1];
  res.status(httpStatus.CREATED).send({ id: String(role._id), name: role.name, color: role.color, permissions: role.permissions, memberIds: [] });
});
const updateRole = catchAsync(async (req, res) => {
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' });
  if (!server || String(server.ownerId) !== String(req.user.id)) throw new ApiError(httpStatus.FORBIDDEN, 'Only the server owner can manage roles');
  const role = server.roles.id(req.params.roleId);
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  const allowed = ['manageChannels', 'manageRoles', 'manageMessages', 'kickMembers', 'banMembers', 'manageEvents', 'viewAuditLog'];
  if (req.body.name !== undefined) {
    const name = String(req.body.name).trim();
    if (name.length < 2 || name.length > 40) throw new ApiError(httpStatus.BAD_REQUEST, 'Role name must be 2-40 characters');
    if (server.roles.some(r => String(r._id) !== String(role._id) && r.name.toLowerCase() === name.toLowerCase())) throw new ApiError(httpStatus.CONFLICT, 'Role name already exists');
    role.name = name;
  }
  if (req.body.color !== undefined) {
    if (!/^#[0-9a-fA-F]{6}$/.test(String(req.body.color))) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid role color');
    role.color = req.body.color;
  }
  if (req.body.permissions !== undefined) {
    if (!Array.isArray(req.body.permissions)) throw new ApiError(httpStatus.BAD_REQUEST, 'Permissions must be an array');
    role.permissions = [...new Set(req.body.permissions.filter(p => allowed.includes(p)))];
  }
  server.auditLog.push({ actorId: req.user.id, action: 'role_updated', target: role.name });
  if (server.auditLog.length > 200) server.auditLog.splice(0, server.auditLog.length - 200);
  await server.save();
  res.send({ id: String(role._id), name: role.name, color: role.color, permissions: role.permissions, memberIds: role.memberIds.map(String) });
});
const deleteRole = catchAsync(async (req, res) => {
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' });
  if (!server || String(server.ownerId) !== String(req.user.id)) throw new ApiError(httpStatus.FORBIDDEN, 'Only the server owner can manage roles');
  const role = server.roles.id(req.params.roleId);
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  if (['مدیر', 'عضو'].includes(role.name)) throw new ApiError(httpStatus.BAD_REQUEST, 'Built-in roles cannot be deleted');
  const name = role.name;
  role.deleteOne();
  server.auditLog.push({ actorId: req.user.id, action: 'role_deleted', target: name });
  if (server.auditLog.length > 200) server.auditLog.splice(0, server.auditLog.length - 200);
  await server.save();
  res.status(httpStatus.NO_CONTENT).send();
});
const updateSettings = catchAsync(async (req, res) => {
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' });
  if (!server || String(server.ownerId) !== String(req.user.id)) throw new ApiError(httpStatus.FORBIDDEN, 'Only the server owner can change settings');
  if (req.body.welcomeMessage !== undefined) {
    const welcomeMessage = String(req.body.welcomeMessage).trim();
    if (welcomeMessage.length > 500) throw new ApiError(httpStatus.BAD_REQUEST, 'Welcome message is too long');
    server.welcomeMessage = welcomeMessage;
  }
  if (req.body.antiSpamEnabled !== undefined) server.antiSpamEnabled = Boolean(req.body.antiSpamEnabled);
  if (req.body.joinApproval !== undefined) server.joinApproval = Boolean(req.body.joinApproval);
  server.auditLog.push({ actorId: req.user.id, action: 'server_settings_updated', target: server.name });
  if (server.auditLog.length > 200) server.auditLog.splice(0, server.auditLog.length - 200);
  await server.save();
  res.send({ welcomeMessage: server.welcomeMessage, antiSpamEnabled: server.antiSpamEnabled, joinApproval: server.joinApproval });
});
const listEvents = catchAsync(async (req, res) => {
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' }).select('memberIds events').lean();
  if (!server || !isMember(server, req.user.id)) throw new ApiError(httpStatus.NOT_FOUND, 'Server not found');
  res.send((server.events || []).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)).map(e => ({ id: String(e._id), title: e.title, description: e.description, startsAt: e.startsAt, attendeeCount: (e.attendeeIds || []).length, createdBy: String(e.createdBy) })));
});
const createEvent = catchAsync(async (req, res) => {
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' });
  if (!server || String(server.ownerId) !== String(req.user.id)) throw new ApiError(httpStatus.FORBIDDEN, 'Only the server owner can create events');
  const title = String(req.body.title || '').trim();
  const description = String(req.body.description || '').trim();
  const startsAt = new Date(req.body.startsAt);
  if (title.length < 2 || title.length > 100 || description.length > 1000 || Number.isNaN(startsAt.getTime())) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid event details');
  server.events.push({ title, description, startsAt, createdBy: req.user.id, attendeeIds: [] });
  server.auditLog.push({ actorId: req.user.id, action: 'event_created', target: title });
  if (server.auditLog.length > 200) server.auditLog.splice(0, server.auditLog.length - 200);
  await server.save();
  const event = server.events[server.events.length - 1];
  res.status(httpStatus.CREATED).send({ id: String(event._id), title: event.title, description: event.description, startsAt: event.startsAt, attendeeCount: 0, createdBy: String(event.createdBy) });
});
const listAuditLog = catchAsync(async (req, res) => {
  const server = await VexaServer.findOne({ _id: req.params.serverId, status: 'active' }).select('ownerId roles auditLog').lean();
  if (!server || (String(server.ownerId) !== String(req.user.id) && !(server.roles || []).some(r => (r.memberIds || []).some(id => String(id) === String(req.user.id)) && (r.permissions || []).includes('viewAuditLog')))) throw new ApiError(httpStatus.FORBIDDEN, 'Audit log access denied');
  res.send((server.auditLog || []).slice(-100).reverse().map(item => ({ actorId: String(item.actorId), action: item.action, target: item.target, createdAt: item.createdAt })));
});

module.exports = { listPublic, mine, create, join, getOne, createChannel, listMessages, sendMessage, getRoles, createRole, updateRole, deleteRole, updateSettings, listEvents, createEvent, listAuditLog };
