const Coproductions = require('../../database/models/Coproductions');
const Coproduction_invites = require('../../database/models/Coproduction_invites');
const Products = require('../../database/models/Products');
const Users = require('../../database/models/Users');

module.exports = class CoproductionsRepository {
  static async create(data, t = null) {
    const coproductions = await Coproductions.create(
      data,
      t
        ? {
            transaction: t,
          }
        : null,
    );
    return coproductions;
  }

  static async find(where) {
    const coproduction = await Coproductions.findOne({
      nest: true,
      where,
      include: [
        {
          model: Users,
          as: 'user',
        },
        {
          model: Products,
          as: 'product',
          include: [{ model: Users, as: 'producer' }],
        },
        {
          model: Coproduction_invites,
          as: 'invite',
        },
      ],
    });
    return coproduction;
  }

  static async findAll(where) {
    const coproduction = await Coproductions.findAll({
      raw: true,
      nest: true,
      where,
      order: [['created_at', 'desc']],
      include: [
        {
          model: Users,
          as: 'user',
        },
        {
          model: Products,
          as: 'product',
          include: [
            {
              model: Users,
              as: 'producer',
            },
          ],
        },
      ],
    });
    return coproduction;
  }

  static async update(where, data) {
    await Coproductions.update(data, {
      where,
    });
  }

  static async findAllRaw(where) {
    const coproduction = await Coproductions.findAll({
      nest: true,
      where,
      group: ['id_product'],
      include: [
        {
          model: Products,
          as: 'product',
          paranoid: false,
        },
      ],
    });
    return coproduction;
  }
};
