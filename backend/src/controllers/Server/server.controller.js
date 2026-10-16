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
    .select('name description inviteCode ownerId memberIds status visibility createdAt')
    .populate('ownerId', 'username shortId avatar').sort({ createdAt: -1 }).limit(50).lean();
  res.send(items.map(s => ({ ...serialize(s), owner: s.ownerId })));
});
const mine = catchAsync(async (req, res) => {
  const items = await VexaServer.find({ memberIds: req.user.id, status: 'active' })
    .select('name description inviteCode ownerId memberIds status visibility createdAt')
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
module.exports = { listPublic, mine, create, join, getOne, createChannel, listMessages, sendMessage };
