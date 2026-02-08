const {
  findOnePixel,
  deletePixel,
} = require('../../../database/controllers/pixels');

const ApiError = require('../../../error/ApiError');

module.exports = class {
  constructor(uuid, id_product, id_user) {
    this.uuid = uuid;
    this.id_product = id_product;
    this.id_user = id_user;
  }

  async execute() {
    const pixel = await findOnePixel({
      uuid: this.uuid,
      id_product: this.id_product,
      id_user: this.id_user,
    });
    if (!pixel) throw ApiError.badRequest('Pixel not found');
    await deletePixel(pixel.id);
  }
};
