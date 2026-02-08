import { date } from '../../utils/date.mjs';
import { Commissions } from '../models/Commissions.mjs';
const DATABASE_DATE = 'YYYY-MM-DD HH:mm:ss';

export class CommissionsRepository {
  static async sum30DaysTotal(id_user) {
    const result = await Commissions.sequelize.query(
      'select sum(c.amount) as amount from commissions c inner join sales_items si on c.id_sale_item = si.id where c.id_user = :id_user and si.paid_at BETWEEN :start_date and :end_date',
      {
        plain: true,
        replacements: {
          id_user,
          start_date: date().subtract(29, 'd').startOf('day').format(DATABASE_DATE),
          end_date: date().endOf('day').format(DATABASE_DATE),
        },
      }
    );
    return result.amount ?? 0;
  }

  static async findHighestSale(id_user) {
    const result = await Commissions.sequelize.query(
      'select c.amount as amount from commissions c inner join sales_items si on c.id_sale_item = si.id where c.id_user = :id_user and si.paid_at BETWEEN :start_date and :end_date order by amount desc limit 1',
      {
        plain: true,
        replacements: {
          id_user,
          start_date: date().subtract(29, 'd').startOf('day').format(DATABASE_DATE),
          end_date: date().endOf('day').format(DATABASE_DATE),
        },
      }
    );
    return result.amount ?? 0;
  }
}
