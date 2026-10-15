const express = require('express');
const auth = require('../../middlewares/auth');
const ownerOnly = require('../../middlewares/ownerOnly');
const controller = require('./admin.controller');
const router = express.Router();

// Valid access token + the single owner email configured in Railway are required for every endpoint.
router.use(auth(), ownerOnly);
router.get('/me', controller.getMe);
router.get('/overview', controller.getOverview);
router.get('/users', controller.getUsers);
router.patch('/users/:userId/verified', controller.setVerifiedBadge);
router.get('/audit', controller.getAudit);
router.get('/messages/summary', controller.getMessageSummary);
router.get('/reports', controller.getReports);
router.get('/support', controller.getSupportTickets);
router.patch('/reports/:reportId', controller.updateReport);
router.get('/announcements', controller.getAnnouncements);
router.post('/announcements', controller.createAnnouncement);
router.patch('/announcements/:announcementId', controller.updateAnnouncement);
router.delete('/announcements/:announcementId', controller.deleteAnnouncement);
router.get('/servers', controller.getServers);
router.patch('/servers/:serverId', controller.updateServer);
router.get('/settings', controller.getSettings);
router.get('/system-events', controller.getSystemEvents);
router.patch('/settings', controller.updateSettings);
module.exports = router;
