const { createPixel } = require('../../../database/controllers/pixels');
const { findPixelType } = require('../../../types/pixelsTypes');

module.exports = class {
  constructor({
    id_user,
    id_product,
    label,
    pixel_id,
    conversion_label,
    trigger_checkout,
    trigger_card,
    trigger_boleto,
    id_role,
  }) {
    this.id_user = id_user;
    this.id_product = id_product;
    this.label = label;
    this.pixel_id = pixel_id;
    this.conversion_label = conversion_label;
    this.trigger_checkout = trigger_checkout;
    this.trigger_card = trigger_card;
    this.trigger_boleto = trigger_boleto;
    this.id_role = id_role;
  }

  async execute() {
    const createdPixel = await createPixel({
      id_user: this.id_user,
      id_product: this.id_product,
      id_role: this.id_role,
      id_type: findPixelType('Outbrain').id,
      settings: {
        label: this.label,
        pixel_id: this.pixel_id,
        conversion_label: this.conversion_label,
        trigger_checkout: this.trigger_checkout,
        trigger_card: this.trigger_card,
        trigger_boleto: this.trigger_boleto,
      },
    });
    return createdPixel;
  }
};
