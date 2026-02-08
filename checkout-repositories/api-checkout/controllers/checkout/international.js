const CreateStripePaymentIntent = require('../../useCases/checkout/international/CreateStripePaymentIntent');
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
};
