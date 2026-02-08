const ApiError = require('../../../error/ApiError');
const dateHelper = require('../../../utils/helpers/date');
const {
  findProductOfferForCart,
} = require('../../../database/controllers/product_offer');
const Cache = require('../../../config/Cache');

const isBeforeOpening = (startDate) =>
  startDate && dateHelper().isBefore(dateHelper(startDate).now());

const isAfterClosing = (endDate) =>
  endDate && dateHelper().isAfter(dateHelper(endDate).now());

module.exports = class FindOfferCart {
  constructor(offer_id) {
    this.offer_id = offer_id;
  }

  async execute() {
    const key = `offer_${this.offer_id}`;
    let offer = null;
    const cachedOffer = await Cache.get(key);
    if (cachedOffer) {
      offer = JSON.parse(cachedOffer);
    }

    if (!offer) {
      offer = await findProductOfferForCart({
        uuid: this.offer_id,
        active: true,
        hide: false,
      });
      if (!offer) throw ApiError.badRequest('Oferta não encontrada');
      await Cache.set(key, JSON.stringify(offer));
    }

    const { start_offer, end_offer, offer_product, plans } = offer;
    if (isBeforeOpening(start_offer))
      throw ApiError.badRequest('Carrinho Fechado');
    if (isAfterClosing(end_offer))
      throw ApiError.badRequest('Carrinho Fechado');
    if (offer_product.payment_type === 'subscription' && plans.length === 0)
      throw ApiError.badRequest('Oferta sem planos');
    return offer;
  }
};
