const { capitalizeName } = require('../../utils/formatters');

const serializeStudentToken = (token) => {
  const {
    student: { full_name },
  } = token;

  return capitalizeName(full_name);
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeStudentToken(this.data);
  }
};
