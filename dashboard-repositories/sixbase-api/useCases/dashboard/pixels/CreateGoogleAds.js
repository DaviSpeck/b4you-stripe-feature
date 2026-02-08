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
    purchase,
    trigger_boleto,
    trigger_pix,
  }) {
    this.conversion_label = conversion_label;
    this.id_product = id_product;
    this.id_role = id_role;
    this.id_user = id_user;
    this.initiate_checkout = initiate_checkout;
    this.label = label;
    this.pixel_id = pixel_id;
    this.purchase = purchase;
    this.trigger_boleto = trigger_boleto;
    this.trigger_pix = trigger_pix;
  }

  async execute() {
    const createdPixel = await createPixel({
      id_user: this.id_user,
      id_product: this.id_product,
      id_role: this.id_role,
      id_type: findPixelType('Google Ads').id,
      settings: {
        label: this.label,
        pixel_id: this.pixel_id,
        purchase: this.purchase,
        initiate_checkout: this.initiate_checkout,
        trigger_pix: this.trigger_pix,
        trigger_boleto: this.trigger_boleto,
      },
    });
    return createdPixel;
  }
};
