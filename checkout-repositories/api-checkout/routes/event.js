const express = require('express');
const cors = require('cors');

const router = express.Router();

const createEventController = require('../controllers/events');
const eventMiddleware = require('../middlewares/event-session-id');

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

router.use(eventMiddleware);

router.post('/create_event', createEventController);

module.exports = router;
