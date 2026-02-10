const readStripeFeatureFlag = require('../../services/feature-flags/read-stripe-feature-flag');
const FeatureFlagsRepository = require('../../repositories/sequelize/FeatureFlagsRepository');

jest.mock('../../repositories/sequelize/FeatureFlagsRepository', () => ({
  findStripeFlagRecord: jest.fn(),
}));

describe('readStripeFeatureFlag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns database enabled when enabled is boolean true', async () => {
    FeatureFlagsRepository.findStripeFlagRecord.mockResolvedValue({
      enabled: true,
      status: 'enabled',
    });

    const result = await readStripeFeatureFlag();

    expect(result).toEqual({ enabled: true, source: 'database', reason: null });
  });

  it('returns disabled with stripe reason when database status is disabled', async () => {
    FeatureFlagsRepository.findStripeFlagRecord.mockResolvedValue({
      enabled: false,
      status: 'disabled',
    });

    const result = await readStripeFeatureFlag();

    expect(result).toEqual({
      enabled: false,
      source: 'database',
      reason: 'stripe_international_disabled',
    });
  });

  it('returns fail-safe for inconsistent status/enabled', async () => {
    FeatureFlagsRepository.findStripeFlagRecord.mockResolvedValue({
      enabled: true,
      status: 'disabled',
    });

    const result = await readStripeFeatureFlag();

    expect(result).toEqual({
      enabled: false,
      source: 'fail-safe',
      reason: 'flag_inconsistent',
    });
  });

  it('returns fail-safe when record is missing', async () => {
    FeatureFlagsRepository.findStripeFlagRecord.mockResolvedValue(null);

    const result = await readStripeFeatureFlag();

    expect(result).toEqual({
      enabled: false,
      source: 'fail-safe',
      reason: 'backoffice_unavailable',
    });
  });

  it('returns fail-safe when repository throws', async () => {
    FeatureFlagsRepository.findStripeFlagRecord.mockRejectedValue(new Error('db unavailable'));

    const result = await readStripeFeatureFlag();

    expect(result).toEqual({
      enabled: false,
      source: 'fail-safe',
      reason: 'backoffice_unavailable',
    });
  });
});
