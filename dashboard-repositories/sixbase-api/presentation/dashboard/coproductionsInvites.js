const { findCoproductionStatus } = require('../../status/coproductionsStatus');

const serializeProducer = (user) => {
  const { email, full_name } = user;
  return {
    full_name,
    email,
  };
};

const serializeProduct = (product) => {
  const { uuid, name } = product;
  return {
    uuid,
    name,
  };
};

const serializeCoproduction = (coproduction) => {
  const { expires_at, split_invoice, allow_access } = coproduction;
  if (!expires_at)
    return {
      split_invoice,
      expires_at: 'Vitalício',
      allow_access,
    };

  return {
    split_invoice,
    expires_at,
    allow_access,
  };
};

const serializeCoproductionsInvites = (coproductionsInvites) => {
  const {
    uuid: coproduction_uuid,
    commission_percentage,
    status,
    expires_at,
    created_at,
    users,
    product,
    coproduction,
  } = coproductionsInvites;

  return {
    uuid: coproduction_uuid,
    status: findCoproductionStatus(status),
    coproduction: serializeCoproduction(coproduction),
    producer: serializeProducer(users),
    product: serializeProduct(product),
    commission_percentage,
    expires_at,
    created_at,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeCoproductionsInvites);
    }
    return serializeCoproductionsInvites(this.data);
  }
};
