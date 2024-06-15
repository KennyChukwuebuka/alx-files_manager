// AppController.js

const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

// routes
module.exports.getStatus = async (req, res) => {
  res.status(200).json({
    redis: await redisClient.isAlive(),
    db: await dbClient.isAlive(),
  });
};

// routes
module.exports.getStats = async (req, res) => {
  res.status(200).json({
    nbUsers: await dbClient.nbUsers(),
    nbFiles: await dbClient.nbFiles(),
  });
};
