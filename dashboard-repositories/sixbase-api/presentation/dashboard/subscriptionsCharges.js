const { findChargeStatus } = require('../../status/chargeStatus');

const serializeChargesSubscription = (charges) => {
  const {
    uuid,
    uuid_sale_item,
    price,
    paid_at,
    id_status,
    created_at,
    billet_url,
    pix_code,
    payment_method,
  } = charges;
  return {
    uuid,
    price,
    paid_at,
    created_at,
    billet_url,
    pix_code,
    payment_method,
    status: findChargeStatus(id_status),
    checkout_url: `${process.env.URL_SIXBASE_CHECKOUT}/sales/pix/info/${uuid_sale_item}`,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeChargesSubscription);
    }
    return serializeChargesSubscription(this.data);
  }
};
