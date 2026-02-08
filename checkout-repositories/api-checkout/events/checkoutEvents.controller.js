const logger = require('../utils/logger');
const checkoutEventsService = require('./checkoutEvents.service');

const REQUIRED_FIELDS = [
  'eventId',
  'eventName',
  'sessionId',
  'offerId',
  'timestamp',
  'executionEnvironment',
  'fullHostname',
  'rootDomain',
];
const VALID_EVENT_NAMES = new Set([
  'checkout_page_view',
  'checkout_session_started',
  'checkout_identification_started',
  'checkout_identification_filled',
  'checkout_identification_error',
  'checkout_identification_completed',
  'checkout_address_started',
  'checkout_address_filled',
  'checkout_address_error',
  'checkout_shipping_method_selected',
  'checkout_address_completed',
  'checkout_step_viewed',
  'checkout_step_advanced',
  'checkout_step_back',
  'checkout_payment_method_selected',
  'checkout_payment_data_started',
  'checkout_payment_data_error',
  'checkout_coupon_applied',
  'checkout_coupon_error',
  'checkout_order_bump_viewed',
  'checkout_order_bump_accepted',
  'checkout_order_bump_declined',
  'checkout_submit_clicked',
  'checkout_payment_success',
  'checkout_conversion_success',
  'checkout_payment_error',
]);
const VALID_CHECKOUT_TYPES = new Set(['standard', '3steps']);
const VALID_CHECKOUT_MODES = new Set([
  'embedded',
  'transparent',
  'sandbox',
  'development',
]);
const VALID_STEPS = new Set(['identification', 'address', 'payment']);
const VALID_PAYMENT_METHODS = new Set(['credit_card', 'pix', 'boleto']);
const VALID_EXECUTION_ENVIRONMENTS = new Set([
  'production',
  'sandbox',
  'development',
]);

const isBlankString = (value) =>
  typeof value !== 'string' || value.trim().length === 0;

const getInvalidReasons = (payload) => {
  const reasons = [];
  REQUIRED_FIELDS.forEach((field) => {
    if (payload?.[field] == null) {
      reasons.push(`missing_${field}`);
    }
  });
  if (payload?.eventName && !VALID_EVENT_NAMES.has(payload.eventName)) {
    reasons.push('invalid_eventName');
  }
  if (payload?.checkoutType && !VALID_CHECKOUT_TYPES.has(payload.checkoutType)) {
    reasons.push('invalid_checkoutType');
  }
  if (payload?.checkoutMode && !VALID_CHECKOUT_MODES.has(payload.checkoutMode)) {
    reasons.push('invalid_checkoutMode');
  }
  if (payload?.step && !VALID_STEPS.has(payload.step)) {
    reasons.push('invalid_step');
  }
  if (payload?.paymentMethod && !VALID_PAYMENT_METHODS.has(payload.paymentMethod)) {
    reasons.push('invalid_paymentMethod');
  }
  if (
    payload?.executionEnvironment &&
    !VALID_EXECUTION_ENVIRONMENTS.has(payload.executionEnvironment)
  ) {
    reasons.push('invalid_executionEnvironment');
  }
  if (payload?.fullHostname != null && isBlankString(payload.fullHostname)) {
    reasons.push('blank_fullHostname');
  }
  if (payload?.rootDomain != null && isBlankString(payload.rootDomain)) {
    reasons.push('blank_rootDomain');
  }
  if (payload?.productId != null) {
    reasons.push('unexpected_productId');
  }
  if (payload?.producerId != null) {
    reasons.push('unexpected_producerId');
  }
  return reasons;
};

const checkoutEventsController = async (req, res) => {
  try {
    if (!req.is('application/json')) {
      logger.info(
        JSON.stringify({
          type: 'CHECKOUT_EVENT_INVALID',
          payload: req.body,
          eventId: req.body?.eventId,
          reasons: ['invalid_content_type'],
        }),
      );
      return res.sendStatus(400);
    }

    const payload = req.body || {};

    const invalidReasons = getInvalidReasons(payload);
    if (invalidReasons.length > 0) {
      logger.info(
        JSON.stringify({
          type: 'CHECKOUT_EVENT_INVALID',
          payload,
          eventId: payload?.eventId,
          reasons: invalidReasons,
        }),
      );
      return res.sendStatus(400);
    }

    logger.info(
      JSON.stringify({
        type: 'CHECKOUT_EVENT_RECEIVED',
        eventId: payload.eventId,
        eventName: payload.eventName,
        sessionId: payload.sessionId,
        offerId: payload.offerId,
      }),
    );

    const result = await checkoutEventsService.ingest(payload, {
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    if (!result.ok) {
      logger.info(
        JSON.stringify({
          type: 'CHECKOUT_EVENT_INVALID',
          payload,
          eventId: payload?.eventId,
          reasons: [result.reason],
        }),
      );
      return res.sendStatus(400);
    }
  } catch (error) {
    logger.error(
      JSON.stringify({
        type: 'CHECKOUT_EVENT_PERSIST_ERROR',
        error: error?.message || error,
        eventId: req.body?.eventId,
      }),
    );
  }

  return res.sendStatus(204);
};

module.exports = checkoutEventsController;
