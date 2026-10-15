const httpStatus = require('http-status');

const messageService = require('../../services/message.service');
const { AdminSetting } = require('../../models');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');

module.exports = catchAsync(async (req, res) => {
  const formData = JSON.parse(JSON.stringify(req.body));
  const setting = await AdminSetting.findOne({ key: 'maxMessageLength' }).lean();
  const maxLength = setting && Number.isInteger(setting.value) ? setting.value : 2000;
  const bodyText = String(formData.text || formData.message || '');
  if (bodyText.length > maxLength) throw new ApiError(httpStatus.BAD_REQUEST, 'Message exceeds the configured length limit');
  const message = await messageService.createMessage(req.user, formData);
  res.status(httpStatus.CREATED).send(message);
});
