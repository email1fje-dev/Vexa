const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

/**
 * Restrict the control panel to the single owner configured in Railway.
 * A role by itself is deliberately not enough to access owner-only routes.
 */
module.exports = (req, res, next) => {
  const configuredOwner = String(process.env.VEXA_ADMIN_EMAIL || '').trim().toLowerCase();
  const authenticatedEmail = String(req.user && req.user.email || '').trim().toLowerCase();

  if (!configuredOwner || !authenticatedEmail ||
      authenticatedEmail !== configuredOwner ||
      !req.user || req.user.role !== 'admin') {
    return next(new ApiError(httpStatus.FORBIDDEN, 'Owner access only'));
  }

  return next();
};
