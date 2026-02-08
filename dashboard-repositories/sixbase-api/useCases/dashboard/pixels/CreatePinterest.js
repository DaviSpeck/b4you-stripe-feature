const { createPixel } = require('../../../database/controllers/pixels');
const { findPixelType } = require('../../../types/pixelsTypes');

module.exports = class {
  constructor({
    conversion_label,
    id_product,
    id_role,
    id_user,
    initiate_checkout,
    label,
    pixel_id,
  }) {
    this.conversion_label = conversion_label;
    this.id_product = id_product;
    this.id_role = id_role;
    this.id_user = id_user;
    this.initiate_checkout = initiate_checkout;
    this.label = label;
    this.pixel_id = pixel_id;
  }

  async execute() {
    const createdPixel = await createPixel({
      id_user: this.id_user,
      id_product: this.id_product,
      id_role: this.id_role,
      id_type: findPixelType('Pinterest').id,
      settings: {
        label: this.label,
        pixel_id: this.pixel_id,
      },
    });
    return createdPixel;
  }
};
