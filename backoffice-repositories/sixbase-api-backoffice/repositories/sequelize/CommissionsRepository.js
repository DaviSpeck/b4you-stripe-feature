const sequelize = require('sequelize');
const Commissions = require('../../database/models/Commissions');
const { DATABASE_DATE } = require('../../types/dateTypes');
const date = require('../../utils/helpers/date');

module.exports = class CommissionsRepository {
  static async findMetrics(id_user) {
    const paidPromise = Commissions.sequelize.query(
      'select sum(c.amount) as total from commissions c join sales_items si on si.id = c.id_sale_item where si.id_status in (2) and c.id_user = :id_user',
      {
        plain: true,
        replacements: {
          id_user,
        },
      },
    );
    const pendingRefund = Commissions.sequelize.query(
      'select sum(c.amount) as total from commissions c join sales_items si on si.id = c.id_sale_item where si.id_status in (6) and c.id_user = :id_user',
      {
        plain: true,
        replacements: {
          id_user,
        },
      },
    );

    const refundedPromise = Commissions.sum('amount', {
      where: {
        id_user,
        id_status: [4],
      },
    });
    const [paid, pending, refunded] = await Promise.all([
      paidPromise,
      pendingRefund,
      refundedPromise,
    ]);
    return {
      paid: paid ? paid.total : 0,
      refunded: refunded ?? 0,
      pending_refund: pending ? pending.total : 0,
    };
  }

  static async sum30DaysTotal(id_user) {
    const result = await Commissions.sequelize.query(
      'select sum(c.amount) as amount from commissions c inner join sales_items si on c.id_sale_item = si.id where c.id_user = :id_user and si.paid_at BETWEEN :start_date and :end_date',
      {
        plain: true,
        replacements: {
          id_user,
          start_date: date()
            .subtract(29, 'd')
            .startOf('day')
            .format(DATABASE_DATE),
          end_date: date().endOf('day').format(DATABASE_DATE),
        },
      },
    );
    return result.amount ?? 0;
  }

  static async findWaiting(id_user) {
    const waiting = await Commissions.sum('amount', {
      where: {
        id_user,
        id_status: 2,
      },
    });
    return waiting;
  }

  static async findFutureReleases(id_user) {
    const commissions = await Commissions.findAll({
      attributes: [
        'release_date',
        [sequelize.fn('sum', sequelize.col('amount')), 'amount'],
      ],
      group: 'release_date',
      raw: true,
      where: {
        id_user,
        id_status: 2,
      },
    });

    return commissions;
  }

  static async findHighestSale(id_user) {
    const result = await Commissions.sequelize.query(
      'select c.amount as amount from commissions c inner join sales_items si on c.id_sale_item = si.id where c.id_user = :id_user and si.paid_at BETWEEN :start_date and :end_date order by amount desc limit 1',
      {
        plain: true,
        replacements: {
          id_user,
          start_date: date()
            .subtract(29, 'd')
            .startOf('day')
            .format(DATABASE_DATE),
          end_date: date().endOf('day').format(DATABASE_DATE),
        },
      },
    );
    return result.amount ?? 0;
  }
  static async sum30DaysTotalAndHighestSale(id_user) {
    const result = await Commissions.sequelize.query(
      `SELECT 
         COALESCE(SUM(c.amount), 0) as total,
         COALESCE(MAX(c.amount), 0) as highest_sale
       FROM commissions c 
       INNER JOIN sales_items si ON c.id_sale_item = si.id 
       WHERE c.id_user = :id_user 
         AND si.paid_at BETWEEN :start_date and :end_date`,
      {
        plain: true,
        replacements: {
          id_user,
          start_date: date()
            .subtract(29, 'd')
            .startOf('day')
            .format(DATABASE_DATE),
          end_date: date().endOf('day').format(DATABASE_DATE),
        },
      },
    );
    return {
      total: result ? result.total : 0,
      highest_sale: result ? result.highest_sale : 0,
    };
  }
};
