const checkoutEventsRepository = require('./checkoutEvents.repository');
const logger = require('../utils/logger');

const normalizeString = (value, { lowercase = false } = {}) => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return lowercase ? trimmed.toLowerCase() : trimmed;
};

const normalizePayload = (payload, { ipAddress, userAgent }, identity) => ({
  event_id: normalizeString(payload.eventId),
  event_name: normalizeString(payload.eventName),
  event_description: normalizeString(payload.eventDescription),
  session_id: normalizeString(payload.sessionId),
  offer_id: normalizeString(payload.offerId),
  product_id: normalizeString(identity.productId),
  producer_id: normalizeString(identity.producerId),
  checkout_type: normalizeString(payload.checkoutType),
  checkout_mode: normalizeString(payload.checkoutMode),
  step: normalizeString(payload.step),
  email: normalizeString(payload.email, { lowercase: true }),
  phone: normalizeString(payload.phone),
  payment_method: normalizeString(payload.paymentMethod),
  event_timestamp: payload.timestamp,
  execution_environment: normalizeString(payload.executionEnvironment),
  full_hostname: normalizeString(payload.fullHostname),
  root_domain: normalizeString(payload.rootDomain),
  received_at: new Date(),
  ip_address: normalizeString(ipAddress),
  user_agent: normalizeString(userAgent),
});

const ingest = async (payload, context) => {
  try {
    const identity = await checkoutEventsRepository.resolveOfferIdentity(
      payload.offerId,
    );
    if (!identity) {
      return { ok: false, reason: 'identity_resolution_failed' };
    }

    const normalizedPayload = normalizePayload(payload, context, identity);
    await checkoutEventsRepository.create(normalizedPayload);
    return { ok: true };
  } catch (error) {
    logger.error(
      JSON.stringify({
        type: 'CHECKOUT_EVENT_PERSIST_ERROR',
        error: error?.message || error,
        eventId: payload?.eventId,
      }),
    );
    return { ok: false, reason: 'identity_resolution_error' };
  }
};

module.exports = {
  ingest,
};
