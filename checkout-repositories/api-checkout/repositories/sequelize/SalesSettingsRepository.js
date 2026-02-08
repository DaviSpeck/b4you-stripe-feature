const { Op } = require('sequelize');
const Sales_settings = require('../../database/models/Sales_settings');
const {
  findSalesSettingsDefault,
} = require('../../database/controllers/sales_settings_default');

module.exports = class SalesSettingsRepository {
  static async create(id_user, t = null) {
    const { id, created_at, updated_at, ...rest } =
      await findSalesSettingsDefault();
    const sale = await Sales_settings.create(
      {
        id_user,
        ...rest,
      },
      t ? { transaction: t } : null,
    );
    return sale;
  }

  static async find(id_user) {
    return Sales_settings.findOne({
      where: {
        id_user,
      },
      include: [
        {
          association: 'fee_interest_card',
          on: {
            [Op.or]: {
              id_user,
              is_default: true,
            },
          },
        },
      ],
    });
  }
};
