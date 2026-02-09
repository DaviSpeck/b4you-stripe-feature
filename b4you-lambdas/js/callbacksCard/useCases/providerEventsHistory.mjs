export const buildEventId = (rawEventId, fallbackParts = []) => {
  if (rawEventId) return String(rawEventId);
  const fallback = fallbackParts.filter(Boolean).join('-');
  return fallback || null;
};

export const recordProviderEvent = async ({
  ProviderEventsHistory,
  eventId,
  provider,
  eventType,
  eventAction,
  occurredAt,
  transactionId,
  orderId,
  saleId,
  payload,
}) => {
  if (!eventId) return { ok: false, reason: 'missing_event_id' };
  const existing = await ProviderEventsHistory.findOne({
    where: { event_id: eventId, provider },
  });
  if (existing) return { ok: true, duplicate: true };

  await ProviderEventsHistory.create({
    event_id: eventId,
    provider,
    event_type: eventType,
    event_action: eventAction,
    occurred_at: occurredAt,
    transaction_id: transactionId,
    order_id: orderId,
    sale_id: saleId,
    payload,
  });

  return { ok: true, duplicate: false };
};
