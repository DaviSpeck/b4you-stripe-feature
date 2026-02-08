const { findRoleType } = require('../../types/roles');
const { findPaymentMethods } = require('../../types/paymentMethods');
const { findCommissionsStatus } = require('../../status/commissionsStatus');

const serializeTransactions = (transactions) => {
  const data = transactions.map(
    ({ id_status, release_date, amount, user, id_role }) => ({
      status: findCommissionsStatus(id_status),
      released: id_status === 3,
      user_net_amount: amount,
      release_date,
      role: findRoleType(id_role).label,
      user: {
        uuid: user.uuid,
        full_name: user.full_name,
        email: user.email,
      },
    }),
  );
  return data;
};

const serializeSingleSaleitem = (sale_item) => {
  const {
    price_product,
    valid_refund_until,
    commissions,
    payment_method,
    student,
    uuid,
    charges,
    coupon_sale,
  } = sale_item;

  return {
    uuid,
    price: price_product,
    valid_refund_until,
    student,
    payment_method: findPaymentMethods(payment_method),
    installments: charges[0].installments,
    transactions: serializeTransactions(commissions),
    charge: charges[0],
    coupon: coupon_sale
      ? {
          percentage: coupon_sale.percentage,
          label: coupon_sale.coupon.coupon,
        }
      : null,
  };
};

module.exports = class SerializeSales {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleSaleitem);
    }
    return serializeSingleSaleitem(this.data);
  }
};
