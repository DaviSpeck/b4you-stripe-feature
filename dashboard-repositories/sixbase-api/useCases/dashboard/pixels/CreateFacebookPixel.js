const { createPixel } = require('../../../database/controllers/pixels');
const { findPixelType } = require('../../../types/pixelsTypes');

module.exports = class {
  constructor({
    id_user,
    id_product,
    label,
    pixel_id,
    id_role,
    generated_pix,
    paid_pix,
    token,
    domain,
  }) {
    this.id_user = id_user;
    this.id_product = id_product;
    this.label = label;
    this.pixel_id = pixel_id;
    this.id_role = id_role;
    this.paid_pix = paid_pix;
    this.generated_pix = generated_pix;
    this.token = token;
    this.domain = domain;
  }

  async execute() {
    const createdPixel = await createPixel({
      id_user: this.id_user,
      id_product: this.id_product,
      id_role: this.id_role,
      id_type: findPixelType('Facebook').id,
      settings: {
        label: this.label,
        pixel_id: this.pixel_id,
        generated_pix: this.generated_pix,
        paid_pix: this.paid_pix,
        token: this.token,
        domain: this.domain,
      },
    });
    return createdPixel;
  }
};
