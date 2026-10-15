const express = require('express');
const auth = require('../../middlewares/auth');
const ownerOnly = require('../../middlewares/ownerOnly');
const controller = require('./admin.controller');

const router = express.Router();

// Every endpoint requires a valid JWT AND the one owner email configured in Railway.
router.use(auth(), ownerOnly);

router.get('/me', controller.getMe);
router.get('/overview', controller.getOverview);
router.get('/users', controller.getUsers);
router.patch('/users/:userId/verified', controller.setVerifiedBadge);
router.get('/audit', controller.getAudit);
router.get('/messages/summary', controller.getMessageSummary);

module.exports = router;
