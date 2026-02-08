const { capitalizeName } = require('../../utils/formatters');
const { findBank } = require('../../utils/banks');

const serializeStudentProfile = (student) => {
  const {
    biography,
    full_name,
    whatsapp,
    email,
    document_number,
    bank_code,
    account_agency,
    account_number,
  } = student;

  let bank = {
    bank_code,
    account_agency,
    account_number,
  };

  if (bank_code) {
    bank = {
      ...bank,
      ...findBank(bank_code),
    };
  }

  return {
    full_name: capitalizeName(full_name),
    biography,
    whatsapp,
    phone: whatsapp,
    email,
    cpf: document_number,
    bank,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeStudentProfile(this.data);
  }
};
