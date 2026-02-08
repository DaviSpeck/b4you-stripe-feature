const ApiError = require('../../../error/ApiError');
const {
  findOnePixel,
  updatePixel,
} = require('../../../database/controllers/pixels');

module.exports = class {
  constructor({ id_user, id_product, data, uuid }) {
    this.id_user = id_user;
    this.id_product = id_product;
    this.data = data;
    this.uuid = uuid;
  }

  async execute() {
    const pixel = await findOnePixel({
      id_user: this.id_user,
      id_product: this.id_product,
      uuid: this.uuid,
    });
    if (!pixel) throw ApiError.badRequest('Pixel not found');
    const keys = Object.keys(this.data);
    if (keys.length === 0) throw ApiError.badRequest('Empty body');
    await updatePixel(
      { id: pixel.id },
      {
        settings: {
          ...pixel.settings,
          ...this.data,
        },
      },
    );
  }
};
