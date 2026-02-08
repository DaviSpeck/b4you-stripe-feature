const { capitalizeName } = require('../../utils/formatters');

const serializeUserToken = (token) => {
  const {
    user: { first_name, last_name },
  } = token;

  return capitalizeName(`${first_name} ${last_name}`);
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeUserToken(this.data);
  }
};
