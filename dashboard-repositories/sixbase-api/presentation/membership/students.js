const { capitalizeName } = require('../../utils/formatters');

const serializeSingleStudent = (user) => {
  const {
    id,
    password,
    credit_card,
    address,
    document_number,
    document_type,
    whatsapp,
    blocked,
    classroom_ids,
    unlimited,
    membership,
    ...rest
  } = user;

  const { full_name } = rest;
  return {
    ...rest,
    full_name: capitalizeName(full_name),
    first_name: capitalizeName(full_name.split(' ')[0]),
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleStudent);
    }
    return serializeSingleStudent(this.data);
  }
};
