const DEFAULT_FLAG_STATE = 'enabled';
const DEFAULT_PROVIDER = 'stripe';

const toLower = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : null;

const warnDeprecation = (message) => {
  if (typeof console !== 'undefined' && console.warn) {
    console.warn(message);
  }
};

const resolveLegacyInternationalContract = (offer = {}) => {
  const isInternational = Boolean(
    offer?.international ??
      offer?.internacional ??
      offer?.product?.international ??
      offer?.product?.internacional
  );

  const rawFlagState =
    offer?.feature_state ??
    offer?.featureState ??
    offer?.stripe_feature_state ??
    offer?.stripeFeatureState ??
    offer?.feature?.state ??
    offer?.feature?.stripe;

  const featureEnabled = toLower(rawFlagState) === DEFAULT_FLAG_STATE;

  return {
    source: 'legacy',
    isInternational,
    featureEnabled,
    provider: offer?.provider ?? DEFAULT_PROVIDER,
  };
};

export const getInternationalContract = (offer = {}) => {
  const canonical = offer?.international_checkout ?? offer?.international;

  if (canonical) {
    return {
      source: 'canonical',
      isInternational: Boolean(canonical?.is_international),
      featureEnabled: Boolean(canonical?.feature_enabled),
      provider: canonical?.provider ?? DEFAULT_PROVIDER,
      baseUrl: canonical?.checkout_url ?? canonical?.base_url,
    };
  }

  warnDeprecation(
    '[handoff] Using legacy international fields. Please migrate to international_checkout contract.'
  );

  return resolveLegacyInternationalContract(offer);
};

export const getInternationalCheckoutBaseUrl = (offer = {}) => {
  const envUrl =
    typeof process === 'undefined'
      ? ''
      : process.env.REACT_APP_INTERNATIONAL_CHECKOUT_URL;

  const contract = getInternationalContract(offer);

  return (
    contract?.baseUrl ??
    offer?.checkout?.international_url ??
    offer?.checkout?.international_checkout_url ??
    offer?.international_checkout_url ??
    offer?.international_url ??
    envUrl ??
    ''
  ).toString();
};

export const buildInternationalRedirectUrl = ({
  offer,
  offerId,
  search,
}) => {
  const baseUrl = getInternationalCheckoutBaseUrl(offer)?.trim();

  if (!baseUrl || !offerId) return null;

  const url = new URL(`/international/${offerId}`, baseUrl);
  const queryParams = new URLSearchParams(search || '');

  queryParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
};

export const getInternationalHandoffDecision = ({
  offer,
  offerId,
  search,
}) => {
  const contract = getInternationalContract(offer);

  if (!contract?.isInternational) {
    return { action: 'continue' };
  }

  if (!contract?.featureEnabled) {
    return {
      action: 'error',
      reason: 'flag_disabled',
      message: 'Fluxo internacional indisponível no momento.',
    };
  }

  if (contract?.provider && contract.provider !== DEFAULT_PROVIDER) {
    return {
      action: 'error',
      reason: 'provider_mismatch',
      message: 'Fluxo internacional indisponível no momento.',
    };
  }

  const redirectUrl = buildInternationalRedirectUrl({
    offer,
    offerId,
    search,
  });

  if (!redirectUrl) {
    return {
      action: 'error',
      reason: 'redirect_unavailable',
      message: 'Não foi possível redirecionar para o checkout internacional.',
    };
  }

  return { action: 'redirect', redirectUrl };
};
