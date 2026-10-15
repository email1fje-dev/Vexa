const httpStatus = require('http-status');
const { VexaServer, AdminSetting } = require('../../models');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const maintenanceOn = async () => {
  const setting = await AdminSetting.findOne({ key: 'maintenanceMode' }).lean();
  return Boolean(setting && setting.value === true);
};
const makeInvite = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 10; i += 1) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
};
const serialize = (server) => ({
  id: String(server._id), name: server.name, description: server.description || '',
  inviteCode: server.inviteCode, owner: server.ownerId,
  memberCount: (server.memberIds || []).length, status: server.status,
  visibility: server.visibility, createdAt: server.createdAt,
});
const listPublic = catchAsync(async (req, res) => {
  const setting = await AdminSetting.findOne({ key: 'publicServerDiscovery' }).lean();
  if (setting && setting.value === false) return res.send([]);
  const items = await VexaServer.find({ status: 'active', visibility: 'public' })
    .select('name description inviteCode ownerId memberIds status visibility createdAt')
    .populate('ownerId', 'username shortId avatar').sort({ createdAt: -1 }).limit(50).lean();
  res.send(items.map(s => ({ ...serialize(s), owner: s.ownerId })));
});
const mine = catchAsync(async (req, res) => {
  const items = await VexaServer.find({ memberIds: req.user.id, status: { $ne: 'archived' } })
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
  const server = await VexaServer.create({ name, description, inviteCode, ownerId: req.user.id, memberIds: [req.user.id] });
  res.status(httpStatus.CREATED).send(serialize(server));
});
const join = catchAsync(async (req, res) => {
  if (await maintenanceOn()) throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Vexa is in maintenance mode');
  const code = String(req.body.inviteCode || '').trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{10}$/.test(code)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid invite code');
  const server = await VexaServer.findOne({ inviteCode: code, status: 'active' });
  if (!server) throw new ApiError(httpStatus.NOT_FOUND, 'Invite not found or server unavailable');
  if (server.visibility === 'private' && !server.memberIds.some(id => String(id) === String(req.user.id))) throw new ApiError(httpStatus.FORBIDDEN, 'This server is private');
  if (!server.memberIds.some(id => String(id) === String(req.user.id))) { server.memberIds.push(req.user.id); await server.save(); }
  res.send(serialize(server));
});
module.exports = { listPublic, mine, create, join };
