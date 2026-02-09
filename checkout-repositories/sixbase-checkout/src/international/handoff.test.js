import {
  buildInternationalRedirectUrl,
  getInternationalHandoffDecision,
  isInternationalEnabled,
  isInternationalProduct,
} from './handoff';

describe('international handoff helpers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('detects international product from explicit flag', () => {
    expect(isInternationalProduct({ internacional: true })).toBe(true);
    expect(isInternationalProduct({ product: { internacional: true } })).toBe(
      true
    );
    expect(isInternationalProduct({})).toBe(false);
  });

  it('requires enabled feature flag to allow international', () => {
    expect(isInternationalEnabled({ feature_state: 'enabled' })).toBe(true);
    expect(isInternationalEnabled({ feature_state: 'disabled' })).toBe(false);
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
      offer: { internacional: true, feature_state: 'disabled' },
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
      offer: { internacional: true, feature_state: 'enabled' },
      offerId: 'offer-123',
      search: '?utm_source=unit',
    });

    expect(decision.action).toBe('redirect');
    expect(decision.redirectUrl).toBe(
      'https://checkout-international.test/international/offer-123?utm_source=unit'
    );
  });
});
