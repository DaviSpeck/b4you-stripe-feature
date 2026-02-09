const StripeService = require('../../../services/payment/Stripe');
const StripeWebhookEventsRepository = require('../../../repositories/sequelize/StripeWebhookEventsRepository');
const SQS = require('../../../queues/aws');
const logger = require('../../../utils/logger');

const SUPPORTED_EVENTS = new Set([
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'charge.refunded',
  'charge.refund.updated',
  'charge.dispute.created',
  'charge.dispute.closed',
]);

const getPaymentIntentIdentifiers = (event) => {
  const object = event?.data?.object || {};
  const metadata = object.metadata || {};
  if (event.type?.startsWith('payment_intent.')) {
    return {
      transactionId: metadata.transaction_id || null,
      providerPaymentIntentId: object.id || null,
    };
  }

  if (event.type?.startsWith('charge.')) {
    const chargeObject = object.charge || {};
    return {
      transactionId: null,
      providerPaymentIntentId:
        object.payment_intent ||
        chargeObject.payment_intent ||
        chargeObject.payment_intent_id ||
        null,
    };
  }

  return { transactionId: null, providerPaymentIntentId: null };
};

module.exports = class HandleStripeWebhook {
  #stripeService;

  constructor() {
    this.#stripeService = new StripeService();
  }

  async execute({ rawBody, signature }) {
    let event;
    try {
      event = this.#stripeService.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error) {
      logger.info(
        JSON.stringify({
          message: 'stripe_webhook_invalid_signature',
          error: error?.message,
        }),
      );
      return { ok: false, status: 400, reason: 'invalid_signature' };
    }

    if (!event?.id || !event?.type) {
      logger.info(
        JSON.stringify({
          message: 'stripe_webhook_invalid_payload',
          eventId: event?.id,
          eventType: event?.type,
        }),
      );
      return { ok: false, status: 400, reason: 'invalid_payload' };
    }

    const isSupported =
      SUPPORTED_EVENTS.has(event.type) || event.type.startsWith('charge.dispute.');
    if (!isSupported) {
      logger.info(
        JSON.stringify({
          message: 'stripe_webhook_ignored',
          eventId: event.id,
          eventType: event.type,
        }),
      );
      return { ok: true, ignored: true };
    }

    const existing = await StripeWebhookEventsRepository.findByProviderEventId(
      event.id,
    );
    if (existing) {
      logger.info(
        JSON.stringify({
          message: 'stripe_webhook_duplicate',
          eventId: event.id,
          eventType: event.type,
        }),
      );
      return { ok: true, duplicate: true };
    }

    const { transactionId, providerPaymentIntentId } =
      getPaymentIntentIdentifiers(event);

    if (!transactionId && !providerPaymentIntentId) {
      logger.info(
        JSON.stringify({
          message: 'stripe_webhook_invalid_payload',
          eventId: event.id,
          eventType: event.type,
          reason: 'missing_payment_intent_identifier',
        }),
      );
      return { ok: false, status: 400, reason: 'invalid_payload' };
    }

    await StripeWebhookEventsRepository.create({
      provider_event_id: event.id,
      provider: 'stripe',
      event_type: event.type,
      transaction_id: transactionId,
      provider_payment_intent_id: providerPaymentIntentId,
      payment_intent_status: null,
      processing_result: 'queued',
      payload: event,
    });

    await SQS.add('webhookEvent', {
      provider: 'stripe',
      provider_event_id: event.id,
      event_type: event.type,
      transaction_id: transactionId,
      provider_payment_intent_id: providerPaymentIntentId,
      payload: event,
    });

    logger.info(
      JSON.stringify({
        message: 'stripe_webhook_queued',
        eventId: event.id,
        eventType: event.type,
        transactionId,
      }),
    );

    return { ok: true };
  }
};
