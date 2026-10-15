const express = require('express');
const auth = require('../../middlewares/auth');
const controller = require('./support.controller');
const router = express.Router();
router.post('/', auth(), controller.createTicket);
module.exports = router;
