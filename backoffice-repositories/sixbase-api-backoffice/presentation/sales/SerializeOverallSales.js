const { findStatus } = require('../../status/salesStatus');
const { capitalizeName } = require('../../utils/formatters');
const { findPaymentMethods } = require('../../types/paymentMethods');
const date = require('../../utils/helpers/date');
const { FRONTEND_DATE } = require('../../types/dateTypes');

const serializeSingleSale = ({
  student,
  product,
  created_at,
  uuid,
  id_status,
  price_total,
  payment_method,
  affiliate,
  paid_at,
}) => ({
  uuid,
  status: findStatus(id_status),
  student: {
    full_name: capitalizeName(student.full_name),
    email: student.email,
    uuid: student.uuid,
  },
  price: price_total,
  product,
  created_at,
  payment_method: findPaymentMethods(payment_method),
  affiliate: affiliate
    ? {
        full_name: capitalizeName(
          `${affiliate.user.first_name} ${affiliate.user.last_name}`,
        ),
        uuid: affiliate.user.uuid,
      }
    : null,

  paid_at: paid_at ? date(paid_at).format(FRONTEND_DATE) : ' - ',
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleSale);
    }
    return serializeSingleSale(this.data);
  }
};
