const express = require('express');
const controller = require('./announcement.controller');
const router = express.Router();
router.get('/active', controller.getActive);
module.exports = router;
