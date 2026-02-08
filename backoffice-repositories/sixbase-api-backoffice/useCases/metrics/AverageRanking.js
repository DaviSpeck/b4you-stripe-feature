const { QueryTypes } = require('sequelize');
const { averageTicketProduct } = require('../../database/controllers/products');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const MetricsFilters = require('../../utils/metricsFilters');
const models = require('../../database/models');

module.exports = class AverageRanking {
  constructor({ start_date, end_date, page, size }) {
    this.start_date = start_date;
    this.end_date = end_date;
    this.page = page;
    this.size = size;
  }

  async execute() {
    const promises = [];
    promises.push(
      averageTicketProduct(
        {
          start_date: this.start_date,
          end_date: this.end_date,
          page: this.page,
          size: this.size,
          id_status: findSalesStatusByKey('paid').id,
        },
        'products.uuid',
      ),
    );

    promises.push(
      averageTicketProduct(
        {
          start_date: this.start_date,
          end_date: this.end_date,
          page: this.page,
          size: this.size,
          id_status: findSalesStatusByKey('refunded').id,
        },
        'products.uuid',
      ),
    );

    const [paid, refunded] = await Promise.all(promises);
    const { rows, count } = paid;
    const { rows: rows_refund, count: count_refund } = refunded;
    return {
      refund: { rows: rows_refund, count: count_refund.length },
      paid: { rows, count: count.length },
    };
  }

  async executeWithSQL() {
    try {
      const offset = Number(this.page) * Number(this.size);
      const limit = Number(this.size);

      const paidSql = `
        SELECT
          p.uuid,
          p.name,
          p.price,
          COUNT(si.id) as total_sales,
          COALESCE(SUM(si.price_total), 0) as total_revenue,
          COALESCE(AVG(si.price_total), 0) as average_ticket,
          MAX(si.created_at) as last_sale_date
        FROM products p
        LEFT JOIN sales_items si ON p.id = si.id_product
        WHERE si.id_status = :paid_status
          AND si.created_at >= :start_date
          AND si.created_at <= :end_date
        GROUP BY p.id, p.uuid, p.name, p.price
        ORDER BY total_revenue DESC
        LIMIT :limit OFFSET :offset
      `;

      const paidRows = await models.sequelize.query(paidSql, {
        replacements: {
          paid_status: findSalesStatusByKey('paid').id,
          start_date: this.start_date,
          end_date: this.end_date,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      const paidCountSql = `
        SELECT COUNT(DISTINCT p.id) as count
        FROM products p
        LEFT JOIN sales_items si ON p.id = si.id_product
        WHERE si.id_status = :paid_status
          AND si.created_at >= :start_date
          AND si.created_at <= :end_date
      `;

      const paidCountResult = await models.sequelize.query(paidCountSql, {
        replacements: {
          paid_status: findSalesStatusByKey('paid').id,
          start_date: this.start_date,
          end_date: this.end_date,
        },
        type: QueryTypes.SELECT,
        plain: true,
      });

      const refundedSql = `
        SELECT
          p.uuid,
          p.name,
          p.price,
          COUNT(si.id) as total_sales,
          COALESCE(SUM(si.price_total), 0) as total_revenue,
          COALESCE(AVG(si.price_total), 0) as average_ticket,
          MAX(si.created_at) as last_sale_date
        FROM products p
        LEFT JOIN sales_items si ON p.id = si.id_product
        WHERE si.id_status = :refunded_status
          AND si.created_at >= :start_date
          AND si.created_at <= :end_date
        GROUP BY p.id, p.uuid, p.name, p.price
        ORDER BY total_revenue DESC
        LIMIT :limit OFFSET :offset
      `;

      const refundedRows = await models.sequelize.query(refundedSql, {
        replacements: {
          refunded_status: findSalesStatusByKey('refunded').id,
          start_date: this.start_date,
          end_date: this.end_date,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      const refundedCountSql = `
        SELECT COUNT(DISTINCT p.id) as count
        FROM products p
        LEFT JOIN sales_items si ON p.id = si.id_product
        WHERE si.id_status = :refunded_status
          AND si.created_at >= :start_date
          AND si.created_at <= :end_date
      `;

      const refundedCountResult = await models.sequelize.query(
        refundedCountSql,
        {
          replacements: {
            refunded_status: findSalesStatusByKey('refunded').id,
            start_date: this.start_date,
            end_date: this.end_date,
          },
          type: QueryTypes.SELECT,
          plain: true,
        },
      );

      return {
        refund: {
          rows: refundedRows,
          count: refundedCountResult ? refundedCountResult.count : 0,
        },
        paid: {
          rows: paidRows,
          count: paidCountResult ? paidCountResult.count : 0,
        },
      };
    } catch (error) {
      console.error('Erro ao buscar ranking médio com SQL direto:', error);
      throw error;
    }
  }
};
