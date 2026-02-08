const Events = require('../models/Events');

const createEvents = async (event) => {
  try {
    const events = await Events.create({
      event_type: event.eventType,
      name: event.name,
      id_offer: event.idOffer,
      sale_item_id: event.saleItemId,
      url: event.url,
      session_id: event.sessionId,
      user_agent: event.user_agent,
      ip: event.ip,
    });
    return events;
  } catch (error) {
    // console.error("error creating event",error)
    throw error;
  }
};

module.exports = createEvents;
