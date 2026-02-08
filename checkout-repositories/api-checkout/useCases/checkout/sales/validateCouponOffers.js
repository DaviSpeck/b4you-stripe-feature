const validateCouponOffers = (coupon, id_offer, cProductOffers = []) => {
  if (!coupon) {
    return { coupon: null, isAllowed: true };
  }

  const restrictOffers = Boolean(coupon.restrict_offers);

  if (!restrictOffers) {
    return { coupon, isAllowed: true };
  }

  if (!id_offer) {
    return {
      coupon,
      isAllowed: false,
      reason: 'INVALID_OFFER_ID',
    };
  }

  if (Array.isArray(cProductOffers) && cProductOffers.length > 0) {
    const allowedOffer = cProductOffers.find(
      (o) => o.id_offer === id_offer
    );

    return {
      coupon,
      isAllowed: Boolean(allowedOffer),
      reason: allowedOffer ? 'ALLOWED' : 'OFFER_NOT_ALLOWED',
    };
  }

  /**
   * Fallback para lista interna do cupom
   */
  if (!Array.isArray(coupon.offers)) {
    return {
      coupon,
      isAllowed: false,
      reason: 'INVALID_COUPON_OFFERS_LIST',
    };
  }

  const allowedOffer = coupon.offers.find(
    (o) => o.id === id_offer
  );

  return {
    coupon,
    isAllowed: Boolean(allowedOffer),
    reason: allowedOffer ? 'ALLOWED' : 'OFFER_NOT_ALLOWED',
  };
};

module.exports = {
  validateCouponOffers,
};