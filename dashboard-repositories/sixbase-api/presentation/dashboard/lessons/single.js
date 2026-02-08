const { capitalizeName } = require('../../../utils/formatters');

const serializeSingleLesson = (lesson) => {
  const { uuid, title } = lesson;
  return {
    uuid,
    title: capitalizeName(title),
  };
};

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleLesson);
    }
    return serializeSingleLesson(this.data);
  }
};
