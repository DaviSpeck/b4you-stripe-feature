const { findAllPlans } = require('../../../database/controllers/product_plans');
const {
  findOfferWithPlans,
} = require('../../../database/controllers/product_offer');
const ApiError = require('../../../error/ApiError');

module.exports = class {
  constructor(offer_id, id_product) {
    this.offer_id = offer_id;
    this.id_product = id_product;
  }

  async execute() {
    const offer = await findOfferWithPlans({
      id_product: this.id_product,
      uuid: this.offer_id,
    });
    if (!offer) throw ApiError.badRequest('Oferta não encontrada');
    const plansIds = offer.plans.map(({ id }) => id);
    const allPlans = await findAllPlans({ id_product: this.id_product });
    return allPlans.filter(({ id }) => !plansIds.includes(id));
  }
};
