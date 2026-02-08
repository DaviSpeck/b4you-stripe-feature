const { QueryTypes } = require('sequelize');
const AffiliateFilters = require('../../utils/affiliateFilters');
const models = require('../../database/models');
const ApiError = require('../../error/ApiError');

module.exports = class FindCoproductions {
  constructor(UsersRepository, AffiliatesRepository) {
    this.AffiliatesRepository = AffiliatesRepository;
    this.UsersRepository = UsersRepository;
  }

  async execute({ userUuid, page, size }) {
    const user = await this.UsersRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    const affiliates =
      await this.AffiliatesRepository.findUserAffiliatesPaginated({
        id_user: user.id,
        page,
        size,
      });
    return affiliates;
  }

  async executeWithSQL({ userUuid, page, size }) {
    try {
      const user = await this.UsersRepository.findByUUID(userUuid);
      if (!user) throw ApiError.badRequest('Usuário não encontrado');

      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = { id_user: user.id };
      const { filters, replacements } =
        AffiliateFilters.createUserAffiliatesFiltersSQL(where);

      const sql = `
        SELECT
          a.uuid,
          a.commission,
          a.status,
          a.created_at,
          a.updated_at,
          p.name as product_name,
          p.uuid as product_uuid,
          pr.uuid as producer_uuid
        FROM affiliates a
        LEFT JOIN products p ON a.id_product = p.id
        LEFT JOIN users pr ON p.id_user = pr.id
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
        uuid: row.uuid,
        commission: row.commission,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        product: {
          name: row.product_name,
          uuid: row.product_uuid,
          producer: {
            uuid: row.producer_uuid,
          },
        },
      }));

      return {
        count,
        rows: formattedRows,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error(
        'Erro ao buscar affiliates do usuário com SQL direto:',
        error,
      );
      throw error;
    }
  }
};
