const serializeSingleNote = ({ uuid, title, note, created_at }) => ({
  uuid,
  title,
  note,
  created_at,
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    if (Array.isArray(this.data)) {
      return this.data.map(serializeSingleNote);
    }
    return serializeSingleNote(this.data);
  }
};
