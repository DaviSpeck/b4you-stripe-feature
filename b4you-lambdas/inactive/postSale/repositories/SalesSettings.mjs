import { Op } from 'sequelize';
import { Sales_settings } from '../database/models/SalesSettings.mjs';

export class SalesSettingsRepository {
  static async find(id_user) {
    return Sales_settings.findOne({
      raw: true,
      nest: true,
      attributes: ['fee_fixed_card', 'fee_variable_percentage_service', 'fee_fixed_amount_service'],
      where: {
        id_user,
      },
      include: [
        {
          association: 'fee_interest_card',
          attributes: ['producer_fees', 'student_fees'],
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
}
