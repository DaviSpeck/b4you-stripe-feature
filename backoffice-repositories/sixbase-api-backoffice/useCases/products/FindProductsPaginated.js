const { QueryTypes } = require('sequelize');
const ProductFilters = require('../../utils/productFilters');

module.exports = class FindProductsPaginated {
  constructor(ProductsRepository) {
    this.ProductsRepository = ProductsRepository;
  }

  async execute({ page, size, input, userUuid }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = { input, producerUuid: userUuid };
      const { filters, replacements } =
        ProductFilters.createAllFiltersSQL(where);
      const sql = `
        SELECT
          p.id,
          p.uuid,
          p.name,
          p.description,
          p.id_type,
          p.payment_type,
          p.warranty,
          p.content_delivery,
          p.cover,
          p.id_status_market as status,
          p.visible,
          p.allow_affiliate,
          p.list_on_market,
          p.recommended_market,
          p.deleted_at,
          p.created_at,
          p.updated_at,
          u.id as producer_id,
          u.uuid as producer_uuid,
          u.full_name as producer_name,
          u.email as producer_email,
          COUNT(si.id) as total_sales,
          COALESCE(SUM(CASE WHEN si.id_status IN (2, 4, 5, 6, 8) THEN si.price_total ELSE 0 END), 0) as total_revenue,
          MAX(si.created_at) as last_sale_date
        FROM products p
        LEFT JOIN users u ON p.id_user = u.id
        LEFT JOIN sales_items si ON p.id = si.id_product
        WHERE 1=1
        ${filters}
        GROUP BY p.id, p.uuid, p.name, p.description, p.id_type, p.payment_type, p.warranty,
                 p.content_delivery, p.cover, p.id_status_market, p.visible, p.allow_affiliate,
                 p.list_on_market, p.recommended_market, p.deleted_at,
                 p.created_at, p.updated_at, u.id, u.uuid, u.full_name, u.email
        ORDER BY p.id ASC
        LIMIT :limit OFFSET :offset
      `;

      const rows = await this.ProductsRepository.sequelize.query(sql, {
        replacements: {
          ...replacements,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      const countSql = `
        SELECT COUNT(DISTINCT p.id) as count
        FROM products p
        LEFT JOIN users u ON p.id_user = u.id
        WHERE 1=1
        ${filters}
      `;

      const countResult = await this.ProductsRepository.sequelize.query(
        countSql,
        {
          replacements,
          type: QueryTypes.SELECT,
          plain: true,
        },
      );

      const count = countResult ? countResult.count : 0;

      return {
        rows,
        count,
      };
    } catch (error) {
      console.error('Erro ao buscar produtos com SQL direto:', error);
      throw error;
    }
  }
};
