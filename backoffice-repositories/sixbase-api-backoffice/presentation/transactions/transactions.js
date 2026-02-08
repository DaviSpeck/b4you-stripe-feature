const { findStatus } = require('../../status/salesStatus');
const { capitalizeName } = require('../../utils/formatters');
const { findRoleType } = require('../../types/roles');
const { findPaymentMethods } = require('../../types/paymentMethods');

const serializeSingleTransaction = ({
  student,
  commissions,
  product,
  created_at,
  uuid,
  id_status,
  payment_method,
}) => ({
  uuid,
  status: findStatus(id_status),
  student: {
    full_name: capitalizeName(student.full_name),
    email: student.email,
  },
  amount: commissions[0].amount,
  product,
  created_at,
  role: findRoleType(commissions[0].id_role).label,
  id_user: commissions[0].id_user,
  payment_method: findPaymentMethods(payment_method).label,
});

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