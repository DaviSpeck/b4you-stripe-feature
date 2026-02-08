const { findCoproductionStatus } = require('../../status/coproductionsStatus');
const DateHelper = require('../../utils/helpers/date');
const { capitalizeName } = require('../../utils/formatters');

const serializeUser = (user) => {
  const { uuid, email, first_name, last_name } = user;
  return {
    uuid,
    full_name: capitalizeName(`${first_name} ${last_name}`),
    email,
  };
};
const serializeCoproductions = (coproductions) => {
  const {
    uuid: uuid_coproduction,
    accepted_at,
    commission_percentage,
    created_at,
    expires_at,
    rejected_at,
    status,
    user,
    split_invoice,
    allow_access,
  } = coproductions;

  return {
    uuid: uuid_coproduction,
    status: findCoproductionStatus(status),
    commission_percentage,
    split_invoice,
    created_at,
    expires_at: DateHelper(expires_at).isValid() ? expires_at : 'Vitalício',
    accepted_at: DateHelper(accepted_at).isValid() ? accepted_at : '',
    rejected_at: DateHelper(rejected_at).isValid() ? rejected_at : '',
    user: serializeUser(user),
    allow_access,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeCoproductions);
    }
    return serializeCoproductions(this.data);
  }
};
