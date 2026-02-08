const serializeCard = (cart) => {
  const {
    email,
    full_name,
    document_number,
    whatsapp,
    id_affiliate,
    address,
    coupon,
} = cart;
  return {
    email,
    full_name,
    document_number,
    whatsapp,
    id_affiliate,
    address: address || {},
    coupon: coupon || null,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeCard);
    }
    return serializeCard(this.data);
  }
};
