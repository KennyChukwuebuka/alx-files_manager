// index.js

const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

// use routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Post/users
router.post('/users', UsersController.postNew);

// Get/users
router.get('/users/me', UsersController.getMe);

// Get/connect
router.get('/connect', AuthController.getConnect);

// Get/disconnect
router.get('/disconnect', AuthController.getDisconnect);

// Post/files
router.post('/files', FilesController.postUpload);

// export routes
module.exports = router;
