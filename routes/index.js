// index.js

const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');

// use routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// export routes
module.exports = router;
