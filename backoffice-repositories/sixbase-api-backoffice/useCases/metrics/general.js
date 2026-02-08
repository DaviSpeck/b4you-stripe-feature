const { QueryTypes } = require('sequelize');
const { Sequelize } = require('sequelize');
const {
  findGeneralMetrics,
} = require('../../database/controllers/sales_items');
const { findUserMetrics } = require('../../database/controllers/users');
const {
  findTransactionStatusByKey,
} = require('../../status/transactionStatus');
const MetricsFilters = require('../../utils/metricsFilters');
const models = require('../../database/models');
const Commissions = require('../../database/models/Commissions');

const findMethod = (data, method) =>
  data.find(({ payment_method }) => payment_method === method);

const calculateAmount = (pay) =>
  pay ? Number(pay.total_amount.toFixed(2)) : 0;

const calculatePercentage = (total, pay) =>
  pay ? Number(((100 * pay.total_amount) / total).toFixed(2)) : 0;

const calculateCommissions = (id, commissions) => {
  const data = commissions.find(({ id_status }) => id_status === id);
  return data ? Number(data.total_amount.toFixed(2)) : 0;
};

module.exports = class {
  constructor({ page, size, start_date, end_date }) {
    this.page = page;
    this.size = size;
    this.start_date = start_date;
    this.end_date = end_date;
  }

  async execute() {
    const promises = [];
    promises.push(
      findUserMetrics({
        start_date: this.start_date,
        end_date: this.end_date,
        page: this.page,
        size: this.size,
      }),
    );
    promises.push(
      findGeneralMetrics({
        start_date: this.start_date,
        end_date: this.end_date,
      }),
    );

    promises.push(
      Commissions.findAll({
        raw: true,
        where: {
          id_status: [2, 3],
        },
        attributes: [
          'id_status',
          [Sequelize.fn('sum', Sequelize.col('amount')), 'total_amount'],
        ],
        group: ['id_status'],
      }),
    );
    const [userMetrics, general, commissions] = await Promise.all(promises);
    const totalPaymentMethods = general.reduce(
      (acc, { total_amount }) => acc + total_amount,
      0,
    );
    const billet = findMethod(general, 'billet');
    const card = findMethod(general, 'card');
    const pix = findMethod(general, 'pix');
    const paidCommision = calculateCommissions(
      findTransactionStatusByKey('paid').id,
      commissions,
    );
    const pendingCommision = calculateCommissions(
      findTransactionStatusByKey('pending').id,
      commissions,
    );
    const summary = {
      total: Number(totalPaymentMethods.toFixed(2)),
      pix_total: calculateAmount(pix),
      pix_pencentage: calculatePercentage(totalPaymentMethods, pix),
      card: calculateAmount(card),
      card_percentage: calculatePercentage(totalPaymentMethods, card),
      billet: calculateAmount(billet),
      billet_percentage: calculatePercentage(totalPaymentMethods, billet),
      commissions: {
        paid: paidCommision,
        pending: pendingCommision,
      },
    };
    return { summary, userMetrics };
  }

  async executeWithSQL() {
    try {
      const offset = Number(this.page) * Number(this.size);
      const limit = Number(this.size);

      const generalMetricsSql = `
        SELECT
          payment_method,
          COUNT(*) as total_transactions,
          COALESCE(SUM(price_total), 0) as total_amount
        FROM sales_items
        WHERE created_at >= :start_date
          AND created_at <= :end_date
          AND id_status = 2
        GROUP BY payment_method
      `;

      const general = await models.sequelize.query(generalMetricsSql, {
        replacements: {
          start_date: this.start_date,
          end_date: this.end_date,
        },
        type: QueryTypes.SELECT,
      });

      const commissionsSql = `
        SELECT
          id_status,
          COALESCE(SUM(amount), 0) as total_amount
        FROM commissions
        WHERE id_status IN (2, 3)
        GROUP BY id_status
      `;

      const commissions = await models.sequelize.query(commissionsSql, {
        type: QueryTypes.SELECT,
      });

      const userMetricsSql = `
        SELECT
          u.id,
          u.uuid,
          u.first_name,
          u.last_name,
          u.email,
          COUNT(si.id) as total_sales,
          COALESCE(SUM(si.price_total), 0) as total_spent,
          COALESCE(AVG(si.price_total), 0) as average_ticket,
          MAX(si.created_at) as last_purchase_date
        FROM users u
        LEFT JOIN sales_items si ON u.id = si.id_user
        WHERE si.created_at >= :start_date
          AND si.created_at <= :end_date
          AND si.id_status = 2
        GROUP BY u.id, u.uuid, u.first_name, u.last_name, u.email
        ORDER BY total_spent DESC
        LIMIT :limit OFFSET :offset
      `;

      const userMetricsRows = await models.sequelize.query(userMetricsSql, {
        replacements: {
          start_date: this.start_date,
          end_date: this.end_date,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      const userMetricsCountSql = `
        SELECT COUNT(DISTINCT u.id) as count
        FROM users u
        LEFT JOIN sales_items si ON u.id = si.id_user
        WHERE si.created_at >= :start_date
          AND si.created_at <= :end_date
          AND si.id_status = 2
      `;

      const userMetricsCountResult = await models.sequelize.query(
        userMetricsCountSql,
        {
          replacements: {
            start_date: this.start_date,
            end_date: this.end_date,
          },
          type: QueryTypes.SELECT,
          plain: true,
        },
      );

      const userMetricsCount = userMetricsCountResult
        ? userMetricsCountResult.count
        : 0;

      const userMetrics = {
        count: userMetricsCount,
        rows: userMetricsRows.map((row) => ({
          id: row.id,
          uuid: row.uuid,
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          total_sales: row.total_sales,
          total_spent: row.total_spent,
          average_ticket: row.average_ticket,
          last_purchase_date: row.last_purchase_date,
        })),
      };

      const totalPaymentMethods = general.reduce(
        (acc, { total_amount }) => acc + total_amount,
        0,
      );
      const billet = findMethod(general, 'billet');
      const card = findMethod(general, 'card');
      const pix = findMethod(general, 'pix');
      const paidCommision = calculateCommissions(
        findTransactionStatusByKey('paid').id,
        commissions,
      );
      const pendingCommision = calculateCommissions(
        findTransactionStatusByKey('pending').id,
        commissions,
      );

      const summary = {
        total: Number(totalPaymentMethods.toFixed(2)),
        pix_total: calculateAmount(pix),
        pix_pencentage: calculatePercentage(totalPaymentMethods, pix),
        card: calculateAmount(card),
        card_percentage: calculatePercentage(totalPaymentMethods, card),
        billet: calculateAmount(billet),
        billet_percentage: calculatePercentage(totalPaymentMethods, billet),
        commissions: {
          paid: paidCommision,
          pending: pendingCommision,
        },
      };

      return { summary, userMetrics };
    } catch (error) {
      console.error('Erro ao buscar métricas gerais com SQL direto:', error);
      throw error;
    }
  }
};
