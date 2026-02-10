const FeatureFlagsRepository = require('../../repositories/sequelize/FeatureFlagsRepository');

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  return null;
};

const normalizeFromStatus = (status) => {
  if (typeof status !== 'string') return null;

  const normalized = status.trim().toLowerCase();

  if (normalized === 'enabled') return true;
  if (normalized === 'disabled' || normalized === 'suspended') return false;

  return null;
};

module.exports = async function readStripeFeatureFlag() {
  try {
    const record = await FeatureFlagsRepository.findStripeFlagRecord();

    if (!record) {
      return {
        enabled: false,
        source: 'fail-safe',
        reason: 'backoffice_unavailable',
      };
    }

    const enabled = normalizeBoolean(record.enabled);
    const statusEnabled = normalizeFromStatus(record.status);

    if (enabled !== null && statusEnabled !== null && enabled !== statusEnabled) {
      return {
        enabled: false,
        source: 'fail-safe',
        reason: 'flag_inconsistent',
      };
    }

    const resolved = enabled ?? statusEnabled;

    if (resolved === null) {
      return {
        enabled: false,
        source: 'fail-safe',
        reason: 'flag_inconsistent',
      };
    }

    return {
      enabled: resolved,
      source: 'database',
      reason: resolved ? null : 'stripe_international_disabled',
    };
  } catch (error) {
    return {
      enabled: false,
      source: 'fail-safe',
      reason: 'backoffice_unavailable',
    };
  }
};
