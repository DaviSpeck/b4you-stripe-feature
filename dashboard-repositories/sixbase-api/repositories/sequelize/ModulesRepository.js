const { Op } = require('sequelize');
const Modules = require('../../database/models/Modules');

module.exports = class ModulesRepository {
  static async find(where) {
    const module = await Modules.findOne({
      where,
      raw: true,
    });
    return module;
  }

  static async findAll(where) {
    const modules = await Modules.findAll({
      where,
    });
    return modules.map((m) => m.toJSON());
  }

  static async findAllByIdNotIn({ id, id_product }) {
    const modules = await Modules.findAll({
      where: {
        id: {
          [Op.notIn]: id,
        },
        id_product,
      },
    });
    return modules.map((m) => m.toJSON());
  }
};
