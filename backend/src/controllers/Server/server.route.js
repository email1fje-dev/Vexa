const express = require('express');
const auth = require('../../middlewares/auth');
const controller = require('./server.controller');
const router = express.Router();
router.get('/discover', controller.listPublic);
router.get('/mine', auth(), controller.mine);
router.post('/', auth(), controller.create);
router.post('/join', auth(), controller.join);
module.exports = router;
