const { findRefundStatusByKey } = require('../../status/refundStatus');

const serializeSingleTransaction = ({
  charge: { paid_at },
  sales_items,
  price_total,
  user,
}) => {
  const [saleItem] = sales_items;
  const {
    product: { name, cover, support_email, support_whatsapp },
    refund,
    uuid,
    valid_refund_until,
  } = saleItem;

  return {
    uuid,
    price: price_total,
    paid_at,
    valid_refund_until,
    producer: `${user.first_name} ${user.last_name}`,
    product: {
      name,
      cover,
      email: support_email,
      phone: support_whatsapp,
    },
    refund: {
      uuid: refund ? { uuid: refund.uuid } : null,
      active:
        refund &&
        refund.id_status === findRefundStatusByKey('requested-by-student').id,
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
      return this.data.map(serializeSingleTransaction);
    }
    return serializeSingleTransaction(this.data);
  }
};
