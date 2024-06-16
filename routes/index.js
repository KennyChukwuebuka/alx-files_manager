// index.js

const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

// use routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Post/users
router.post('/users', UsersController.postNew); // Add new endpoint

// export routes
module.exports = router;
