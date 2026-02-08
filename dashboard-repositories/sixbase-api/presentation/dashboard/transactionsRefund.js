const { findTransactionStatus } = require('../../status/transactionStatus');
const { findTransactionType } = require('../../types/transactionTypes');
const { capitalizeName } = require('../../utils/formatters');

const serializeUser = (user) => {
  if (!user) return null;
  const { full_name } = user;
  return {
    name: capitalizeName(full_name),
  };
};

const resolveAmount = (id_type, { user_net_amount, fee_total }) => {
  if (id_type === 3) return user_net_amount;
  if (id_type === 8) return fee_total;
  return user_net_amount;
};

const serializeSingleTransaction = ({
  uuid,
  created_at,
  id_status,
  id_type,
  user,
  role,
  released,
  ...rest
}) => ({
  uuid,
  status: findTransactionStatus(id_status),
  type: findTransactionType(id_type),
  amount: resolveAmount(id_type, rest),
  user: serializeUser(user),
  created_at,
  released,
  role,
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
