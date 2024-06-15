const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();

    this.client.on('error', (err) => {
      console.log('Redis error:', err);
    });
  }

  isAlive() {
    try {
      this.client.ping();
      return true;
    } catch (err) {
      return false;
    }
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) reject(err);
        else resolve(value);
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', duration, (err, reply) => {
        if (err) reject(err);
        else resolve(reply);
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err, count) => {
        if (err) reject(err);
        else resolve(count);
      });
    });
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
