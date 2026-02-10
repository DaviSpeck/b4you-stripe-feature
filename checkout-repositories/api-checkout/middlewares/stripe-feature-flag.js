const logger = require('../utils/logger');
const readStripeFeatureFlag = require('../services/feature-flags/read-stripe-feature-flag');

const parseEnvFlag = () => {
  const raw = process.env.STRIPE_INTERNATIONAL_ENABLED;

  if (raw === 'true') return true;
  if (raw === 'false') return false;

  return null;
};

module.exports = async (req, res, next) => {
  const { transaction_id, order_id, sale_id } = req.body || {};

  const envEnabled = parseEnvFlag();
  const sourceFlag = await readStripeFeatureFlag();

  const isInconsistent =
    sourceFlag.source === 'database' &&
    envEnabled !== null &&
    envEnabled !== sourceFlag.enabled;

  const shouldBlock = !sourceFlag.enabled || isInconsistent;

  if (shouldBlock) {
    const reason = isInconsistent
      ? 'flag_inconsistent'
      : sourceFlag.reason || 'stripe_international_disabled';

    logger.info(
      JSON.stringify({
        message: 'stripe_international_blocked',
        transaction_id,
        order_id,
        sale_id,
        provider: 'stripe',
        source: sourceFlag.source,
        reason,
      }),
    );

    return res.status(403).send({
      message: 'Stripe internacional indisponível',
      reason,
    });
  }

  return next();
};
