const { capitalizeName } = require('../../utils/formatters');

const resolveProductions = (productions) =>
  productions.map(({ uuid, name }) => ({
    uuid,
    name: capitalizeName(name),
  }));

const resolveCoproducerAndAffiliate = (coproductions) =>
  coproductions.map(({ product: { uuid, name } }) => ({
    uuid,
    name: capitalizeName(name),
  }));

const allProducts = (productions, coproductions, affiliations) => [
  ...resolveProductions(productions),
  ...resolveCoproducerAndAffiliate(affiliations),
  ...resolveCoproducerAndAffiliate(coproductions),
];
const serializeSaleFilters = ({
  productions,
  coproductions,
  affiliations,
  paymentMethods,
  salesStatus,
  rolesTypes,
}) => ({
  products: {
    all: allProducts(productions, coproductions, affiliations),
    producer: resolveProductions(productions),
    coproducer: resolveCoproducerAndAffiliate(coproductions),
    affiliate: resolveCoproducerAndAffiliate(affiliations),
  },
  paymentMethods,
  salesStatus,
  rolesTypes,
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSaleFilters);
    }
    return serializeSaleFilters(this.data);
  }
};
