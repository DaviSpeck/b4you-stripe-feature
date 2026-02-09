const DEFAULT_FLAG_STATE = 'enabled';

const toLower = (value) =>
  typeof value === 'string' ? value.trim().toLowerCase() : null;

export const getInternationalFlagState = (offer = {}) => {
  const rawState =
    offer?.feature_state ??
    offer?.featureState ??
    offer?.stripe_feature_state ??
    offer?.stripeFeatureState ??
    offer?.feature?.state ??
    offer?.feature?.stripe;

  return toLower(rawState);
};

export const isInternationalProduct = (offer = {}) =>
  Boolean(
    offer?.internacional ??
      offer?.international ??
      offer?.product?.internacional ??
      offer?.product?.international
  );

export const isInternationalEnabled = (offer = {}) =>
  getInternationalFlagState(offer) === DEFAULT_FLAG_STATE;

export const getInternationalCheckoutBaseUrl = (offer = {}) => {
  const envUrl =
    typeof process === 'undefined'
      ? ''
      : process.env.REACT_APP_INTERNATIONAL_CHECKOUT_URL;

  return (
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
  if (!isInternationalProduct(offer)) {
    return { action: 'continue' };
  }

  if (!isInternationalEnabled(offer)) {
    return {
      action: 'error',
      reason: 'flag_disabled',
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
