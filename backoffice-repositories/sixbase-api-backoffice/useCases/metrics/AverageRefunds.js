const { QueryTypes } = require('sequelize');
const { averageRefunds } = require('../../database/controllers/sales_items');
const MetricsFilters = require('../../utils/metricsFilters');
const models = require('../../database/models');

module.exports = class AverageRefunds {
  constructor({ start_date, end_date }) {
    this.start_date = start_date;
    this.end_date = end_date;
  }

  async execute() {
    const refunds = await averageRefunds({
      start_date: this.start_date,
      end_date: this.end_date,
    });
    return refunds;
  }

  async executeWithSQL() {
    try {
      const sql = `
        SELECT
          COUNT(*) as total_refunds,
          COALESCE(SUM(price_total), 0) as total_refunded_amount,
          COALESCE(AVG(price_total), 0) as average_refund_amount,
          COALESCE(MIN(price_total), 0) as min_refund_amount,
          COALESCE(MAX(price_total), 0) as max_refund_amount,
          COUNT(DISTINCT id_user) as unique_users_refunded,
          COUNT(DISTINCT id_product) as unique_products_refunded
        FROM sales_items
        WHERE id_status = 4
          AND created_at >= :start_date
          AND created_at <= :end_date
      `;

      const result = await models.sequelize.query(sql, {
        replacements: {
          start_date: this.start_date,
          end_date: this.end_date,
        },
        type: QueryTypes.SELECT,
        plain: true,
      });

      return {
        total_refunds: result.total_refunds || 0,
        total_refunded_amount: result.total_refunded_amount || 0,
        average_refund_amount: result.average_refund_amount || 0,
        min_refund_amount: result.min_refund_amount || 0,
        max_refund_amount: result.max_refund_amount || 0,
        unique_users_refunded: result.unique_users_refunded || 0,
        unique_products_refunded: result.unique_products_refunded || 0,
      };
    } catch (error) {
      console.error(
        'Erro ao buscar métricas de reembolsos com SQL direto:',
        error,
      );
      throw error;
    }
  }
};
