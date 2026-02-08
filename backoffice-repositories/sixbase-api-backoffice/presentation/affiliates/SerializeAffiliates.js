const { findAffiliateStatus } = require('../../status/affiliateStatus');
const { capitalizeName } = require('../../utils/formatters');

const serializeAffiliates = ({
  uuid,
  user: { first_name, last_name, email },
  commission,
  subscription_fee,
  subscription_fee_commission,
  commission_all_charges,
  subscription_fee_only,
  status,
}) => {
  return {
    uuid,
    name: capitalizeName(`${first_name} ${last_name}`),
    email,
    commission,
    subscription_fee,
    subscription_fee_commission,
    commission_all_charges,
    subscription_fee_only,
    status: findAffiliateStatus(status),
  };
};

module.exports = class SerializeAffiliates {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeAffiliates);
    }
    return serializeAffiliates(this.data);
  }
};
