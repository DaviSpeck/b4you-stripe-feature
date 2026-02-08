const StripeService = require('../../../services/payment/Stripe');
const StripePaymentIntentsRepository = require('../../../repositories/sequelize/StripePaymentIntentsRepository');
const logger = require('../../../utils/logger');
const { incrementPaymentIntentsCreated } = require('../../../middlewares/prom');

module.exports = class CreateStripePaymentIntent {
  #stripeService;

  constructor() {
    this.#stripeService = new StripeService();
  }

  async execute({
    transaction_id,
    order_id,
    sale_id,
    amount,
    currency,
    payment_method_types,
  }) {
    const provider = 'stripe';
    const existing = await StripePaymentIntentsRepository.findByTransactionId(
      transaction_id,
    );

    if (existing) {
      const paymentIntent = await this.#stripeService.retrievePaymentIntent(
        existing.provider_payment_intent_id,
      );
      logger.info(
        JSON.stringify({
          message: 'stripe_payment_intent_reused',
          transaction_id,
          order_id,
          sale_id,
          provider,
          provider_payment_intent_id: existing.provider_payment_intent_id,
        }),
      );
      return {
        transaction_id,
        order_id,
        sale_id,
        provider,
        provider_payment_intent_id: existing.provider_payment_intent_id,
        client_secret: paymentIntent.client_secret,
        status: 'pending',
        idempotent: true,
      };
    }

    const metadata = {
      transaction_id,
      order_id,
      sale_id,
      provider,
    };

    const paymentIntent = await this.#stripeService.createPaymentIntent(
      {
        amount,
        currency,
        metadata,
        payment_method_types,
      },
      transaction_id,
    );

    await StripePaymentIntentsRepository.create({
      transaction_id,
      order_id,
      sale_id,
      provider,
      provider_payment_intent_id: paymentIntent.id,
      amount,
      currency,
      status: 'pending',
    });

    incrementPaymentIntentsCreated(provider);

    logger.info(
      JSON.stringify({
        message: 'stripe_payment_intent_created',
        transaction_id,
        order_id,
        sale_id,
        provider,
        provider_payment_intent_id: paymentIntent.id,
      }),
    );

    return {
      transaction_id,
      order_id,
      sale_id,
      provider,
      provider_payment_intent_id: paymentIntent.id,
      client_secret: paymentIntent.client_secret,
      status: 'pending',
      idempotent: false,
    };
  }
};
