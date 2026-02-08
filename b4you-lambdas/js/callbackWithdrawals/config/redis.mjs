import { createClient } from 'redis';
import { promisify } from 'util';

const clientConfig = {
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
  },
  legacyMode: true,
};

if (process.env.PASSWORD_REDIS)
  clientConfig.password = process.env.PASSWORD_REDIS;

export const redisClient = createClient(clientConfig);

export const start = async () => {
  await redisClient.connect();
  await redisClient.ping();
};

export const close = async () => {
  await redisClient.disconnect();
};

redisClient.on('connect', () => {
  console.log('Redis connect');
});
redisClient.on('reconnecting', () => {
  console.log('Redis reconnecting');
});
redisClient.on('end', () => {
  console.log('Redis end');
});
redisClient.on('ready', () => {
  console.log('Redis ready!');
});

redisClient.on('error', (err) => {
  console.log(`Error on REDIS ${JSON.stringify(err)}`);
});

export const getAsync = promisify(redisClient.get).bind(redisClient);
export const setAsync = promisify(redisClient.set).bind(redisClient);
export const delAsync = promisify(redisClient.del).bind(redisClient);

export const shutdownRedis = async () => {
  await new Promise((resolve) => {
    redisClient.quit(() => {
      resolve();
    });
  });
};
