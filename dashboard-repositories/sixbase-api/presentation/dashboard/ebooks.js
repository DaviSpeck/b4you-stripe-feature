const { formatBytes } = require('../common');

const serializeEbook = ({ files_description, ebooks }) => ({
  files_description,
  ebooks: ebooks.map(
    ({
      uuid,
      name,
      is_bonus,
      file_size,
      file_extension,
      allow_piracy_watermark,
    }) => ({
      uuid,
      name,
      is_bonus,
      allow_piracy_watermark,
      file_extension,
      file_size: formatBytes(file_size, 0),
    }),
  ),
});

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeEbook(this.data);
  }
};
