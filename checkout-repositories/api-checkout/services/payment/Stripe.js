const Stripe = require('stripe');

module.exports = class StripeService {
  #client;

  constructor() {
    this.#client = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent({ amount, currency, metadata, payment_method_types }, idempotencyKey) {
    return this.#client.paymentIntents.create(
      {
        amount,
        currency,
        metadata,
        payment_method_types,
      },
      {
        idempotencyKey,
      },
    );
  }

  async retrievePaymentIntent(paymentIntentId) {
    return this.#client.paymentIntents.retrieve(paymentIntentId);
  }

  constructEvent(rawBody, signature, webhookSecret) {
    return this.#client.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }
};
