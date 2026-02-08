const { capitalizeName, formatPhone } = require(`../../utils/formatters`);

const SerializeCarts = ({ uuid, email, full_name, whatsapp, updated_at }) => ({
  uuid,
  full_name: capitalizeName(full_name),
  email,
  whatsapp: formatPhone(whatsapp),
  updated_at,
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(SerializeCarts);
    }
    return SerializeCarts(this.data);
  }
};
