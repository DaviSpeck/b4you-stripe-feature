const StripePaymentIntents = require('../../database/models/Stripe_payment_intents');

module.exports = class StripePaymentIntentsRepository {
  static async create(data, t = null) {
    const record = await StripePaymentIntents.create(
      data,
      t ? { transaction: t } : null,
    );
    return record.toJSON();
  }

  static async findByTransactionId(transaction_id, t = null) {
    return StripePaymentIntents.findOne({
      where: { transaction_id },
      transaction: t,
    });
  }

  static async findByProviderPaymentIntentId(provider_payment_intent_id, t = null) {
    return StripePaymentIntents.findOne({
      where: { provider_payment_intent_id },
      transaction: t,
    });
  }

  static async updateStatus(transaction_id, status, t = null) {
    await StripePaymentIntents.update(
      { status },
      {
        where: { transaction_id },
        transaction: t,
      },
    );
  }
};
