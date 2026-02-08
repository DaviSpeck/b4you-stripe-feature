import { createClient } from 'redis';

const clientConfig = {
  socket: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    connectTimeout: 10000,
    lazyConnect: true,
  },
};

if (process.env.PASSWORD_REDIS) {
  clientConfig.password = process.env.PASSWORD_REDIS;
}

export const redisClient = createClient(clientConfig);

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
  console.log(`Error on REDIS ->`, err);
});

export const start = async () => {
  await redisClient.connect();
  console.log('Redis client connected');
};

export const stop = async () => {
  await redisClient.disconnect();
  console.log('Redis client disconnected');
};
