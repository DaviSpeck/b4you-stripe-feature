const CreateStripePaymentIntent = require('../../useCases/checkout/international/CreateStripePaymentIntent');
const HandleStripeWebhook = require('../../useCases/checkout/international/HandleStripeWebhook');
const logger = require('../../utils/logger');

const createStripePaymentIntentController = async (req, res) => {
  const { transaction_id, order_id, sale_id } = req.body || {};

  try {
    const result = await new CreateStripePaymentIntent().execute(req.body);
    const statusCode = result.idempotent ? 200 : 201;
    return res.status(statusCode).send(result);
  } catch (error) {
    logger.error(
      JSON.stringify({
        message: 'stripe_payment_intent_failed',
        transaction_id,
        order_id,
        sale_id,
        provider: 'stripe',
        error: error?.message,
      }),
    );
    return res.status(500).send({
      message: 'Erro ao criar pagamento internacional',
    });
  }
};

module.exports = {
  createStripePaymentIntentController,
  stripeWebhookController: async (req, res) => {
    try {
      const result = await new HandleStripeWebhook().execute({
        rawBody: req.rawBody,
        signature: req.headers['stripe-signature'],
      });
      if (!result.ok) {
        return res.sendStatus(result.status || 400);
      }
      return res.sendStatus(204);
    } catch (error) {
      logger.error(
        JSON.stringify({
          message: 'stripe_webhook_failed',
          error: error?.message,
        }),
      );
      return res.sendStatus(500);
    }
  },
};
