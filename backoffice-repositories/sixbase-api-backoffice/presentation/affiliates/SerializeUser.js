const { findAffiliateStatus } = require('../../status/affiliateStatus');

const serializeAffiliates = (affiliate) => {
  const { status, ...rest } = affiliate;

  return {
    ...rest,
    status: findAffiliateStatus(status),
  };
};

module.exports = class SerializeSales {
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
