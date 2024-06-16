// index.js

const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');

// use routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Post/users
router.post('/users', UsersController.postNew);

// Get/users
router.get('/users/me', UsersController.getMe);

// Get/connect
router.get('/connect', AuthController.connect);

// Get/disconnect
router.get('/disconnect', AuthController.disconnect);

// export routes
module.exports = router;
