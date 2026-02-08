const { findAffiliateStatus } = require('../../status/affiliateStatus');
const { capitalizeName } = require('../../utils/formatters');

const resolveProducts = (products) =>
  products.map(({ uuid, name }) => ({
    uuid,
    name: capitalizeName(name),
  }));

const serializeAffiliate = ({ products, affiliateStatus }) => ({
  products: resolveProducts(products),
  affiliateStatus: affiliateStatus.filter(
    (status) =>
      status.id === findAffiliateStatus('Ativo').id ||
      status.id === findAffiliateStatus('Bloqueado').id,
  ),
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeAffiliate);
    }
    return serializeAffiliate(this.data);
  }
};
