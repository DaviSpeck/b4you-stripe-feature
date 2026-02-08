const { Op, QueryTypes } = require('sequelize');
const Affiliates = require('../../database/models/Affiliates');
const AffiliateFilters = require('../../utils/affiliateFilters');
const models = require('../../database/models');

module.exports = class AffiliatesRepository {
  static async findProductAffiliatedPaginated({
    page = 0,
    size = 10,
    productUuid,
    input = null,
  }) {
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    let where = {};
    if (input) {
      const trimmedInput = input.trim();
      if (!trimmedInput.includes(' ')) {
        where = {
          [Op.or]: {
            '$user.first_name$': { [Op.like]: `%${trimmedInput}%` },
            '$user.last_name$': { [Op.like]: `%${trimmedInput}%` },
            '$user.email$': { [Op.like]: `%${trimmedInput}%` },
          },
        };
      } else {
        const [firstName, ...lastName] = trimmedInput.split(' ');
        where = {
          [Op.or]: {
            '$user.first_name$': { [Op.like]: `%${firstName}%` },
            '$user.last_name$': { [Op.like]: `%${lastName}%` },
          },
        };
      }
    }
    const { rows, count } = await Affiliates.findAndCountAll({
      offset,
      limit,
      where,
      include: [
        {
          association: 'user',
        },
        {
          association: 'product',
          paranoid: false,
          where: {
            uuid: productUuid,
          },
        },
      ],
    });

    return {
      count,
      rows: rows.map((r) => r.toJSON()),
    };
  }

  static async findUserAffiliatesPaginated({ page = 0, size = 10, id_user }) {
    const offset = Number(page) * Number(size);
    const limit = Number(size);
    const { rows, count } = await Affiliates.findAndCountAll({
      offset,
      limit,
      subQuery: false,
      where: { id_user },
      attributes: ['uuid', 'commission', 'status', 'created_at', 'updated_at'],
      include: [
        {
          association: 'product',
          attributes: ['name', 'uuid'],
          include: [
            {
              association: 'producer',
              attributes: ['uuid'],
            },
          ],
          paranoid: false,
        },
      ],
    });

    return { count, rows: rows.map((element) => element.toJSON()) };
  }

  static async findAffiliations(where) {
    const affiliate = await Affiliates.findAll({
      nest: true,
      where,
      group: ['id_product'],
      include: [
        {
          association: 'product',
          paranoid: false,
        },
      ],
    });
    return affiliate.map((a) => a.toJSON());
  }

  static async findProductAffiliatedPaginatedWithSQL({
    page = 0,
    size = 10,
    productUuid,
    input = null,
  }) {
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
          COALESCE(pp.price, 0) as product_price,
          p.id_status_market as product_status
        FROM affiliates a
        LEFT JOIN users u ON a.id_user = u.id
        LEFT JOIN products p ON a.id_product = p.id
        LEFT JOIN product_plans pp ON pp.id_product = p.id
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
      return this.findProductAffiliatedPaginated({
        page,
        size,
        productUuid,
        input,
      });
    }
  }

  static async findUserAffiliatesPaginatedWithSQL({
    page = 0,
    size = 10,
    id_user,
  }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = { id_user };
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
      console.error(
        'Erro ao buscar affiliates do usuário com SQL direto:',
        error,
      );
      return this.findUserAffiliatesPaginated({ page, size, id_user });
    }
  }
};
