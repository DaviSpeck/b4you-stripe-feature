import { UsersRevenue } from '../models/UsersRevenue.mjs';
import { Op } from 'sequelize';
import { date } from '../../utils/date.mjs';

export class UsersRevenueRepository {
  static async sum30DaysTotal(id_user) {
    const sum = await UsersRevenue.sum('total', {
      where: {
        id_user,
        paid_at: {
          [Op.gte]: date().subtract(29, 'd').format('YYYY-MM-DD'),
        },
      },
    });
    return sum;
  }
}
