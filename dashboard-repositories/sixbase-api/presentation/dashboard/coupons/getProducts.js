const date = require('../../../utils/helpers/date');

const SerializeProductCoupons = (data) => {
  const {
    uuid,
    active,
    coupon,
    percentage,
    expires_at,
    created_at,
    updated_at,
    deleted_at,
  } = data.toJSON();
  return {
    uuid,
    active: active && date(expires_at).diff(date()) < 0 ? false : active,
    coupon,
    percentage,
    expires_at,
    created_at,
    updated_at,
    deleted_at,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(SerializeProductCoupons);
    }
    return SerializeProductCoupons(this.data);
  }
};
