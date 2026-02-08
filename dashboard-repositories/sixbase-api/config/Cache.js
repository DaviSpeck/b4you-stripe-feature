const { client, get } = require('./redis');

module.exports = class Cache {
  static async set(key, value, timeInMinutes = 5) {
    await client.setEx(key, timeInMinutes * 60, value);
  }

  static async get(key) {
    return get(key);
  }

  static async del(key) {
    return client.del(key);
  }
};
