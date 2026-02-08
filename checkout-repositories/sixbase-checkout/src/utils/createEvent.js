import api from 'api';

async function sentEvent(event) {
  await api.post('/event/create_event', event);
}

export async function createEvent({ eventType, eventName, idOffer, saleItem }) {
  const event = {
    eventType: eventType,
    name: eventName,
    idOffer: idOffer,
    saleItem: saleItem,
  };

  await sentEvent(event);
}