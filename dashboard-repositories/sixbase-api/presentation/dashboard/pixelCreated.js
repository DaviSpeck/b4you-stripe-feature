const { findPixelType } = require('../../types/pixelsTypes');

const serializePixel = (pixel) => {
  const { uuid, id_type, settings, created_at } = pixel;
  return {
    uuid,
    type: findPixelType(id_type).name,
    settings,
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
      return this.data.map(serializePixel);
    }
    return serializePixel(this.data);
  }
};
