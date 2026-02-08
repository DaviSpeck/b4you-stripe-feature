const express = require('express');
const cors = require('cors');
const logger = require('../utils/logger');
const checkoutEventsController = require('../events/checkoutEvents.controller');

const router = express.Router();

const corsOptions = {
  origin: (origin, callback) => {
    if (origin) {
      callback(null, origin);
    } else {
      callback(null, '*');
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

router.use(cors(corsOptions));

router.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  return next();
});

router.use((req, res, next) => {
  const contentLength = Number(req.headers['content-length']);
  if (Number.isFinite(contentLength) && contentLength > 51200) {
    logger.info(
      JSON.stringify({
        type: 'CHECKOUT_EVENT_INVALID',
        payload: req.body,
        eventId: req.body?.eventId,
        reasons: ['payload_too_large'],
      }),
    );
    return res.sendStatus(400);
  }
  return next();
});

router.post('/checkout', checkoutEventsController);

module.exports = router;
