const ApiError = require('../../../error/ApiError');
const dateHelper = require('../../../utils/helpers/date');
const {
  findProductOffer,
} = require('../../../database/controllers/product_offer');
const Cache = require('../../../config/Cache');
const logger = require('../../../utils/logger');

const isBeforeOpening = (startDate) =>
  startDate && dateHelper().isBefore(dateHelper(startDate).now());

const isAfterClosing = (endDate) =>
  endDate && dateHelper().isAfter(dateHelper(endDate).now());

module.exports = class FindOffer {
  constructor(offer_id) {
    this.offer_id = offer_id;
  }

  async execute() {
    const key = `offer_checkout_${this.offer_id}`;
    let offer = null;

    const cachedOffer = await Cache.get(key);
    if (cachedOffer) {
      offer = JSON.parse(cachedOffer);
    }

    if (!offer) {
      offer = await findProductOffer({
        uuid: this.offer_id,
        active: true,
      });

      logger.info(`\n\nOFFER -> ${JSON.stringify(offer)}\n\n`);

      if (!offer) {
        throw ApiError.badRequest('Oferta não encontrada');
      }

      await Cache.set(key, JSON.stringify(offer));
    }

    const { start_offer, end_offer, offer_product, plans } = offer;

    if (isBeforeOpening(start_offer)) {
      throw ApiError.badRequest('Carrinho Fechado');
    }

    if (isAfterClosing(end_offer)) {
      throw ApiError.badRequest('Carrinho Fechado');
    }

    if (
      offer_product.payment_type === 'subscription' &&
      plans.length === 0
    ) {
      throw ApiError.badRequest('Oferta sem planos');
    }

    const productUpsellActive = Boolean(
      offer_product?.is_upsell_active
    );
    const offerUpsellNative = Boolean(
      offer?.is_upsell_native
    );

    return {
      ...offer,
      is_upsell_native: offerUpsellNative,
      offer_product: {
        ...offer_product,
        is_upsell_active: productUpsellActive,
      },
      has_upsell_native: productUpsellActive || offerUpsellNative,
    };
  }
};