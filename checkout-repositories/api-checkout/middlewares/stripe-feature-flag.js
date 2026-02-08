const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const enabled = process.env.STRIPE_INTERNATIONAL_ENABLED === 'true';

  if (!enabled) {
    const { transaction_id, order_id, sale_id } = req.body || {};
    logger.info(
      JSON.stringify({
        message: 'stripe_international_disabled',
        transaction_id,
        order_id,
        sale_id,
        provider: 'stripe',
      }),
    );
    return res.status(403).send({
      message: 'Stripe internacional desabilitado',
    });
  }

  return next();
};
