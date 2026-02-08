const redis = require('redis');
const logger = require('../utils/logger');
const { redis: redisConfig } = require('./database');

const clientConfig = {
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
  password: redisConfig.password || undefined,
};

const redisClient = redis.createClient(clientConfig);

redisClient.on('connect', () => logger.info('[REDIS] connect'));
redisClient.on('reconnecting', () => logger.info('[REDIS] reconnecting'));
redisClient.on('end', () => logger.info('[REDIS] end'));
redisClient.on('ready', () => logger.info('[REDIS] ready!'));
redisClient.on('error', (err) => logger.error('[REDIS] error', err));

const start = async () => {
  await redisClient.connect();
  await redisClient.ping();
  logger.info('[REDIS] client started and ping successful');
};

const shutdownRedis = async () => {
  await redisClient.quit();
  logger.info('[REDIS] client shutdown');
};

start();

module.exports = {
  get: async (key) => {
    const val = await redisClient.get(key);
    if (!val) {
      return null;
    }
    try {
      const parsed = JSON.parse(val);
      return parsed;
    } catch (e) {
      return val;
    }
  },

  set: async (key, value, ttlSeconds = 60) => {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.set(key, stringValue, { EX: ttlSeconds });
  },

  del: async (key) => {
    const res = await redisClient.del(key);
    return res;
  },

  client: redisClient,
  shutdownRedis,
};