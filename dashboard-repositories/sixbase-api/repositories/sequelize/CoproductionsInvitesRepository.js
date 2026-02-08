const Coproductions = require('../../database/models/Coproductions');
const Coproduction_Invites = require('../../database/models/Coproduction_invites');
const Products = require('../../database/models/Products');
const Users = require('../../database/models/Users');

module.exports = class coproductionsInvitesRepository {
  static async create(data, t = null) {
    const coproduction_invite = await Coproduction_Invites.create(
      data,
      t
        ? {
            transaction: t,
          }
        : null,
    );
    return coproduction_invite;
  }

  static async find(where) {
    const coproduction_invite = await Coproduction_Invites.findOne({
      raw: true,
      nest: true,
      where,
      include: [
        {
          model: Coproductions,
          as: 'coproduction',
        },
      ],
    });
    return coproduction_invite;
  }

  static async update(id, data) {
    const coproduction_invite = await Coproduction_Invites.update(data, {
      where: {
        id,
      },
    });
    return coproduction_invite;
  }

  static async findAll(where) {
    const coproduction_invite = await Coproduction_Invites.findAll({
      where,
      include: [
        {
          model: Products,
          as: 'product',
          paranoid: false,
        },
        {
          model: Users,
          as: 'users',
        },
        {
          model: Coproductions,
          as: 'coproduction',
        },
      ],
    });
    return coproduction_invite;
  }
};
