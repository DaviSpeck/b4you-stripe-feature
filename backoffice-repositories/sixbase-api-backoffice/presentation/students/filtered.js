const { capitalizeName } = require('../../utils/formatters');

const serializeStudent = ({
  full_name,
  email,
  uuid,
  document_number,
  whatsapp,
}) => ({
  uuid,
  full_name: capitalizeName(full_name),
  email,
  document_number,
  whatsapp,
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeStudent);
    }
    return serializeStudent(this.data);
  }
};
