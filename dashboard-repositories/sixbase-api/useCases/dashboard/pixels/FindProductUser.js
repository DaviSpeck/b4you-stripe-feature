const { findAllPixel } = require('../../../database/controllers/pixels');

module.exports = class {
  constructor(id_product, id_user) {
    this.id_product = id_product;
    this.id_user = id_user;
  }

  async execute() {
    const pixels = await findAllPixel({
      id_user: this.id_user,
      id_product: this.id_product,
    });
    return pixels;
  }
};
