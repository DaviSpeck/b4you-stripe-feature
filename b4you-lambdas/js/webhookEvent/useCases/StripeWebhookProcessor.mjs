import { findRulesTypesByKey } from '../types/integrationRulesTypes.mjs';

export const STATUS_RANK = {
  pending: 0,
  failed: 1,
  succeeded: 2,
  refunded: 3,
  disputed: 4,
};

export function mapEventToStatus(eventType) {
  switch (eventType) {
    case 'payment_intent.succeeded':
      return { status: 'succeeded', eventKey: 'approved-payment' };
    case 'payment_intent.payment_failed':
      return { status: 'failed', eventKey: 'refused-payment' };
    case 'charge.refunded':
      return { status: 'refunded', eventKey: 'refund' };
    default:
      if (eventType?.startsWith('charge.dispute.')) {
        return { status: 'disputed', eventKey: 'chargeback' };
      }
      return null;
  }
}

export function shouldApplyStatus(currentStatus, nextStatus) {
  const currentRank = STATUS_RANK[currentStatus] ?? -1;
  const nextRank = STATUS_RANK[nextStatus] ?? -1;
  if (nextRank < currentRank) return { apply: false, regression: true };
  if (nextRank === currentRank) return { apply: false, regression: false };
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

  const mapped = mapEventToStatus(event_type);
  if (!intentRecord || !mapped) {
    await StripeWebhookEvents.update(
      {
        processing_result: 'orphaned',
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
