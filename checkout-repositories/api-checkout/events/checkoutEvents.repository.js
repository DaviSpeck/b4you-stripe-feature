const CheckoutEvent = require('../database/models/Checkout_events');
const ProductOffer = require('../database/models/Product_offer');
const Products = require('../database/models/Products');
const logger = require('../utils/logger');

const OFFER_CACHE_TTL_MS = 5 * 60 * 1000;
const offerIdentityCache = new Map();

const create = async (payload) => {
  try {
    await CheckoutEvent.create(payload);
  } catch (error) {
    logger.error(
      JSON.stringify({
        type: 'CHECKOUT_EVENT_PERSIST_ERROR',
        error: error?.message || error,
        eventId: payload?.event_id,
      }),
    );
  }
};

const resolveOfferIdentity = async (offerId) => {
  const cacheEntry = offerIdentityCache.get(offerId);
  if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
    return cacheEntry.value;
  }

  const offer = await ProductOffer.findOne({
    where: { uuid: offerId },
    attributes: ['id_product'],
    raw: true,
  });

  if (!offer?.id_product) {
    return null;
  }

  const product = await Products.findOne({
    where: { id: offer.id_product },
    attributes: ['id_user'],
    raw: true,
  });

  if (!product?.id_user) {
    return null;
  }

  const value = {
    productId: String(offer.id_product),
    producerId: String(product.id_user),
  };

  offerIdentityCache.set(offerId, {
    value,
    expiresAt: Date.now() + OFFER_CACHE_TTL_MS,
  });

  return value;
};

module.exports = {
  create,
  resolveOfferIdentity,
};
