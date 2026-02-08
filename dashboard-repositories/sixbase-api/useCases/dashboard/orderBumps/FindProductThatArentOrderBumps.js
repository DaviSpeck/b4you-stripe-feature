const { Op } = require('sequelize');
const { findProducts } = require('../../../database/controllers/products');
const {
  findOfferWithOrderBumps,
} = require('../../../database/controllers/product_offer');
const ApiError = require('../../../error/ApiError');

module.exports = class {
  constructor(offer_id, id_product, id_user) {
    this.offer_id = offer_id;
    this.id_product = id_product;
    this.id_user = id_user;
  }

  async execute() {
    const offer = await findOfferWithOrderBumps({
      uuid: this.offer_id,
      id_product: this.id_product,
    });
    if (!offer) throw ApiError.badRequest('Oferta não encontrada');
    const products = await findProducts({
      id_user: this.id_user,
      payment_type: 'single',
      id: {
        [Op.ne]: this.id_product,
      },
    });
    const orderBumpsIds = offer.order_bumps.map(({ id_product }) => id_product);
    return products.filter(({ id }) => !orderBumpsIds.includes(id));
  }
};
