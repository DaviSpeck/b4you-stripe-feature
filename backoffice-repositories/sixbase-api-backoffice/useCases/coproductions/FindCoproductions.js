const { QueryTypes } = require('sequelize');
const ApiError = require('../../error/ApiError');
const models = require('../../database/models');

module.exports = class FindCoproductions {
  constructor(UserRepository, CoproductionsRepository) {
    this.CoproductionsRepository = CoproductionsRepository;
    this.UserRepository = UserRepository;
  }

  async execute({ userUuid, page, size }) {
    const user = await this.UserRepository.findByUUID(userUuid);
    if (!user) throw ApiError.badRequest('Usuário não encontrado');
    const coproductions =
      await this.CoproductionsRepository.findCoproductionsPaginated({
        id_user: user.id,
        page,
        size,
      });
    return coproductions;
  }

  async executeWithSQL({ userUuid, page, size }) {
    try {
      const user = await this.UserRepository.findByUUID(userUuid);
      if (!user) throw ApiError.badRequest('Usuário não encontrado');

      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const sql = `
        SELECT
          c.id,
          c.uuid,
          c.commission_percentage as percentage,
          c.status,
          c.created_at,
          c.updated_at,
          c.id_user,
          c.id_product,
          u.id as user_id,
          u.uuid as user_uuid,
          u.first_name as user_first_name,
          u.last_name as user_last_name,
          u.email as user_email,
          p.id as product_id,
          p.uuid as product_uuid,
          p.name as product_name,
          COALESCE(pp.price, 0) as product_price,
          p.id_status_market as product_status
        FROM coproductions c
        LEFT JOIN users u ON c.id_user = u.id
        LEFT JOIN products p ON c.id_product = p.id
        LEFT JOIN product_plans pp ON pp.id_product = p.id
        WHERE c.id_user = :id_user
        ORDER BY c.id DESC
        LIMIT :limit OFFSET :offset
      `;

      const rows = await models.sequelize.query(sql, {
        replacements: {
          id_user: user.id,
          limit,
          offset,
        },
        type: QueryTypes.SELECT,
      });

      const countSql = `
        SELECT COUNT(*) as count
        FROM coproductions c
        WHERE c.id_user = :id_user
      `;

      const countResult = await models.sequelize.query(countSql, {
        replacements: { id_user: user.id },
        type: QueryTypes.SELECT,
        plain: true,
      });

      const count = countResult ? countResult.count : 0;

      const formattedRows = rows.map((row) => ({
        id: row.id,
        uuid: row.uuid,
        percentage: row.percentage,
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
      if (error instanceof ApiError) throw error;
      console.error(
        'Erro ao buscar coproduções do usuário com SQL direto:',
        error,
      );
      throw error;
    }
  }
};
