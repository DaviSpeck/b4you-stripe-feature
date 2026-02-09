import { findRulesTypesByKey } from '../types/integrationRulesTypes.mjs';

const STATE_FLOW = {
  payment: ['pending', 'failed', 'succeeded'],
  refund: ['refund_requested', 'refund_succeeded', 'refund_failed'],
  dispute: ['dispute_open', 'dispute_won', 'dispute_lost'],
};

const STATE_CATEGORY = Object.freeze({
  pending: 'payment',
  failed: 'payment',
  succeeded: 'payment',
  refund_requested: 'refund',
  refund_succeeded: 'refund',
  refund_failed: 'refund',
  dispute_open: 'dispute',
  dispute_won: 'dispute',
  dispute_lost: 'dispute',
});

const isRefundEvent = (eventType) =>
  eventType === 'charge.refund.updated' || eventType === 'charge.refunded';

const isDisputeEvent = (eventType) =>
  eventType === 'charge.dispute.created' || eventType === 'charge.dispute.closed';

export function normalizeStripeEvent(eventType, eventPayload) {
  if (eventType === 'payment_intent.succeeded') {
    return { status: 'succeeded', eventKey: 'approved-payment' };
  }
  if (eventType === 'payment_intent.payment_failed') {
    return { status: 'failed', eventKey: 'refused-payment' };
  }

  if (isRefundEvent(eventType)) {
    const refundStatus = eventPayload?.data?.object?.status;
    if (eventType === 'charge.refunded' || refundStatus === 'succeeded') {
      return {
        status: 'refund_succeeded',
        eventKey: 'refund',
        eventType: 'refund',
        eventAction: 'success',
      };
    }
    if (refundStatus === 'pending') {
      return {
        status: 'refund_requested',
        eventKey: 'refund',
        eventType: 'refund',
        eventAction: 'request',
      };
    }
    if (refundStatus === 'failed') {
      return {
        status: 'refund_failed',
        eventKey: 'refund',
        eventType: 'refund',
        eventAction: 'failure',
      };
    }
    return null;
  }

  if (isDisputeEvent(eventType)) {
    const disputeStatus = eventPayload?.data?.object?.status;
    if (eventType === 'charge.dispute.created') {
      return {
        status: 'dispute_open',
        eventKey: 'chargeback',
        eventType: 'dispute',
        eventAction: 'open',
      };
    }
    if (disputeStatus === 'won') {
      return {
        status: 'dispute_won',
        eventKey: 'chargeback',
        eventType: 'dispute',
        eventAction: 'won',
      };
    }
    if (disputeStatus === 'lost') {
      return {
        status: 'dispute_lost',
        eventKey: 'chargeback',
        eventType: 'dispute',
        eventAction: 'lost',
      };
    }
    return null;
  }

  return null;
}

export function shouldApplyStatus(currentStatus, nextStatus) {
  if (!currentStatus) return { apply: true, regression: false };
  const currentCategory = STATE_CATEGORY[currentStatus];
  const nextCategory = STATE_CATEGORY[nextStatus];

  if (currentCategory && nextCategory) {
    if (currentCategory === nextCategory) {
      const flow = STATE_FLOW[currentCategory] || [];
      const currentRank = flow.indexOf(currentStatus);
      const nextRank = flow.indexOf(nextStatus);
      if (nextRank < currentRank) return { apply: false, regression: true };
      if (nextRank === currentRank) return { apply: false, regression: false };
      return { apply: true, regression: false };
    }

    if (currentCategory !== nextCategory && nextCategory === 'payment') {
      return { apply: false, regression: true };
    }

    return { apply: true, regression: false };
  }

  return { apply: true, regression: false };
}

export async function processStripeWebhookEvent(
  payload,
  {
    StripeWebhookEvents,
    StripePaymentIntents,
    Sales_items,
    Products,
    webhooksEvents,
    logger = console,
  }
) {
  const {
    provider_event_id,
    event_type,
    transaction_id,
    provider_payment_intent_id,
  } = payload || {};

  if (!provider_event_id || !event_type) {
    logger.info?.(
      JSON.stringify({
        message: 'stripe_webhook_invalid_payload',
        provider_event_id,
        event_type,
      })
    );
    return { ok: false, reason: 'invalid_payload' };
  }

  const existing = await StripeWebhookEvents.findOne({
    where: { provider_event_id },
  });
  if (existing?.processing_result && existing.processing_result !== 'queued') {
    logger.info?.(
      JSON.stringify({
        message: 'stripe_webhook_already_processed',
        provider_event_id,
        event_type,
      })
    );
    return { ok: true, duplicate: true };
  }

  const intentRecord = transaction_id
    ? await StripePaymentIntents.findOne({ where: { transaction_id } })
    : await StripePaymentIntents.findOne({
        where: { provider_payment_intent_id },
      });

  const mapped = normalizeStripeEvent(event_type, payload?.payload);
  const normalizedPayload =
    mapped?.eventType && mapped?.eventAction
      ? {
          ...payload.payload,
          normalized_event: {
            event_type: mapped.eventType,
            event_action: mapped.eventAction,
          },
        }
      : payload?.payload;

  if (!intentRecord || !mapped) {
    await StripeWebhookEvents.update(
      {
        processing_result: 'orphaned',
        payload: normalizedPayload,
      },
      { where: { provider_event_id } }
    );
    logger.info?.(
      JSON.stringify({
        message: 'stripe_webhook_orphaned',
        provider_event_id,
        event_type,
        transaction_id,
      })
    );
    return { ok: true, orphaned: true };
  }

  const { apply, regression } = shouldApplyStatus(
    intentRecord.status,
    mapped.status
  );

  if (!apply) {
    await StripeWebhookEvents.update(
      {
        processing_result: regression
          ? 'ignored_regression'
          : 'ignored_same_status',
        payment_intent_status: intentRecord.status,
        payload: normalizedPayload,
      },
      { where: { provider_event_id } }
    );
    return { ok: true, regression };
  }

  await StripePaymentIntents.update(
    { status: mapped.status },
    { where: { transaction_id: intentRecord.transaction_id } }
  );

  await StripeWebhookEvents.update(
    {
      processing_result: 'processed',
      payment_intent_status: mapped.status,
      payload: normalizedPayload,
    },
    { where: { provider_event_id } }
  );

  const saleIdentifier = intentRecord.sale_id;
  let saleItem = null;
  if (saleIdentifier) {
    saleItem = await Sales_items.findOne({
      where: Number.isFinite(Number(saleIdentifier))
        ? { id: saleIdentifier }
        : { uuid: saleIdentifier },
    });
  }

  if (!saleItem) {
    logger.info?.(
      JSON.stringify({
        message: 'stripe_webhook_sale_item_not_found',
        provider_event_id,
        sale_id: saleIdentifier,
      })
    );
    return { ok: true };
  }

  const product = await Products.findOne({
    where: { id: saleItem.id_product },
  });

  const rulesEvent = findRulesTypesByKey(mapped.eventKey);
  if (!product || !rulesEvent) {
    return { ok: true };
  }

  await webhooksEvents.send({
    event_id: rulesEvent.id,
    id_cart: null,
    id_product: product.id,
    id_sale_item: saleItem.id,
    id_user: product.id_user,
    id_affiliate: saleItem.id_affiliate,
  });

  return { ok: true };
}
