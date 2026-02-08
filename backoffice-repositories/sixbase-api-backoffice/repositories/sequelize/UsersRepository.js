const Sequelize = require('sequelize');
const { QueryTypes } = require('sequelize');
const Database = require('../../database/models');
const Users = require('../../database/models/Users');
const date = require('../../utils/helpers/date');
const DateHelper = require('../../utils/helpers/date');
const UserFilters = require('../../utils/userFilters');
const { DATABASE_DATE } = require('../../types/dateTypes');

module.exports = class UsersRepository {
  static async findByUUID(uuid) {
    const user = await Users.findOne({
      where: {
        uuid,
      },
      attributes: [
        'created_at',
        'id',
        'uuid',
        'email',
        'first_name',
        'last_name',
        'document_number',
        'zipcode',
        'street',
        'number',
        'neighborhood',
        'city',
        'state',
        'complement',
        'whatsapp',
        'bank_code',
        'agency',
        'account_number',
        'account_type',
        'operation',
        'verified_id',
        'verified_company',
        'cnpj',
        'status_cnpj',
        'instagram',
        'tiktok',
        'follow_up',
        'birth_date',
        'active',
        'pagarme_recipient_id',
        'pagarme_recipient_id_cnpj',
        'verified_pagarme',
        'verified_company_pagarme',
        'is_company',
        'pagarme_cnpj_id',
        'pagarme_cpf_id',
        'pagarme_recipient_id_3',
        'pagarme_recipient_id_cnpj_3',
        'verified_company_pagarme_3',
        'verified_pagarme_3',
      ],
      include: [
        {
          association: 'user_sale_settings',
        },
        { association: 'balance', attributes: ['amount'] },
        {
          association: 'withdrawal_settings',
          attributes: [
            'blocked',
            'withheld_balance_percentage',
            'use_highest_sale',
          ],
        },
      ],
    });

    if (!user) return null;
    return user.toJSON();
  }

  static async findCnpjByUUID(uuid) {
    const user = await Users.findOne({
      where: {
        uuid,
      },
      attributes: [
        'status_cnpj',
        'is_company',
        'verified_id',
        'cnpj',
        'verified_company',
      ],
    });
    if (!user) return null;
    return user.toJSON();
  }

  static async findToExport({ start_date, end_date, offset }) {
    const dates = [
      date(start_date).utc().startOf('day').format(DATABASE_DATE),
      date(end_date).utc().endOf('day').format(DATABASE_DATE),
    ];

    if (date().diff(end_date, 'd') === 0) {
      dates[1] = date().format(DATABASE_DATE);
    }

    const where = {
      created_at: {
        [Sequelize.Op.between]: dates,
      },
    };

    const users = await Users.findAll({
      nest: true,
      where,
      offset,
      limit: 200,
      order: [['id', 'desc']],
      attributes: [
        'id',
        'email',
        'full_name',
        'document_number',
        'whatsapp',
        'created_at',
      ],
    });

    return users.map((s) => s.toJSON());
  }

  static async update(where, data) {
    await Users.update(data, { where });
  }

  /**
   * Reset mensal (só limpa no dia 1º) e atribui not_contacted a quem vendeu no mês anterior e não vendeu no atual
   */
  static async prepareStatuses() {
    const now = DateHelper().utc();
    const day = now.date();

    if (day === 1) {
      await this.resetAllReactivationStatuses();
    }
    await this.assignNotContactedToPrevMonth();
  }

  /** Zera todos os reactivation_status */
  static async resetAllReactivationStatuses() {
    await Users.update({ reactivation_status: null }, { where: {} });
  }

  /**
   * Marca `not_contacted` em registros NULL que:
   *  - venderam no mês anterior
   *  - NÃO venderam no mês atual
   */
  static async assignNotContactedToPrevMonth() {
    const now = DateHelper().utc();
    const prev = now.clone().subtract(1, 'month');
    const startPrev = prev.startOf('month').format('YYYY-MM-DD HH:mm:ss');
    const endPrev = prev.endOf('month').format('YYYY-MM-DD HH:mm:ss');
    const startNow = now.startOf('month').format('YYYY-MM-DD HH:mm:ss');

    await Database.sequelize.query(
      `
      UPDATE users u
      SET u.reactivation_status = 'not_contacted'
      WHERE u.reactivation_status IS NULL
        AND EXISTS (
          SELECT 1
            FROM sales_items si
            JOIN products p ON p.id = si.id_product
           WHERE si.id_status = 2
             AND si.paid_at BETWEEN :startPrev AND :endPrev
             AND p.id_user = u.id
        )
        AND NOT EXISTS (
          SELECT 1
            FROM sales_items si2
            JOIN products p2 ON p2.id = si2.id_product
           WHERE si2.id_status = 2
             AND si2.paid_at >= :startNow
             AND p2.id_user = u.id
        )
    `,
      { replacements: { startPrev, endPrev, startNow } },
    );
  }

  /**
   * Lista de produtores para reativação com lógica de reset e promoção/demissão de status
   */
  static async findReactivationList({
    status,
    name,
    email,
    page = 0,
    size = 10,
  }) {
    const offset = page * size;
    const now = DateHelper().utc();
    const prev = now.clone().subtract(1, 'month');
    const startPrev = prev.startOf('month').format('YYYY-MM-DD HH:mm:ss');
    const endPrev = prev.endOf('month').format('YYYY-MM-DD HH:mm:ss');
    const startNow = now.startOf('month').format('YYYY-MM-DD HH:mm:ss');

    await this.assignNotContactedToPrevMonth();

    // 2) Remoção: vendedores de not_contacted que venderam no mês atual => NULL
    await Database.sequelize.query(
      `
      UPDATE users
      SET reactivation_status = NULL
      WHERE reactivation_status = 'not_contacted'
        AND id IN (
          SELECT p.id_user
            FROM sales_items si
            JOIN products p ON p.id = si.id_product
           WHERE si.id_status = 2
             AND si.paid_at >= :startNow
        )
    `,
      { replacements: { startNow } },
    );

    // 3) Promoção: contacting que venderam no mês atual => success
    await Database.sequelize.query(
      `
      UPDATE users
      SET reactivation_status = 'success'
      WHERE reactivation_status = 'contacting'
        AND id IN (
          SELECT p.id_user
            FROM sales_items si
            JOIN products p ON p.id = si.id_product
           WHERE si.id_status = 2
             AND si.paid_at >= :startNow
        )
    `,
      { replacements: { startNow } },
    );

    // 4) Consulta principal com CTEs
    const sql = `
      WITH prev_prod AS (
        SELECT p.id_user,
               MAX(si.paid_at) AS lastSaleDate,
               COUNT(*)    AS lastMonthSales
          FROM sales_items si
          JOIN products p ON p.id = si.id_product
         WHERE si.id_status = 2
           AND si.paid_at BETWEEN :startPrev AND :endPrev
        GROUP BY p.id_user
      ),
      curr_prod AS (
        SELECT DISTINCT p.id_user
          FROM sales_items si
          JOIN products p ON p.id = si.id_product
         WHERE si.id_status = 2
           AND si.paid_at >= :startNow
      ),
      reactivation_logic AS (
        SELECT u.id, u.uuid, u.first_name, u.last_name, u.email, u.reactivation_status,
               pp.lastMonthSales, pp.lastSaleDate
          FROM users u
          LEFT JOIN prev_prod pp ON pp.id_user = u.id
          LEFT JOIN curr_prod cp ON cp.id_user = u.id
         WHERE (pp.id_user IS NOT NULL AND cp.id_user IS NULL)
            OR u.reactivation_status IS NOT NULL
      )
      SELECT rl.uuid,
             CONCAT(rl.first_name,' ',rl.last_name) AS name,
             rl.email,
             rl.reactivation_status,
             rl.lastMonthSales,
             rl.lastSaleDate,
             COUNT(*) OVER() AS totalRows
        FROM reactivation_logic rl
       WHERE 1=1
         ${status ? `AND rl.reactivation_status = :status` : ''}
         ${name
        ? `AND (LOWER(rl.first_name) LIKE LOWER(:name) OR LOWER(rl.last_name) LIKE LOWER(:name))`
        : ''
      }
         ${email ? `AND LOWER(rl.email) LIKE LOWER(:email)` : ''}
       ORDER BY rl.lastMonthSales DESC, rl.first_name, rl.last_name
       LIMIT :size OFFSET :offset
    `;

    const replacements = {
      startPrev,
      endPrev,
      startNow,
      size,
      offset,
      ...(status && { status }),
      ...(name && { name: `%${name}%` }),
      ...(email && { email: `%${email}%` }),
    };

    const rows = await Database.sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });
    const count = rows.length ? Number(rows[0].totalRows) : 0;
    return { rows, count };
  }

  /** Atualiza manualmente o status */
  static async updateReactivationStatus(uuid, newStatus) {
    await Users.update({ reactivation_status: newStatus }, { where: { uuid } });
  }

  /** Retorna status atual para validação */
  static async getStatusByUuid(uuid) {
    const u = await Users.findOne({
      where: { uuid },
      attributes: ['reactivation_status'],
    });
    return u?.reactivation_status;
  }

  /** Dados para relatório mensal do mês atual */
  static async getCurrentMonthReactivationReport() {
    const now = DateHelper().utc();
    const startNow = now.startOf('month').format('YYYY-MM-DD HH:mm:ss');
    const endNow = now.endOf('month').format('YYYY-MM-DD HH:mm:ss');

    const sql = `
    SELECT u.uuid,
            CONCAT(u.first_name,' ',u.last_name) AS name,
            u.email,
            u.reactivation_status,
            pp.currentMonthSales,
            pp.lastSaleDate
        FROM users u
        JOIN (
          SELECT p.id_user,
                COUNT(*)         AS currentMonthSales,
                MAX(si.paid_at)  AS lastSaleDate
            FROM sales_items si
            JOIN products p ON p.id = si.id_product
          WHERE si.id_status = 2
            AND si.paid_at BETWEEN :startNow AND :endNow
          GROUP BY p.id_user
        ) pp ON pp.id_user = u.id
      WHERE u.reactivation_status IS NOT NULL
    `;

    const rows = await Database.sequelize.query(sql, {
      replacements: { startNow, endNow },
      type: QueryTypes.SELECT,
    });
    return rows;
  }

  /** Dados para relatório mensal do mês anterior */
  static async getPreviousMonthReactivationReport() {
    const now = DateHelper().utc();
    const prev = now.clone().subtract(1, 'month');
    const startPrev = prev.startOf('month').format('YYYY-MM-DD HH:mm:ss');
    const endPrev = prev.endOf('month').format('YYYY-MM-DD HH:mm:ss');

    const sql = `
    SELECT u.uuid,
            CONCAT(u.first_name,' ',u.last_name) AS name,
            u.email,
            u.reactivation_status,
            pp.lastMonthSales,
            pp.lastSaleDate
        FROM users u
        JOIN (
          SELECT p.id_user,
                COUNT(*)         AS lastMonthSales,
                MAX(si.paid_at)  AS lastSaleDate
            FROM sales_items si
            JOIN products p ON p.id = si.id_product
          WHERE si.id_status = 2
            AND si.paid_at BETWEEN :startPrev AND :endPrev
          GROUP BY p.id_user
        ) pp ON pp.id_user = u.id
      WHERE u.reactivation_status IS NOT NULL
    `;

    const rows = await Database.sequelize.query(sql, {
      replacements: { startPrev, endPrev },
      type: QueryTypes.SELECT,
    });
    return rows;
  }

  static async findByUUID(uuid) {
    try {
      const results = await Users.sequelize.query(
        `
        SELECT 
          u.id,
          u.uuid,
          u.full_name,
          u.email,
          u.document_number,
          u.cnpj,
          u.whatsapp AS phone,
          u.profile_picture,
          u.created_at,
          u.updated_at,
          u.follow_up,
          b.amount as balance_amount,
          b.updated_at as balance_updated_at,
          ws.blocked as withdrawal_blocked,
          ws.updated_at as withdrawal_settings_updated_at,
          COUNT(DISTINCT p.id) as total_products,
          COUNT(DISTINCT si.id) as total_sales,
          COALESCE(SUM(CASE WHEN si.id_status IN (2, 4, 5, 6, 8) THEN si.price_total ELSE 0 END), 0) as total_revenue,
          MAX(si.created_at) as last_sale_date
        FROM users u
        LEFT JOIN balances b ON u.id = b.id_user
        LEFT JOIN withdrawals_settings ws ON u.id = ws.id_user
        LEFT JOIN products p ON u.id = p.id_user
        LEFT JOIN sales_items si ON p.id = si.id_product
        WHERE u.uuid = :uuid
        GROUP BY u.id, u.uuid, u.full_name, u.email, u.document_number, u.cnpj,
                 u.whatsapp, u.profile_picture, u.created_at, u.updated_at, u.follow_up,
                 b.amount, b.updated_at, ws.blocked, ws.updated_at
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: { uuid },
        },
      );

      if (!results || results.length === 0) {
        return null;
      }

      const userData = results[0];

      const formattedUser = {
        id: userData.id,
        uuid: userData.uuid,
        full_name: userData.full_name,
        email: userData.email,
        document_number: userData.document_number,
        cnpj: userData.cnpj,
        phone: userData.phone,
        profile_picture: userData.profile_picture,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        follow_up: userData.follow_up,
        balance:
          userData.balance_amount !== null
            ? {
              amount: userData.balance_amount,
              updated_at: userData.balance_updated_at,
            }
            : null,
        withdrawal_settings:
          userData.withdrawal_blocked !== null
            ? {
              blocked: userData.withdrawal_blocked,
              updated_at: userData.withdrawal_settings_updated_at,
            }
            : null,
        statistics: {
          total_products: userData.total_products,
          total_sales: userData.total_sales,
          total_revenue: userData.total_revenue,
          last_sale_date: userData.last_sale_date,
        },
      };

      return formattedUser;
    } catch (error) {
      console.error('Erro ao buscar usuário com SQL direto:', error);
      return this.findByUUID(uuid);
    }
  }

  static async findUsersWithStatsWithSQL({
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
          b.amount as balance_amount,
          b.updated_at as balance_updated_at,
          ws.blocked as withdrawal_blocked,
          ws.updated_at as withdrawal_settings_updated_at
        FROM users u
        LEFT JOIN balances b ON u.id = b.id_user
        LEFT JOIN withdrawals_settings ws ON u.id = ws.id_user
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

      const countResult = await Users.sequelize.query(
        `
        SELECT COUNT(u.id) as total
        FROM users u
        LEFT JOIN balances b ON u.id = b.id_user
        LEFT JOIN withdrawals_settings ws ON u.id = ws.id_user
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

      if (usersResults.length === 0) {
        return {
          rows: [],
          count: total,
        };
      }

      const userIds = usersResults.map((u) => u.id);

      const productsStats = await Users.sequelize.query(
        `
        SELECT 
          p.id_user,
          COUNT(p.id) as total_products
        FROM products p
        WHERE p.id_user IN (:userIds)
        GROUP BY p.id_user
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            userIds,
          },
        },
      );

      const salesStats = await Users.sequelize.query(
        `
        SELECT 
          p.id_user,
          COUNT(DISTINCT si.id) as total_sales,
          COALESCE(SUM(CASE WHEN si.id_status IN (2, 4, 5, 6, 8) THEN si.price_total ELSE 0 END), 0) as total_revenue,
          MAX(si.created_at) as last_sale_date
        FROM products p
        LEFT JOIN sales_items si ON p.id = si.id_product
        WHERE p.id_user IN (:userIds)
        GROUP BY p.id_user
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            userIds,
          },
        },
      );

      const productsStatsMap = {};
      productsStats.forEach((stat) => {
        productsStatsMap[stat.id_user] = {
          total_products: Number(stat.total_products),
        };
      });

      const salesStatsMap = {};
      salesStats.forEach((stat) => {
        salesStatsMap[stat.id_user] = {
          total_sales: Number(stat.total_sales),
          total_revenue: Number(stat.total_revenue),
          last_sale_date: stat.last_sale_date,
        };
      });

      const formattedResults = usersResults.map((row) => ({
        id: row.id,
        uuid: row.uuid,
        full_name: row.full_name,
        email: row.email,
        document_number: row.document_number,
        cnpj: row.cnpj,
        phone: row.phone,
        profile_picture: row.profile_picture,
        created_at: row.created_at,
        updated_at: row.updated_at,
        follow_up: row.follow_up,
        balance:
          row.balance_amount !== null
            ? {
              amount: row.balance_amount,
              updated_at: row.balance_updated_at,
            }
            : null,
        withdrawal_settings:
          row.withdrawal_blocked !== null
            ? {
              blocked: row.withdrawal_blocked,
              updated_at: row.withdrawal_settings_updated_at,
            }
            : null,
        statistics: {
          total_products: productsStatsMap[row.id]?.total_products || 0,
          total_sales: salesStatsMap[row.id]?.total_sales || 0,
          total_revenue: salesStatsMap[row.id]?.total_revenue || 0,
          last_sale_date: salesStatsMap[row.id]?.last_sale_date || null,
        },
      }));

      return {
        rows: formattedResults,
        count: total,
      };
    } catch (error) {
      console.error('Erro ao buscar users com SQL direto:', error);
      return this.findUsersWithStats({
        input,
        page,
        size,
        follow_up,
        blocked_withdrawal,
        negative_balance,
      });
    }
  }

  static async findAverageProducerSalesWithSQL({
    start_date,
    end_date,
    page,
    size,
  }) {
    try {
      const offset = Number(page) * Number(size);
      const limit = Number(size);

      const results = await Users.sequelize.query(
        `
        SELECT 
          u.id as producer_id,
          u.uuid as producer_uuid,
          u.full_name as producer_full_name,
          u.profile_picture as producer_profile_picture,
          COUNT(DISTINCT si.id) as total_sales,
          COALESCE(SUM(si.price_total), 0) as total_revenue,
          COALESCE(AVG(si.price_total), 0) as average_sale_value,
          MAX(si.created_at) as last_sale_date
        FROM sales_items si
        INNER JOIN products p ON si.id_product = p.id
        INNER JOIN users u ON p.id_user = u.id
        WHERE si.id_status = 2
        AND si.created_at BETWEEN :start_date AND :end_date
        GROUP BY u.id, u.uuid, u.full_name, u.profile_picture
        ORDER BY total_revenue DESC
        LIMIT :limit OFFSET :offset
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            start_date,
            end_date,
            limit,
            offset,
          },
        },
      );

      const countResult = await Users.sequelize.query(
        `
        SELECT COUNT(DISTINCT u.id) as total
        FROM sales_items si
        INNER JOIN products p ON si.id_product = p.id
        INNER JOIN users u ON p.id_user = u.id
        WHERE si.id_status = 2
        AND si.created_at BETWEEN :start_date AND :end_date
        `,
        {
          type: QueryTypes.SELECT,
          raw: true,
          replacements: {
            start_date,
            end_date,
          },
        },
      );

      const total = countResult[0]?.total || 0;

      const formattedResults = results.map((row) => ({
        total: row.total_revenue,
        full_name: row.producer_full_name,
        uuid: row.producer_uuid,
        profile_picture: row.producer_profile_picture,
        statistics: {
          total_sales: row.total_sales,
          average_sale_value: row.average_sale_value,
          last_sale_date: row.last_sale_date,
        },
      }));

      return {
        rows: formattedResults,
        count: total,
      };
    } catch (error) {
      console.error('Erro ao buscar vendas médias com SQL direto:', error);
      return this.findAverageProducerSales(start_date, end_date, page, size);
    }
  }

  static async findByEmail(email) {
    const user = await Users.findOne({
      where: { email },
      attributes: ['uuid', 'email'],
    });
    if (!user) return null;
    return user.toJSON();
  }
};
