const httpStatus = require('http-status');
const pick = require('../../utils/pick');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const { userService } = require('../../services');

const updateMyProfile = catchAsync(async (req, res) => {
  const allowed = {};
  if (typeof req.body.username === 'string') allowed.username = req.body.username.trim().slice(0, 32);
  if (typeof req.body.bio === 'string') allowed.bio = req.body.bio.trim().slice(0, 160);
  if (typeof req.body.avatar === 'string') {
    const avatar = req.body.avatar;
    if (avatar && (!/^data:image\/(png|jpeg|webp);base64,/.test(avatar) || avatar.length > 400000)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Profile image must be a small PNG, JPG, or WebP image');
    }
    allowed.avatar = avatar;
  }
  if (['online', 'idle', 'dnd'].includes(req.body.presenceStatus)) allowed.presenceStatus = req.body.presenceStatus;
  if (!Object.keys(allowed).length) throw new ApiError(httpStatus.BAD_REQUEST, 'No profile changes provided');
  const user = await userService.updateUserById(req.user.id, allowed);
  res.send(user);
});

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  updateMyProfile,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
