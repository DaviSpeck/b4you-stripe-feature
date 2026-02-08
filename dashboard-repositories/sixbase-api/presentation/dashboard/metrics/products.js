const serializeProducts = ({ productions, coproductions, affiliations }) => {
  const rawProductions = productions.map((item) => ({
    name: item.name,
    uuid: item.uuid,
    type: 'Productions',
  }));
  const rawCoproductions = coproductions.map((item) => ({
    name: item.product.name,
    uuid: item.product.uuid,
    type: 'Coproductions',
  }));
  const rawAffiliations = affiliations.map((item) => ({
    name: item.product.name,
    uuid: item.product.uuid,
    type: 'Affiliations',
  }));

  return {
    product: [...rawAffiliations, ...rawCoproductions, ...rawProductions],
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeProducts(this.data);
  }
};
