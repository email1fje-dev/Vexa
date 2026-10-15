const httpStatus = require('http-status');
const { SupportTicket } = require('../../models');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

const createTicket = catchAsync(async (req, res) => {
  const title = String(req.body.title || '').trim();
  const message = String(req.body.message || '').trim();
  const category = req.body.category || 'other';
  if (title.length < 3 || title.length > 120 || message.length < 10 || message.length > 3000) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Title must be 3-120 characters and message 10-3000 characters');
  }
  if (!['account', 'bug', 'safety', 'other'].includes(category)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid support category');
  const ticket = await SupportTicket.create({ userId: req.user.id, title, message, category });
  res.status(httpStatus.CREATED).send({ id: ticket.id, title: ticket.title, category: ticket.category, status: ticket.status, createdAt: ticket.createdAt });
});
module.exports = { createTicket };
