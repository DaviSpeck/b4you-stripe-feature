import {
  buildInternationalRedirectUrl,
  getInternationalContract,
  getInternationalHandoffDecision,
} from './handoff';

describe('international handoff helpers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses canonical international contract when provided', () => {
    const contract = getInternationalContract({
      international_checkout: {
        is_international: true,
        feature_enabled: true,
        provider: 'stripe',
      },
    });

    expect(contract).toEqual({
      source: 'canonical',
      isInternational: true,
      featureEnabled: true,
      provider: 'stripe',
      baseUrl: undefined,
    });
  });

  it('falls back to legacy fields with deprecation warning', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const contract = getInternationalContract({
      internacional: true,
      feature_state: 'enabled',
    });

    expect(contract.isInternational).toBe(true);
    expect(contract.featureEnabled).toBe(true);
    expect(contract.provider).toBe('stripe');
    expect(contract.source).toBe('legacy');
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('builds redirect url preserving query params', () => {
    process.env.REACT_APP_INTERNATIONAL_CHECKOUT_URL =
      'https://checkout-international.test';

    const url = buildInternationalRedirectUrl({
      offer: {},
      offerId: 'offer-123',
      search: '?utm_source=unit&a=aff',
    });

    expect(url).toBe(
      'https://checkout-international.test/international/offer-123?utm_source=unit&a=aff'
    );
  });

  it('blocks when product is international and feature flag disabled', () => {
    const decision = getInternationalHandoffDecision({
      offer: {
        international_checkout: {
          is_international: true,
          feature_enabled: false,
          provider: 'stripe',
        },
      },
      offerId: 'offer-123',
      search: '?utm_source=unit',
    });

    expect(decision.action).toBe('error');
    expect(decision.reason).toBe('flag_disabled');
  });

  it('redirects when product is international and flag enabled', () => {
    process.env.REACT_APP_INTERNATIONAL_CHECKOUT_URL =
      'https://checkout-international.test';

    const decision = getInternationalHandoffDecision({
      offer: {
        international_checkout: {
          is_international: true,
          feature_enabled: true,
          provider: 'stripe',
        },
      },
      offerId: 'offer-123',
      search: '?utm_source=unit',
    });

    expect(decision.action).toBe('redirect');
    expect(decision.redirectUrl).toBe(
      'https://checkout-international.test/international/offer-123?utm_source=unit'
    );
  });
});
