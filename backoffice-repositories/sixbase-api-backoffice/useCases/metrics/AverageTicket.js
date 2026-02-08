const { QueryTypes } = require('sequelize');
const { averageTicketProduct } = require('../../database/controllers/products');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const MetricsFilters = require('../../utils/metricsFilters');
const models = require('../../database/models');

module.exports = class AverageTicket {
  constructor({ page, size, start_date, end_date }) {
    this.page = page;
    this.size = size;
    this.start_date = start_date;
    this.end_date = end_date;
  }

  async execute() {
    const tickets = await averageTicketProduct(
      {
        page: this.page,
        size: this.size,
        start_date: this.start_date,
        end_date: this.end_date,
        id_status: findSalesStatusByKey('paid').id,
      },
      'producer.id',
    );
    return tickets;
  }

  async executeWithSQL() {
    try {
      const offset = Number(this.page) * Number(this.size);
      const limit = Number(this.size);

      const sql = `
        SELECT
          u.id as producer_id,
          u.uuid as producer_uuid,
          u.first_name as producer_first_name,
          u.last_name as producer_last_name,
          u.email as producer_email,
          COUNT(si.id) as total_sales,
          COALESCE(SUM(si.price_total), 0) as total_revenue,
          COALESCE(AVG(si.price_total), 0) as average_ticket,
          COALESCE(MIN(si.price_total), 0) as min_ticket,
          COALESCE(MAX(si.price_total), 0) as max_ticket,
          MAX(si.created_at) as last_sale_date
        FROM users u
        LEFT JOIN products p ON u.id = p.id_producer
        LEFT JOIN sales_items si ON p.id = si.id_product
        WHERE si.id_status = :paid_status
          AND si.created_at >= :start_date
          AND si.created_at <= :end_date
        GROUP BY u.id, u.uuid, u.first_name, u.last_name, u.email
        ORDER BY total_revenue DESC
        LIMIT :limit OFFSET :offset
      `;

      const rows = await models.sequelize.query(sql, {
        replacements: {
          paid_status: findSalesStatusByKey('paid').id,
          start_date: this.start_date,
          end_date: this.end_date,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      const countSql = `
        SELECT COUNT(DISTINCT u.id) as count
        FROM users u
        LEFT JOIN products p ON u.id = p.id_producer
        LEFT JOIN sales_items si ON p.id = si.id_product
        WHERE si.id_status = :paid_status
          AND si.created_at >= :start_date
          AND si.created_at <= :end_date
      `;

      const countResult = await models.sequelize.query(countSql, {
        replacements: {
          paid_status: findSalesStatusByKey('paid').id,
          start_date: this.start_date,
          end_date: this.end_date,
        },
        type: QueryTypes.SELECT,
        plain: true,
      });

      const count = countResult ? countResult.count : 0;

      const formattedRows = rows.map((row) => ({
        producer_id: row.producer_id,
        producer_uuid: row.producer_uuid,
        producer_first_name: row.producer_first_name,
        producer_last_name: row.producer_last_name,
        producer_email: row.producer_email,
        total_sales: row.total_sales,
        total_revenue: row.total_revenue,
        average_ticket: row.average_ticket,
        min_ticket: row.min_ticket,
        max_ticket: row.max_ticket,
        last_sale_date: row.last_sale_date,
      }));

      return {
        count,
        rows: formattedRows,
      };
    } catch (error) {
      console.error('Erro ao buscar ticket médio com SQL direto:', error);
      throw error;
    }
  }
};
