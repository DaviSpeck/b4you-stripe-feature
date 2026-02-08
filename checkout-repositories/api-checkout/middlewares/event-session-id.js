const uuid = require('../utils/helpers/uuid');

const eventMiddleware = (req, res, next) => {
    let { eventSessionId } = req.cookies;
    if (!eventSessionId) {
        eventSessionId = uuid.v4();
        res.cookie('eventSessionId', eventSessionId, {
          maxAge: 1000 * 60 * 60, // 1 hour
        });
      }
    req.eventSessionId = eventSessionId;
    next();
}

module.exports = eventMiddleware;