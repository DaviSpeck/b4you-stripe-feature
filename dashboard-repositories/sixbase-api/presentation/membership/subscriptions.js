const { findSubscriptionStatus } = require('../../status/subscriptionsStatus');
const { capitalizeName } = require('../../utils/formatters');

const serializeSingleSubscription = (subscription) => {
  const {
    uuid,
    next_charge,
    id_status,
    active,
    product: { name, logo, nickname, cover, cover_key },
    payment_frequency,
    plan,
    payment_method,
  } = subscription;
  return {
    uuid,
    author: capitalizeName(nickname),
    next_charge,
    price: plan.price,
    active,
    status: findSubscriptionStatus(id_status),
    frequency: payment_frequency,
    payment_method,
    product: {
      name,
      logo,
      cover: {
        cover,
        cover_key,
      },
    },
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleSubscription);
    }
    return serializeSingleSubscription(this.data);
  }
};
