const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const config = require('./database');
const { client } = require('./redis');
const { getCookieOptions } = require('../utils/getCookieOptions');

module.exports = (req, res, next) => {
  const cookieOptions = getCookieOptions(req);

  return session({
    secret: config.secure,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      ...cookieOptions,
    },
  })(req, res, next);
};