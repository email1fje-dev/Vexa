const express = require('express');
const auth = require('../../middlewares/auth');
const controller = require('./report.controller');
const router = express.Router();
router.post('/', auth(), controller.createReport);
module.exports = router;
