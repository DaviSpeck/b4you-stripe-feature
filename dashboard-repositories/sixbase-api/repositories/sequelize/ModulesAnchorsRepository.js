const { Op } = require('sequelize');
const ModulesAnchors = require('../../database/models/Modules_Anchors');

module.exports = class modulesAnchorsRepository {
  static async delete(where) {
    await ModulesAnchors.destroy({ where });
  }

  static async create(data) {
    const modulesAnchors = await ModulesAnchors.create(data);
    return modulesAnchors.toJSON();
  }

  static async findLastOrder(where) {
    const modulesAnchors = await ModulesAnchors.findOne({
      where,
      order: [['order', 'desc']],
    });
    if (!modulesAnchors) return null;
    return modulesAnchors.toJSON();
  }

  static async reorder(where, order) {
    await ModulesAnchors.decrement('order', {
      where: { ...where, order: { [Op.gt]: order } },
      by: 1,
    });
  }

  static async update(where, data) {
    await ModulesAnchors.update(data, { where });
  }
};
