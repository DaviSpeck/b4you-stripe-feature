const { QueryTypes } = require('sequelize');
const AffiliateFilters = require('../../utils/affiliateFilters');
const models = require('../../database/models');

module.exports = class FindProductAffiliatesPaginated {
  constructor(AffiliatesRepository) {
    this.AffiliatesRepository = AffiliatesRepository;
  }

  async execute({ page, size, productUuid, input }) {
    const { rows, count } =
      await this.AffiliatesRepository.findProductAffiliatedPaginated({
        page,
        size,
        productUuid,
        input,
      });
    return {
      count,
      rows,
    };
  }

  async executeWithSQL({ page, size, productUuid, input }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = { input, productUuid };
      const { filters, replacements } =
        AffiliateFilters.createProductAffiliatesFiltersSQL(where);

      const sql = `
        SELECT
          a.id,
          a.uuid,
          a.commission,
          a.status,
          a.created_at,
          a.updated_at,
          a.id_user,
          a.id_product,
          u.id as user_id,
          u.uuid as user_uuid,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email,
          u.whatsapp as user_phone,
          u.document_number as user_document_number,
          p.id as product_id,
          p.uuid as product_uuid,
          p.name as product_name,
          p.price as product_price,
          p.status as product_status
        FROM affiliates a
        LEFT JOIN users u ON a.id_user = u.id
        LEFT JOIN products p ON a.id_product = p.id
        WHERE 1=1
        ${filters}
        ORDER BY a.id DESC
        LIMIT :limit OFFSET :offset
      `;

      const rows = await models.sequelize.query(sql, {
        replacements: {
          ...replacements,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      const countSql = `
        SELECT COUNT(*) as count
        FROM affiliates a
        LEFT JOIN users u ON a.id_user = u.id
        LEFT JOIN products p ON a.id_product = p.id
        WHERE 1=1
        ${filters}
      `;

      const countResult = await models.sequelize.query(countSql, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true,
      });

      const count = countResult ? countResult.count : 0;

      const formattedRows = rows.map((row) => ({
        id: row.id,
        uuid: row.uuid,
        commission: row.commission,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        id_user: row.id_user,
        id_product: row.id_product,
        user: {
          id: row.user_id,
          uuid: row.user_uuid,
          first_name: row.user_first_name,
          last_name: row.user_last_name,
          email: row.user_email,
          phone: row.user_phone,
          document_number: row.user_document_number,
        },
        product: {
          id: row.product_id,
          uuid: row.product_uuid,
          name: row.product_name,
          price: row.product_price,
          status: row.product_status,
        },
      }));

      return {
        count,
        rows: formattedRows,
      };
    } catch (error) {
      console.error(
        'Erro ao buscar affiliates de produto com SQL direto:',
        error,
      );
      throw error;
    }
  }
};
