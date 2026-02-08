const { Op, QueryTypes } = require('sequelize');
const { findUserFiltered } = require('../../database/controllers/users');
const Users = require('../../database/models/Users');
const UserFilters = require('../../utils/userFilters');

const formatWhere = ({
  input,
  follow_up,
  blocked_withdrawal,
  negative_balance,
}) => {
  let where = {};
  if (blocked_withdrawal) {
    where = {
      '$withdrawals_settings.blocked$': blocked_withdrawal,
    };
  }

  if (follow_up) {
    where = {
      ...where,
      follow_up,
    };
  }

  if (negative_balance) {
    where = {
      ...where,
      '$balance.amount$': { [Op.lt]: 0 },
    };
  }

  if (input) {
    const trimmedInput = input.trim();
    let orObject = {
      full_name: { [Op.like]: `%${trimmedInput}%` },
      email: { [Op.like]: `%${trimmedInput}%` },
    };

    const sanitizedInput = input.replace(/[^\d]/g, '');
    if (sanitizedInput.length > 0 && !/[a-zA-Z]/gm.test(trimmedInput)) {
      orObject = {
        ...orObject,
        document_number: { [Op.like]: `%${sanitizedInput}%` },
        cnpj: { [Op.like]: `%${sanitizedInput}%` },
      };
    }

    where = {
      ...where,
      [Op.or]: orObject,
    };
  }

  return where;
};

module.exports = class {
  static async execute({
    input,
    page,
    size,
    follow_up,
    blocked_withdrawal,
    negative_balance,
  }) {
    const where = formatWhere({
      input,
      follow_up,
      blocked_withdrawal,
      negative_balance,
    });
    const users = await findUserFiltered(where, page, size);
    return users;
  }

  static async executeWithSQL({
    input,
    page,
    size,
    follow_up,
    blocked_withdrawal,
    negative_balance,
  }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const where = {
        input,
        follow_up,
        blocked_withdrawal,
        negative_balance,
      };

      const { baseFilters, baseReplacements } =
        UserFilters.createBaseFiltersSQL(where);

      const needsWithdrawalJoin =
        where.blocked_withdrawal !== undefined &&
        where.blocked_withdrawal !== null &&
        where.blocked_withdrawal !== '';
      const needsBalanceJoin =
        where.negative_balance !== undefined &&
        where.negative_balance !== null &&
        where.negative_balance !== '';

      const withdrawalJoin = needsWithdrawalJoin
        ? 'LEFT JOIN withdrawals_settings ws ON u.id = ws.id_user'
        : '';
      const balanceJoin = needsBalanceJoin
        ? 'LEFT JOIN balances b ON u.id = b.id_user'
        : '';

      const withdrawalJoinForData =
        'LEFT JOIN withdrawals_settings ws ON u.id = ws.id_user';
      const balanceJoinForData = 'LEFT JOIN balances b ON u.id = b.id_user';

      const idsResult = await Users.sequelize.query(
        `
        SELECT DISTINCT u.id
        FROM users u
        ${withdrawalJoin}
        ${balanceJoin}
        WHERE 1=1
        ${baseFilters}
        ORDER BY u.id DESC
        LIMIT :limit OFFSET :offset
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            limit,
            offset,
            ...baseReplacements,
          },
        },
      );

      if (idsResult.length === 0) {
        const countResult = await Users.sequelize.query(
          `
          SELECT COUNT(DISTINCT u.id) as total
          FROM users u
          ${withdrawalJoin}
          ${balanceJoin}
          WHERE 1=1
          ${baseFilters}
          `,
          {
            type: QueryTypes.SELECT,
            raw: true,
            replacements: baseReplacements,
          },
        );
        const total = countResult[0]?.total || 0;
        return {
          rows: [],
          count: total,
        };
      }

      const userIds = idsResult.map((row) => row.id);
      const usersResults = await Users.sequelize.query(
        `
        SELECT 
          u.id,
          u.uuid,
          u.first_name,
          u.last_name,
          u.full_name,
          u.email,
          u.document_number,
          u.cnpj,
          u.whatsapp,
          u.profile_picture,
          u.created_at,
          u.updated_at,
          u.follow_up,
          u.verified_id,
          u.verified_company,
          u.status_cnpj,
          u.instagram,
          ws.blocked as withdrawal_settings_blocked,
          b.amount as balance_amount
        FROM users u
        ${withdrawalJoinForData}
        ${balanceJoinForData}
        WHERE u.id IN (:userIds)
        ORDER BY u.id DESC
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            userIds,
          },
        },
      );

      const countResult = await Users.sequelize.query(
        `
        SELECT COUNT(DISTINCT u.id) as total
        FROM users u
        ${withdrawalJoin}
        ${balanceJoin}
        WHERE 1=1
        ${baseFilters}
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: baseReplacements,
        },
      );
      const total = countResult[0]?.total || 0;

      const formattedResults = usersResults.map((row) => ({
        id: row.id,
        uuid: row.uuid,
        full_name:
          row.full_name ||
          `${row.first_name || ''} ${row.last_name || ''}`.trim() ||
          row.email?.split('@')[0] ||
          'Usuário sem nome',
        email: row.email,
        document_number: row.document_number,
        cnpj: row.cnpj,
        whatsapp: row.whatsapp,
        profile_picture: row.profile_picture,
        created_at: row.created_at,
        updated_at: row.updated_at,
        follow_up: row.follow_up,
        verified_id: row.verified_id,
        verified_company: row.verified_company,
        status_cnpj: row.status_cnpj,
        instagram: row.instagram,
        balance:
          row.balance_amount !== null ? { amount: row.balance_amount } : null,
        withdrawal_settings:
          row.withdrawal_settings_blocked !== null
            ? { blocked: row.withdrawal_settings_blocked }
            : null,
        statistics: {
          total_products: 0,
          total_sales: 0,
          total_revenue: 0,
          last_sale_date: null,
        },
      }));

      return {
        rows: formattedResults,
        count: total,
      };
    } catch (error) {
      console.error('Erro ao buscar users com SQL direto:', error);
      throw error;
    }
  }
};
