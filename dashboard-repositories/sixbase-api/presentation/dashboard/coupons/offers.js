const { formatBRL } = require('../../../utils/formatters');

const SerializeOffers = ({ uuid, name, price }) => ({
  label: `${name} - ${formatBRL(price)}`,
  value: uuid,
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(SerializeOffers);
    }
    return SerializeOffers(this.data);
  }
};
