const StripeWebhookEvents = require('../../database/models/Stripe_webhook_events');

module.exports = class StripeWebhookEventsRepository {
  static async findByProviderEventId(provider_event_id, t = null) {
    return StripeWebhookEvents.findOne({
      where: { provider_event_id },
      transaction: t,
    });
  }

  static async create(data, t = null) {
    const record = await StripeWebhookEvents.create(
      data,
      t ? { transaction: t } : null,
    );
    return record.toJSON();
  }
};
