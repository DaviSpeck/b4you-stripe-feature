const logger = require('../utils/logger');

const TIMEOUT_MS = 3000;

const resolveBackofficeFlagEndpoint = () => {
  const explicit = process.env.BACKOFFICE_FEATURE_FLAG_URL;
  if (explicit) return explicit;

  const base = process.env.BACKOFFICE_BASE_URL;
  if (!base) return null;

  return `${base.replace(/\/$/, '')}/feature-flags/stripe`;
};

const parseEnvFlag = () => {
  const raw = process.env.STRIPE_INTERNATIONAL_ENABLED;

  if (raw === 'true') return true;
  if (raw === 'false') return false;

  return null;
};

const readBackofficeFlag = async () => {
  const endpoint = resolveBackofficeFlagEndpoint();

  if (!endpoint) {
    return {
      enabled: false,
      source: 'fail-safe',
      reason: 'backoffice_unavailable',
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {
        enabled: false,
        source: 'fail-safe',
        reason: 'backoffice_unavailable',
      };
    }

    const data = await response.json();

    if (typeof data?.enabled !== 'boolean') {
      return {
        enabled: false,
        source: 'fail-safe',
        reason: 'flag_inconsistent',
      };
    }

    return {
      enabled: data.enabled,
      source: 'backoffice',
      reason: data.enabled ? null : 'stripe_international_disabled',
    };
  } catch (error) {
    return {
      enabled: false,
      source: 'fail-safe',
      reason: 'backoffice_unavailable',
    };
  } finally {
    clearTimeout(timeout);
  }
};

module.exports = async (req, res, next) => {
  const { transaction_id, order_id, sale_id } = req.body || {};

  const envEnabled = parseEnvFlag();
  const backofficeFlag = await readBackofficeFlag();

  const isInconsistent =
    backofficeFlag.source === 'backoffice' &&
    envEnabled !== null &&
    envEnabled !== backofficeFlag.enabled;

  const shouldBlock = !backofficeFlag.enabled || isInconsistent;

  if (shouldBlock) {
    const reason = isInconsistent
      ? 'flag_inconsistent'
      : backofficeFlag.reason || 'stripe_international_disabled';

    logger.info(
      JSON.stringify({
        message: 'stripe_international_blocked',
        transaction_id,
        order_id,
        sale_id,
        provider: 'stripe',
        source: backofficeFlag.source,
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
