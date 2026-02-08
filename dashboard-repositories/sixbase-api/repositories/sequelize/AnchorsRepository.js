const Anchors = require('../../database/models/Anchors');

module.exports = class anchorsRepository {
  static async create(data) {
    const anchor = await Anchors.create(data);
    return anchor.toJSON();
  }

  static async find(where) {
    const anchor = await Anchors.findOne({
      where,
      order: [['order', 'desc']],
      include: [
        {
          association: 'modules',
        },
      ],
    });
    if (!anchor) return null;
    return anchor.toJSON();
  }

  static async findAll(where) {
    const anchors = await Anchors.findAll({
      where,
      order: [['order', 'asc']],
      include: [
        {
          association: 'modules',
        },
      ],
    });

    return anchors.map((a) => a.toJSON());
  }

  static async update(where, data) {
    await Anchors.update(data, { where });
  }

  static async delete(where) {
    await Anchors.destroy({ where });
  }
};
