const { RateLimiterRedis } = require('rate-limiter-flexible');
const { client: redisClient } = require('./redis');

const MAX_CONSECUTIVE_FAILS = 3;
const THREE_HOURS = 3600 * 3;
const FIFTEEN_MINUTES = 60 * 15;

module.exports = new RateLimiterRedis({
  redis: redisClient,
  keyPrefix: 'email_fail',
  points: MAX_CONSECUTIVE_FAILS,
  duration: THREE_HOURS,
  blockDuration: FIFTEEN_MINUTES,
});
