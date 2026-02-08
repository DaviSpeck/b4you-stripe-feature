const { findCoproductionStatus } = require('../../status/coproductionsStatus');
const serializeCoproductions = (coproduction) => {
  const { status, ...rest } = coproduction;

  return {
    ...rest,
    status: findCoproductionStatus(status),
  };
};

module.exports = class SerializeSales {
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
