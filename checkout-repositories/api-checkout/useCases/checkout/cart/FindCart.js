const ApiError = require('../../../error/ApiError');
const {
  findOneCart,
} = require('../../../database/controllers/cart');

module.exports = class FindCart {
  constructor(cart_id) {
    this.cart_id = cart_id;
  }

  async execute() {
      const cart = await findOneCart({
        where: { uuid: this.cart_id }
      });

      if (!cart) throw ApiError.badRequest('Carrinho não encontrada');

    return cart;
  }
};
