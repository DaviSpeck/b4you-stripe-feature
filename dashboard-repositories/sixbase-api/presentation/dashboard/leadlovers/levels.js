const serializeLeadloversMachine = (levels) => {
  const { Subject: name, Sequence: level } = levels;
  return {
    name,
    level,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeLeadloversMachine);
    }
    return serializeLeadloversMachine(this.data);
  }
};
