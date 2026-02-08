const { QueryTypes } = require('sequelize');
const { averageSales } = require('../../database/controllers/sales_items');
const MetricsFilters = require('../../utils/metricsFilters');
const models = require('../../database/models');

module.exports = class AverageSales {
  constructor({ start_date, end_date }) {
    this.start_date = start_date;
    this.end_date = end_date;
  }

  async execute() {
    const tickets = await averageSales({
      start_date: this.start_date,
      end_date: this.end_date,
    });
    return tickets;
  }

  async executeWithSQL() {
    try {
      const sql = `
        SELECT
          COUNT(*) as total_sales,
          COALESCE(SUM(price_total), 0) as total_revenue,
          COALESCE(AVG(price_total), 0) as average_sale_amount,
          COALESCE(MIN(price_total), 0) as min_sale_amount,
          COALESCE(MAX(price_total), 0) as max_sale_amount,
          COUNT(DISTINCT id_user) as unique_buyers,
          COUNT(DISTINCT id_product) as unique_products_sold,
          COUNT(CASE WHEN id_status = 2 THEN 1 END) as paid_sales,
          COUNT(CASE WHEN id_status = 4 THEN 1 END) as refunded_sales,
          COUNT(CASE WHEN id_status = 1 THEN 1 END) as pending_sales,
          COALESCE(SUM(CASE WHEN id_status = 2 THEN price_total ELSE 0 END), 0) as paid_revenue,
          COALESCE(SUM(CASE WHEN id_status = 4 THEN price_total ELSE 0 END), 0) as refunded_revenue
        FROM sales_items
        WHERE created_at >= :start_date
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
        total_sales: result.total_sales || 0,
        total_revenue: result.total_revenue || 0,
        average_sale_amount: result.average_sale_amount || 0,
        min_sale_amount: result.min_sale_amount || 0,
        max_sale_amount: result.max_sale_amount || 0,
        unique_buyers: result.unique_buyers || 0,
        unique_products_sold: result.unique_products_sold || 0,
        paid_sales: result.paid_sales || 0,
        refunded_sales: result.refunded_sales || 0,
        pending_sales: result.pending_sales || 0,
        paid_revenue: result.paid_revenue || 0,
        refunded_revenue: result.refunded_revenue || 0,
      };
    } catch (error) {
      console.error('Erro ao buscar métricas de vendas com SQL direto:', error);
      throw error;
    }
  }
};
