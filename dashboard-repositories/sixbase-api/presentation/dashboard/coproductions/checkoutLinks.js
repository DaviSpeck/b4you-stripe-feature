const serializeLinks = (offer) => {
  const { uuid, name, price } = offer;
  return {
    uuid,
    name,
    price: price || 0,
    url: `${process.env.URL_SIXBASE_CHECKOUT}/${uuid}`,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map((data) => serializeLinks(data));
    }
    return serializeLinks(this.data);
  }
};
