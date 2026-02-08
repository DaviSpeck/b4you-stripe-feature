const { capitalizeName } = require('../../utils/formatters');

const serializeClassroom = (classroom) => {
  const { label, is_default, uuid, created_at, updated_at } = classroom;

  return {
    uuid,
    label: capitalizeName(label),
    is_default,
    created_at,
    updated_at,
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) return this.data.map(serializeClassroom);
    return serializeClassroom(this.data);
  }
};
