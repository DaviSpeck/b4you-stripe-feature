const serializeOffers = (offers) => {
  if (!Array.isArray(offers) || offers.length === 0)
    return {
      min_price: 0,
      max_price: 0,
    };

  const orderedOffers = offers.sort((a, b) => a.price - b.price);
  return {
    min_price: orderedOffers[0].price,
    max_price: orderedOffers[orderedOffers.length - 1].price,
  };
};

const serializeSingleProduct = (product) => {
  const { uuid, name, product_offer, allow_affiliate } = product;
  return {
    uuid,
    name,
    allow_affiliate,
    offers: serializeOffers(product_offer),
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleProduct);
    }
    return serializeSingleProduct(this.data);
  }
};
