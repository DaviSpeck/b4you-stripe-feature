const { slugify, capitalizeName } = require('../../../utils/formatters');

const serializeProductAsSale = (products) =>
  products.map(
    ({
      uuid,
      name,
      description,
      cover,
      logo,
      excerpt,
      thumbnail,
      producer: { full_name, profile_picture },
    }) => ({
      uuid,
      name,
      description,
      cover,
      excerpt,
      thumbnail,
      next_lesson_id: null,
      slug: slugify(name),
      type: null,
      producer: {
        full_name: capitalizeName(full_name),
        profile_picture,
        nickname: capitalizeName(full_name),
        biography: null,
      },
      url_logo: logo,
      duration: null,
      total_lessons: null,
      progress: null,
    }),
  );

module.exports = class {
  constructor(data) {
    this.data = data;
  }

  adapt() {
    if (!this.data) throw new Error('Expect data to be not undefined or null');
    return serializeProductAsSale(this.data);
  }
};
