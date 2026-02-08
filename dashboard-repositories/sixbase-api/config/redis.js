const redis = require('redis');
const { promisify } = require('util');
const logger = require('../utils/logger');
const { redis: redisConfig } = require('./database');

const clientConfig = {
  socket: {
    host: redisConfig.host,
  },
  legacyMode: true,
};

if (redisConfig.password) clientConfig.password = redisConfig.password;
if (redisConfig.port) clientConfig.socket.port = redisConfig.port;

const redisClient = redis.createClient(clientConfig);

const start = async () => {
  await redisClient.connect();
  await redisClient.ping();
};

redisClient.on('connect', () => {
  logger.info('Redis connect');
});
redisClient.on('reconnecting', () => {
  logger.info('Redis reconnecting');
});
redisClient.on('end', () => {
  logger.info('Redis end');
});
redisClient.on('ready', () => {
  logger.info('Redis ready!');
});

redisClient.on('error', (err) => {
  logger.error(`Error on REDIS ${JSON.stringify(err)}`);
});

const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

const shutdownRedis = async () => {
  await new Promise((resolve) => {
    redisClient.quit(() => {
      resolve();
    });
  });
};

start();

module.exports = {
  get: getAsync,
  set: setAsync,
  del: delAsync,
  client: redisClient,
  shutdownRedis,
};
