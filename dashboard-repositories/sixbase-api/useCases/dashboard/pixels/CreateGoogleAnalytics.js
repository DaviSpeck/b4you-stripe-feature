const { createPixel } = require('../../../database/controllers/pixels');
const { findPixelType } = require('../../../types/pixelsTypes');

module.exports = class {
  constructor({ id_user, id_product, label, pixel_id, id_role }) {
    this.id_user = id_user;
    this.id_product = id_product;
    this.label = label;
    this.pixel_id = pixel_id;
    this.id_role = id_role;
  }

  async execute() {
    const createdPixel = await createPixel({
      id_user: this.id_user,
      id_product: this.id_product,
      id_role: this.id_role,
      id_type: findPixelType('Google Analytics').id,
      settings: {
        label: this.label,
        pixel_id: this.pixel_id,
      },
    });
    return createdPixel;
  }
};
