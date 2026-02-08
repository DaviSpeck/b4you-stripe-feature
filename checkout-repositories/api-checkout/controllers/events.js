// const createEvents = require('../database/controllers/events');

const createEventController = async (req, res) => {
  // const { eventType, idOffer, saleItemId, name, url } = req.body;
  // const user_agent = req.headers['user-agent'];

  // const { eventSessionId } = req;
  // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  try {
    // const eventData = {
    //   eventType,
    //   idOffer,
    //   saleItemId,
    //   name,
    //   url: url || req.headers.referrer || req.headers.referer || '',
    //   sessionId: eventSessionId,
    //   user_agent,
    //   ip,
    // };

    // const newEvent = await createEvents(eventData);

    res.sendStatus(200);
  } catch (error) {
    // console.error('Error in createEventController:', error);
    res
      .status(500)
      .json({ message: 'Error creating event', error: error.message });
  }
};

module.exports = createEventController;
