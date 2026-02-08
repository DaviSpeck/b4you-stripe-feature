const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const config = require('./database');
const { client } = require('./redis');

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

module.exports = session({
  secret: config.secure,
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({
    client,
    ttl: THIRTY_DAYS / 1000,
  }),
  cookie: {
    maxAge: THIRTY_DAYS,
    ...(process.env.ENVIRONMENT === 'PRODUCTION'
      ? {
        sameSite: 'none',
        secure: true,
      }
      : {
        sameSite: 'lax',
        secure: false,
      }),
  },
});