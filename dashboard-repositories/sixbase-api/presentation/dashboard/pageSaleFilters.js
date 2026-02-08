const { capitalizeName } = require('../../utils/formatters');

const resolveProductions = (productions) =>
  productions.map(({ id, uuid, name }) => ({
    id,
    uuid,
    name: capitalizeName(name),
  }));

const resolveCoproducerAndAffiliate = (coproductions) =>
  coproductions.map(({ product: { id, uuid, name } }) => ({
    id,
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
  affiliates,
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
  affiliates: affiliates
    ? affiliates.map((a) => ({
        uuid: a.id_user,
        full_name: capitalizeName(a.user.full_name.trim().replace('  ', ' ')),
        email: a.user.email,
      }))
    : null,
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
