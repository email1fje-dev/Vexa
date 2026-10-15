const Joi = require('joi');
const { objectId } = require('../../../validations/custom.validation');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string(),
      name: Joi.string(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};


const updateMyProfile = {
  body: Joi.object().keys({
    username: Joi.string().trim().min(2).max(32),
    bio: Joi.string().trim().max(160),
    avatar: Joi.string().max(400000).allow(''),
    profileVideo: Joi.string().max(900000).allow(''),
    presenceStatus: Joi.string().valid('online', 'idle', 'dnd'),
  }).min(1),
};

const createFriendRequest = {
  body: Joi.object().keys({
    username: Joi.string().min(4).required(),
    shortId: Joi.string().min(4).max(4).required(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateMyProfile,
  createFriendRequest
};
