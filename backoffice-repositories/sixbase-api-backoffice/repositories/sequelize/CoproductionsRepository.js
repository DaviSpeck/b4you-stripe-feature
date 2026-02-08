const Coproductions = require('../../database/models/Coproductions');

module.exports = class CoproductionsRepository {
  static async findCoproductionsPaginated({ id_user, page, size }) {
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    const { rows, count } = await Coproductions.findAndCountAll({
      offset,
      limit,
      subQuery: false,
      where: { id_user },
      attributes: [
        'uuid',
        'commission_percentage',
        'expires_at',
        'status',
        'accepted_at',
        'canceled_at',
      ],
      include: [
        {
          association: 'product',
          attributes: ['name', 'uuid'],
          include: [
            {
              association: 'producer',
              attributes: ['uuid'],
            },
          ],
          paranoid: false,
        },
      ],
    });

    return { count, rows: rows.map((element) => element.toJSON()) };
  }

  static async findUserCoproductions(id_product) {
    const coproductions = await Coproductions.findAll({
      nest: true,
      subQuery: false,
      where: {
        id_product,
      },
      attributes: [
        'commission_percentage',
        'expires_at',
        'status',
        'created_at',
      ],
      include: [
        {
          association: 'user',
          attributes: ['email', 'uuid', 'full_name'],
        },
      ],
    });

    return coproductions.map((element) => element.toJSON());
  }

  static async findAllRaw(where) {
    const coproductions = await Coproductions.findAll({
      nest: true,
      where,
      group: ['id_product'],
      include: [
        {
          association: 'product',
          paranoid: false,
        },
      ],
    });
    return coproductions.map((c) => c.toJSON());
  }
};
