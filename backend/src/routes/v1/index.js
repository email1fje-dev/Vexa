const express = require('express');
const authRoute = require('../../controllers/Auth/auth.route');
const userRoute = require('../../controllers/User/user.route');
const friendRoute = require('../../controllers/Friend/friend.route');
const roomRoute = require('../../controllers/Room/room.route');
const messageRoute = require('../../controllers/Message/message.route');
const adminRoute = require('../../controllers/Admin/admin.route');
const reportRoute = require('../../controllers/Report/report.route');
const announcementRoute = require('../../controllers/Announcement/announcement.route');
const serverRoute = require('../../controllers/Server/server.route');
const supportRoute = require('../../controllers/Support/support.route');
const { AdminSetting } = require('../../models');

const router = express.Router();

// A maintenance setting blocks end-user APIs while keeping owner administration and login available.
router.use(async (req, res, next) => {
  if (req.path.startsWith('/admin') || req.path === '/auth/login' || req.path === '/auth/refresh-tokens' || req.path === '/announcements/active') return next();
  try {
    const setting = await AdminSetting.findOne({ key: 'maintenanceMode' }).lean();
    if (setting && setting.value === true) return res.status(503).json({ message: 'Vexa is temporarily in maintenance mode' });
    return next();
  } catch (error) {
    return next(error);
  }
});
router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/friends', friendRoute);
router.use('/rooms', roomRoute);
router.use('/messages', messageRoute);
router.use('/admin', adminRoute);
router.use('/reports', reportRoute);
router.use('/announcements', announcementRoute);
router.use('/servers', serverRoute);
router.use('/support', supportRoute);
module.exports = router;
