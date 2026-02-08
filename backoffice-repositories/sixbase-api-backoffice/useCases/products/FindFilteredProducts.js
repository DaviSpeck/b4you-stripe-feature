const { QueryTypes } = require('sequelize');
const ProductFilters = require('../../utils/productFilters');
const models = require('../../database/models');

module.exports = class FindFilteredProducts {
  constructor({ input, page, size, producerUuid = null, start_date = null, end_date = null }) {
    this.input = input;
    this.page = page;
    this.size = size;
    this.producerUuid = producerUuid;
    this.start_date = start_date;
    this.end_date = end_date;
  }

  async executeWithSQL() {
    try {
      const offset = Number(this.page) * Number(this.size);
      const limit = Number(this.size);

      const where = {
        input: this.input,
        producerUuid: this.producerUuid,
        start_date: this.start_date,
        end_date: this.end_date,
      };

      const { filters, replacements } =
        ProductFilters.createAllFiltersSQL(where);

      const productsSql = `
        SELECT
          p.id,
          p.uuid,
          p.name,
          p.description,
          p.payment_type,
          p.id_type,
          p.warranty,
          p.support_email,
          p.support_whatsapp,
          p.created_at,
          p.updated_at,
          u.id as producer_id,
          u.uuid as producer_uuid,
          u.full_name as producer_name,
          u.email as producer_email
        FROM products p
        LEFT JOIN users u ON p.id_user = u.id
        WHERE 1=1
        ${filters}
        ORDER BY p.id DESC
        LIMIT :limit OFFSET :offset
      `;

      const productsRows = await models.sequelize.query(productsSql, {
        replacements: {
          ...replacements,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      const countSql = `
        SELECT COUNT(p.id) as count
        FROM products p
        LEFT JOIN users u ON p.id_user = u.id
        WHERE 1=1
        ${filters}
      `;

      const countResult = await models.sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true,
      });

      const count = countResult ? Number(countResult.count) : 0;

      if (!productsRows.length) {
        return {
          rows: [],
          count,
        };
      }

      const productIds = productsRows.map((p) => p.id);

      const salesStats = await models.sequelize.query(
        `
          SELECT 
            si.id_product,
            COUNT(si.id) as total_sales,
            COALESCE(
              SUM(
                CASE 
                  WHEN si.id_status IN (2, 4, 5, 6, 8) 
                  THEN si.price_total 
                  ELSE 0 
                END
              ), 
              0
            ) as total_revenue,
            MAX(si.created_at) as last_sale_date
          FROM sales_items si
          WHERE si.id_product IN (:productIds)
          GROUP BY si.id_product
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            productIds,
          },
        },
      );

      const salesStatsMap = {};
      salesStats.forEach((stat) => {
        salesStatsMap[stat.id_product] = {
          total_sales: Number(stat.total_sales),
          total_revenue: Number(stat.total_revenue),
          last_sale_date: stat.last_sale_date,
        };
      });

      const rows = productsRows.map((product) => ({
        ...product,
        total_sales: salesStatsMap[product.id]?.total_sales || 0,
        total_revenue: salesStatsMap[product.id]?.total_revenue || 0,
        last_sale_date: salesStatsMap[product.id]?.last_sale_date || null,
      }));

      return {
        rows,
        count,
      };
    } catch (error) {
      console.error('Erro ao buscar produtos filtrados com SQL direto:', error);
      throw error;
    }
  }
};