const { QueryTypes } = require('sequelize');
const { sequelize } = require('../database/models');
const UsersBackoffice = require('../database/models/Users_backoffice');
const BackofficeRoles = require('../database/models/Backoffice_roles');
const moment = require('moment');
const {
  getPeriodParams,
  formatDate,
  dateHelperTZ,
} = require('../utils/helpers/date-tz');

const milestones = [
  { key: '10K', value: 10000 },
  { key: '50K', value: 50000 },
  { key: '500K', value: 500000 },
  { key: '1M', value: 1000000 },
  { key: '5M', value: 5000000 },
  { key: '10M', value: 10000000 },
];
const milestonesValues = milestones.map((m) => m.value);

const getManagers = async (req, res) => {
  try {
    const [role] = await sequelize.query(
      `SELECT id FROM backoffice_roles WHERE name = 'COMERCIAL' LIMIT 1`,
      { type: QueryTypes.SELECT, raw: true },
    );

    if (!role) {
      return res.status(404).json({
        message: 'Role COMERCIAL não encontrada. Execute o setup primeiro.',
      });
    }

    const managers = await sequelize.query(
      `
                SELECT id, full_name, email
                FROM users_backoffice
                WHERE id_role = :roleId
                    AND active = TRUE
                ORDER BY full_name ASC
            `,
      {
        replacements: { roleId: role.id },
        type: QueryTypes.SELECT,
        raw: true,
      },
    );

    return res.status(200).json({
      managers,
      count: managers.length,
    });
  } catch (error) {
    console.error('[getManagers] Erro:', error);
    return res.status(500).json({
      message: 'Erro ao buscar managers',
    });
  }
};

const getRevenue = async (req, res) => {
  try {
    const { manager_id, start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: 'start_date e end_date são obrigatórios',
        example: '?start_date=2025-01-01&end_date=2025-12-31',
      });
    }

    const replacements = {
      ...getPeriodParams(
        start_date,
        end_date,
        manager_id ? { managerId: manager_id } : {},
      ),
      prevStart: formatDate(start_date, false),
      prevEnd: formatDate(end_date, true),
    };

    const query = `
            SELECT
                SUM(CASE WHEN c.created_at BETWEEN :startDate AND :endDate THEN c.amount ELSE 0 END) AS current_revenue,
                SUM(CASE WHEN c.created_at BETWEEN :prevStart AND :prevEnd THEN c.amount ELSE 0 END) AS previous_revenue
            FROM commissions c
            INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
            INNER JOIN users u ON u.id = c.id_user AND u.id_manager IS NOT NULL
            WHERE c.created_at BETWEEN :prevStart AND :endDate
            AND c.id_role = 1
            ${manager_id ? 'AND u.id_manager = :managerId' : ''};
        `;

    const result = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
      plain: true,
    });

    const current = Number(result?.current_revenue || 0);
    const previous = Number(result?.previous_revenue || 0);

    const momValue = current - previous;
    const momPercentage =
      previous > 0 ? +((momValue / previous) * 100).toFixed(2) : 100;

    return res.status(200).json({
      total_revenue: current,
      mom_value: momValue,
      mom_percentage: momPercentage,
    });
  } catch (error) {
    console.error('[getRevenue] Erro:', error);
    return res.status(500).json({ message: 'Erro ao calcular faturamento' });
  }
};

const DEFAULT_COMMISSION_PERCENT = 0.01;

const getCommission = async (req, res) => {
  try {
    const { manager_id, start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: 'start_date e end_date são obrigatórios',
        example: '?start_date=2025-01-01&end_date=2025-12-31',
      });
    }

    let commissionPercent = DEFAULT_COMMISSION_PERCENT;

    if (manager_id) {
      const manager = await UsersBackoffice.findByPk(manager_id, {
        attributes: ['commission_percent'],
      });
      if (manager && manager.commission_percent != null) {
        commissionPercent = Number(manager.commission_percent);
      }
    }

    const replacements = {
      ...getPeriodParams(
        start_date,
        end_date,
        manager_id ? { managerId: manager_id } : {},
      ),
    };

    const query = `
            SELECT
                SUM(c.amount) AS current_revenue
            FROM commissions c
            INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
            INNER JOIN users u ON u.id = c.id_user AND u.id_manager IS NOT NULL
            WHERE c.created_at BETWEEN :startDate AND :endDate
            AND c.id_role = 1
            ${manager_id ? 'AND u.id_manager = :managerId' : ''};
        `;

    const result = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
      plain: true,
    });

    const total_revenue = Number(result?.current_revenue || 0);
    const commission_value = total_revenue * (commissionPercent / 100);

    return res.status(200).json({
      total_revenue,
      commission_percent: commissionPercent,
      commission_value: Math.round(commission_value * 100) / 100,
    });
  } catch (error) {
    console.error('[getCommission] Erro:', error);
    return res.status(500).json({ message: 'Erro ao calcular comissão' });
  }
};

const updateManagerCommission = async (req, res) => {
  try {
    const { id } = req.params;
    const { commission_percent } = req.body;

    if (commission_percent == null || isNaN(commission_percent)) {
      return res.status(400).json({
        message: 'commission_percent é obrigatório e deve ser um número',
      });
    }

    const percent = Number(commission_percent);
    if (percent < 0 || percent > 100) {
      return res.status(400).json({
        message: 'commission_percent deve estar entre 0 e 100',
      });
    }

    const manager = await UsersBackoffice.findByPk(id);
    if (!manager) {
      return res.status(404).json({ message: 'Gerente não encontrado' });
    }

    await manager.update({ commission_percent: percent });

    return res.status(200).json({
      message: 'Comissão atualizada com sucesso',
      manager_id: id,
      commission_percent: percent,
    });
  } catch (error) {
    console.error('[updateManagerCommission] Erro:', error);
    return res.status(500).json({ message: 'Erro ao atualizar comissão' });
  }
};

const getClients = async (req, res) => {
  try {
    const { manager_id } = req.query;
    const tz = process.env.TZ || 'America/Sao_Paulo';
    const today = dateHelperTZ(undefined, tz);
    const now = today.now();
    const todayEndOfDay = today.now().endOf('day').add(3, 'hours');

    const churnThreshold = dateHelperTZ(now, tz)
      .subtract(30, 'days')
      .startOf('day')
      .add(3, 'hours');
    const churnThresholdStr = churnThreshold.format('YYYY-MM-DD HH:mm:ss');
    const churnEndDateStr = todayEndOfDay.format('YYYY-MM-DD HH:mm:ss');

    const avgRevenueStart = dateHelperTZ(now, tz)
      .subtract(60, 'days')
      .startOf('day')
      .add(3, 'hours');
    const avgRevenueStartStr = avgRevenueStart.format('YYYY-MM-DD HH:mm:ss');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = formatDate(thirtyDaysAgo, false).split(' ')[0];

    const replacements = {
      thirtyDaysAgo: dateStr,
      churnThreshold: churnThresholdStr,
      churnEndDate: churnEndDateStr,
      avgRevenueStart: avgRevenueStartStr,
    };
    if (manager_id) replacements.managerId = manager_id;

    const query = `
            SELECT 
                u.id,
                u.full_name AS name,
                u.email,
                u.whatsapp AS phone,
                u.created_at,
                u.id_manager,
                ub.email AS manager_email,
                sa.last_sale_date,
                sa.total_sales,
                COALESCE(sa.recent_sales_count, 0) AS recent_sales_count,
                (u.created_at >= :thirtyDaysAgo) AS is_new_client,
                COALESCE(churn.revenue_before_30_days, 0) AS revenue_before_30_days,
                COALESCE(churn.revenue_last_30_days, 0) AS revenue_last_30_days
            FROM users u
            LEFT JOIN (
                SELECT
                s.id_user,
                MAX(s.created_at) AS last_sale_date,
                COUNT(DISTINCT si.id_sale) AS total_sales,
                SUM(s.created_at >= :thirtyDaysAgo) AS recent_sales_count
                FROM sales s
                INNER JOIN sales_items si 
                ON si.id_sale = s.id AND si.id_status = 2
                GROUP BY s.id_user
            ) sa ON sa.id_user = u.id
            LEFT JOIN (
                SELECT
                    c.id_user,
                    SUM(CASE WHEN c.created_at >= :churnThreshold 
                             AND c.created_at <= :churnEndDate
                             AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END) AS revenue_last_30_days,
                    SUM(CASE WHEN c.created_at < :churnThreshold 
                             AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END) AS revenue_before_30_days
                FROM commissions c
                INNER JOIN sales_items si ON si.id = c.id_sale_item
                GROUP BY c.id_user
            ) churn ON churn.id_user = u.id
            LEFT JOIN users_backoffice ub ON ub.id = u.id_manager
            WHERE u.id_manager IS NOT NULL
            ${manager_id ? 'AND u.id_manager = :managerId' : ''}
            ORDER BY u.created_at DESC;
        `;

    const [clientsRaw, statsRaw] = await Promise.all([
      sequelize.query(query, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(
        `
                    SELECT 
                    COUNT(*) AS total_clients,
                    SUM(sa.recent_sales_count > 0) AS active_clients,
                    SUM(sa.recent_sales_count = 0 OR sa.recent_sales_count IS NULL) AS inactive_clients,
                    SUM(u.created_at >= :thirtyDaysAgo) AS new_clients,
                    SUM(CASE WHEN u.created_at >= :thirtyDaysAgo THEN newRev.revenue ELSE 0 END) AS new_clients_revenue,
                    SUM(CASE WHEN churn.revenue_before_30_days > 0 AND churn.revenue_last_30_days = 0 THEN 1 ELSE 0 END) AS churn_count,
                    SUM(CASE WHEN churn.revenue_before_30_days > 0 AND churn.revenue_last_30_days = 0 
                             THEN COALESCE(churn.monthly_revenue_before_churn, 0) ELSE 0 END) AS churn_revenue_loss
                    FROM users u
                    LEFT JOIN (
                    SELECT s.id_user, SUM(s.created_at >= :thirtyDaysAgo) AS recent_sales_count
                    FROM sales s
                    INNER JOIN sales_items si ON si.id_sale = s.id AND si.id_status = 2
                    GROUP BY s.id_user
                    ) sa ON sa.id_user = u.id
                    LEFT JOIN (
                        SELECT
                            c.id_user,
                            SUM(CASE WHEN c.created_at >= :churnThreshold 
                                     AND c.created_at <= :churnEndDate
                                     AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END) AS revenue_last_30_days,
                            SUM(CASE WHEN c.created_at < :churnThreshold 
                                     AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END) AS revenue_before_30_days,
                            SUM(CASE WHEN c.created_at >= :avgRevenueStart 
                                     AND c.created_at < :churnThreshold
                                     AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END) AS monthly_revenue_before_churn
                        FROM commissions c
                        INNER JOIN sales_items si ON si.id = c.id_sale_item
                        GROUP BY c.id_user
                    ) churn ON churn.id_user = u.id
                    LEFT JOIN (
                        SELECT
                            c.id_user,
                            SUM(CASE WHEN si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END) AS revenue
                        FROM commissions c
                        INNER JOIN sales_items si ON si.id = c.id_sale_item
                        GROUP BY c.id_user
                    ) newRev ON newRev.id_user = u.id
                    WHERE u.id_manager IS NOT NULL
                    ${manager_id ? 'AND u.id_manager = :managerId' : ''}
                `,
        { replacements, type: QueryTypes.SELECT, plain: true },
      ),
    ]);

    return res.status(200).json({
      ...statsRaw,
      clients: clientsRaw.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        created_at: c.created_at,
        last_sale_date: c.last_sale_date,
        total_sales: Number(c.total_sales) || 0,
        is_active: Number(c.recent_sales_count) > 0,
        is_new: !!c.is_new_client,
        manager_email: c.manager_email,
      })),
    });
  } catch (error) {
    console.error('[getClients] Erro:', error);
    return res.status(500).json({ message: 'Erro ao buscar clientes' });
  }
};

const getClientsWithManagerCard = async (req, res) => {
  try {
    const { manager_id } = req.query;

    const replacements = {};
    if (manager_id) replacements.managerId = manager_id;

    const query = `
      SELECT 
        COUNT(DISTINCT u.id) AS total_clients
      FROM users u
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''};
    `;

    const stats = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
      plain: true,
    });

    return res.status(200).json({
      total_clients: stats?.total_clients || 0,
    });
  } catch (error) {
    console.error('[getClientsWithManagerCard] Erro:', error);
    return res
      .status(500)
      .json({ message: 'Erro ao buscar card de clientes com gerente' });
  }
};

const getClientsWithManagerList = async (req, res) => {
  try {
    const { manager_id, page = 0, size = 10, search } = req.query;

    const replacements = {
      limit: Number(size),
      offset: Number(page) * Number(size),
      ...(manager_id ? { managerId: manager_id } : {}),
      ...(search ? { search: `%${search}%` } : {}),
    };

    const listQuery = `
      SELECT 
        u.id,
        u.uuid,
        u.full_name AS name,
        u.email,
        u.whatsapp AS phone,
        u.created_at,
        ub.full_name AS manager_name,
        ub.email AS manager_email
      FROM users u
      LEFT JOIN users_backoffice ub ON ub.id = u.id_manager
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      ${search ? 'AND (u.full_name LIKE :search OR u.email LIKE :search)' : ''}
      ORDER BY u.created_at DESC
      LIMIT :limit OFFSET :offset;
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users u
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      ${search ? 'AND (u.full_name LIKE :search OR u.email LIKE :search)' : ''};
    `;

    const [items, count] = await Promise.all([
      sequelize.query(listQuery, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(countQuery, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true,
      }),
    ]);

    return res.status(200).json({
      items,
      totalItems: Number(count.total || 0),
      page: Number(page),
      size: Number(size),
    });
  } catch (error) {
    console.error('[getClientsWithManagerList] Erro:', error);
    return res
      .status(500)
      .json({ message: 'Erro ao listar clientes com gerente' });
  }
};

const getClientsCards = async (req, res) => {
  try {
    const { manager_id } = req.query;

    const tz = process.env.TZ || 'America/Sao_Paulo';
    const today = dateHelperTZ(undefined, tz).now();

    const threshold = today
      .clone()
      .subtract(30, 'days')
      .startOf('day')
      .add(3, 'hours')
      .format('YYYY-MM-DD HH:mm:ss');

    const replacements = {
      threshold,
      ...(manager_id ? { managerId: manager_id } : {}),
    };

    const query = `
      SELECT 
        COUNT(DISTINCT u.id) AS total_clients,
        COUNT(DISTINCT CASE WHEN sa.id_user IS NOT NULL THEN u.id END) AS active_clients,
        COUNT(DISTINCT CASE WHEN u.created_at >= :threshold THEN u.id END) AS new_clients,
        COALESCE(SUM(CASE WHEN u.created_at >= :threshold THEN nr.revenue ELSE 0 END), 0) AS new_clients_revenue
      FROM users u
      LEFT JOIN (
        SELECT DISTINCT s.id_user
        FROM sales s
        INNER JOIN sales_items si ON si.id_sale = s.id AND si.id_status = 2
        WHERE s.created_at >= :threshold
      ) sa ON sa.id_user = u.id
      LEFT JOIN (
        SELECT
          c.id_user,
          SUM(c.amount) AS revenue
        FROM commissions c
        INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
        WHERE c.id_role = 1
        GROUP BY c.id_user
      ) nr ON nr.id_user = u.id
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''};
    `;

    const stats = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
      plain: true,
    });

    return res.status(200).json(stats);
  } catch (error) {
    console.error('[getClientsCards] Erro:', error);
    return res
      .status(500)
      .json({ message: 'Erro ao buscar cards de clientes' });
  }
};

const getActiveClients = async (req, res) => {
  try {
    const { manager_id, page = 0, size = 10, search } = req.query;

    const tz = process.env.TZ || 'America/Sao_Paulo';
    const threshold = dateHelperTZ(undefined, tz)
      .now()
      .subtract(30, 'days')
      .startOf('day')
      .add(3, 'hours')
      .format('YYYY-MM-DD HH:mm:ss');

    const replacements = {
      threshold,
      limit: Number(size),
      offset: Number(page) * Number(size),
      ...(manager_id ? { managerId: manager_id } : {}),
      ...(search ? { search: `%${search}%` } : {}),
    };

    const listQuery = `
      SELECT 
        u.id,
        u.full_name AS name,
        u.email,
        u.whatsapp AS phone,
        u.created_at,
        sa.last_sale_date,
        sa.total_sales
      FROM users u
      INNER JOIN (
        SELECT
          s.id_user,
          MAX(s.created_at) AS last_sale_date,
          COUNT(*) AS total_sales,
          SUM(s.created_at >= :threshold) AS recent_sales_count
        FROM sales s
        INNER JOIN sales_items si ON si.id_sale = s.id AND si.id_status = 2
        GROUP BY s.id_user
        HAVING recent_sales_count > 0
      ) sa ON sa.id_user = u.id
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      ${search ? 'AND u.full_name LIKE :search' : ''}
      ORDER BY sa.last_sale_date DESC
      LIMIT :limit OFFSET :offset;
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users u
      INNER JOIN (
        SELECT 
          s.id_user,
          SUM(s.created_at >= :threshold) AS recent_sales_count
        FROM sales s
        INNER JOIN sales_items si ON si.id_sale = s.id AND si.id_status = 2
        GROUP BY s.id_user
        HAVING recent_sales_count > 0
      ) sa ON sa.id_user = u.id
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      ${search ? 'AND u.full_name LIKE :search' : ''};
    `;

    const [items, count] = await Promise.all([
      sequelize.query(listQuery, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(countQuery, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true,
      }),
    ]);

    return res.status(200).json({
      items,
      totalItems: Number(count.total || 0),
      page: Number(page),
      size: Number(size),
    });
  } catch (error) {
    console.error('[getActiveClients] Erro:', error);
    return res.status(500).json({ message: 'Erro ao listar clientes ativos' });
  }
};

const getNewClients = async (req, res) => {
  try {
    const { manager_id, page = 0, size = 10, search } = req.query;

    const tz = process.env.TZ || 'America/Sao_Paulo';
    const threshold = dateHelperTZ(undefined, tz)
      .now()
      .subtract(30, 'days')
      .startOf('day')
      .add(3, 'hours')
      .format('YYYY-MM-DD HH:mm:ss');

    const replacements = {
      threshold,
      limit: Number(size),
      offset: Number(page) * Number(size),
      ...(manager_id ? { managerId: manager_id } : {}),
      ...(search ? { search: `%${search}%` } : {}),
    };

    const listQuery = `
      SELECT 
        u.id,
        u.full_name AS name,
        u.email,
        u.whatsapp AS phone,
        u.created_at,
        nr.revenue AS new_client_revenue
      FROM users u
      LEFT JOIN (
        SELECT
          c.id_user,
          SUM(CASE WHEN si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END) AS revenue
        FROM commissions c
        INNER JOIN sales_items si ON si.id = c.id_sale_item
        GROUP BY c.id_user
      ) nr ON nr.id_user = u.id
      WHERE u.created_at >= :threshold
      AND u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      ${search ? 'AND u.full_name LIKE :search' : ''}
      ORDER BY u.created_at DESC
      LIMIT :limit OFFSET :offset;
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users u
      WHERE u.created_at >= :threshold
      AND u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      ${search ? 'AND u.full_name LIKE :search' : ''};
    `;

    const [items, count] = await Promise.all([
      sequelize.query(listQuery, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(countQuery, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true,
      }),
    ]);

    return res.status(200).json({
      items,
      totalItems: Number(count.total || 0),
      page: Number(page),
      size: Number(size),
    });
  } catch (error) {
    console.error('[getNewClients] Erro:', error);
    return res.status(500).json({ message: 'Erro ao listar novos clientes' });
  }
};

const getProducers = async (req, res) => {
  try {
    const {
      manager_id,
      start_date,
      end_date,
      page = 0,
      size = 10,
      search,
      award_achieved,
      birthday_in_period,
    } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: 'start_date e end_date são obrigatórios',
        example: '?start_date=2025-01-01&end_date=2025-01-31',
      });
    }

    const replacements = getPeriodParams(start_date, end_date, {
      limit: Number(size),
      offset: Number(page) * Number(size),
      ...(manager_id ? { managerId: manager_id } : {}),
      ...(search ? { search: `%${search}%` } : {}),
    });

    const query = `
            WITH base_users AS (
                SELECT u.id, u.full_name, u.email, u.birth_date, u.whatsapp, u.id_manager
                FROM users u
                WHERE u.id_manager IS NOT NULL
                ${manager_id ? 'AND u.id_manager = :managerId' : ''}
                ${search ? 'AND u.full_name LIKE :search' : ''}
            ),
            commissions_period AS (
                SELECT c.id_user, SUM(c.amount) AS period_revenue
                FROM commissions c
                INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
                WHERE c.created_at BETWEEN :startDate AND :endDate
                GROUP BY c.id_user
            ),
            commissions_before AS (
                SELECT c.id_user, SUM(c.amount) AS previous_total
                FROM commissions c
                INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
                WHERE c.created_at < :startDate
                GROUP BY c.id_user
            ),
            commissions_total AS (
                SELECT c.id_user, SUM(c.amount) AS total_revenue
                FROM commissions c
                INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
                WHERE c.created_at <= :endDate
                GROUP BY c.id_user
            )
            SELECT 
                bu.id,
                bu.full_name AS name,
                bu.email,
                bu.birth_date,
                bu.whatsapp AS phone,
                bu.id_manager,
                COALESCE(ct.total_revenue, 0) AS total_revenue,
                COALESCE(cb.previous_total, 0) AS previous_total,
                COALESCE(cp.period_revenue, 0) AS period_revenue,
                CASE 
                    WHEN bu.birth_date IS NOT NULL 
                    AND DATE_FORMAT(bu.birth_date, '%m-%d') BETWEEN DATE_FORMAT(:startDate, '%m-%d') AND DATE_FORMAT(:endDate, '%m-%d')
                    THEN 1 ELSE 0 
                END AS birthday_in_period
            FROM base_users bu
            LEFT JOIN commissions_total ct ON ct.id_user = bu.id
            LEFT JOIN commissions_before cb ON cb.id_user = bu.id
            LEFT JOIN commissions_period cp ON cp.id_user = bu.id
            ORDER BY ct.total_revenue DESC, bu.full_name ASC
            LIMIT :limit OFFSET :offset;
        `;

    const totalQuery = `
            SELECT COUNT(*) AS total
            FROM users u
            WHERE u.id_manager IS NOT NULL
            ${manager_id ? 'AND u.id_manager = :managerId' : ''}
            ${search ? 'AND u.full_name LIKE :search' : ''}
        `;

    const [{ total }] = await sequelize.query(totalQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const producersRaw = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
      raw: true,
    });

    let goalAchievedCount = 0;
    let birthdayCount = 0;

    const producers = producersRaw
      .map((p) => {
        const totalRevenue = +p.total_revenue || 0;
        const previousTotal = +p.previous_total || 0;
        const periodRevenue = +p.period_revenue || 0;
        const birthdayInPeriod = p.birthday_in_period === 1;

        if (birthdayInPeriod) birthdayCount++;

        const nextMilestone =
          milestones.find((m) => totalRevenue < m.value) ||
          milestones[milestones.length - 1];

        const goalAchieved = totalRevenue >= nextMilestone.value;
        const goalAchievedInPeriod = milestones.some(
          (m) => previousTotal < m.value && totalRevenue >= m.value,
        );

        if (goalAchievedInPeriod) goalAchievedCount++;

        if (
          (award_achieved === 'true' && !goalAchievedInPeriod) ||
          (birthday_in_period === 'true' && !birthdayInPeriod)
        )
          return null;

        const percentageAchieved =
          nextMilestone.value > 0
            ? Math.min((totalRevenue / nextMilestone.value) * 100, 100)
            : 100;

        const formattedBirthDate = p.birth_date
          ? `${String(new Date(p.birth_date).getDate()).padStart(
              2,
              '0',
            )}/${String(new Date(p.birth_date).getMonth() + 1).padStart(
              2,
              '0',
            )}`
          : null;

        return {
          id: p.id,
          name: p.name,
          email: p.email,
          birth_date: formattedBirthDate,
          phone: p.phone,
          total_revenue: totalRevenue,
          period_revenue: periodRevenue,
          goal_status: {
            next_goal: nextMilestone.value,
            percentage_achieved: +percentageAchieved.toFixed(1),
            goal_achieved: goalAchieved,
            goal_achieved_in_period: goalAchievedInPeriod,
          },
          birthday_in_period: birthdayInPeriod,
          award_achieved: goalAchievedInPeriod,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      total: Number(total),
      page: Number(page),
      size: Number(size),
      goal_achieved_count: goalAchievedCount,
      birthday_count: birthdayCount,
      producers,
    });
  } catch (error) {
    console.error('[getProducers] Erro:', error);
    return res.status(500).json({ message: 'Erro ao buscar produtores' });
  }
};

const getProducersList = async (req, res) => {
  try {
    const {
      manager_id,
      start_date,
      end_date,
      page = 0,
      size = 10,
      search,
      award_achieved,
      birthday_in_period,
    } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: 'start_date e end_date são obrigatórios',
        example: '?start_date=2025-01-01&end_date=2025-01-31',
      });
    }

    const replacements = getPeriodParams(start_date, end_date, {
      limit: Number(size),
      offset: Number(page) * Number(size),
      ...(manager_id ? { managerId: manager_id } : {}),
      ...(search ? { search: `%${search}%` } : {}),
    });

    const milestonesValues = [10000, 50000, 500000, 1000000, 5000000, 10000000];

    const milestoneCases = milestonesValues
      .map((v) => `(cs.previous_total < ${v} AND cs.total_revenue >= ${v})`)
      .join(' OR ');

    const baseQuery = `
            WITH commission_summary AS (
                SELECT 
                c.id_user,
                SUM(CASE WHEN c.created_at < :startDate THEN c.amount ELSE 0 END) AS previous_total,
                SUM(CASE WHEN c.created_at BETWEEN :startDate AND :endDate THEN c.amount ELSE 0 END) AS period_revenue,
                SUM(c.amount) AS total_revenue
                FROM commissions c
                INNER JOIN sales_items si 
                ON si.id = c.id_sale_item 
                AND si.id_status = 2
                WHERE c.created_at <= :endDate
                GROUP BY c.id_user
            )
            SELECT 
                u.id,
                u.full_name AS name,
                u.email,
                u.whatsapp AS phone,
                DATE_FORMAT(u.birth_date, '%d/%m') AS birth_formatted,
                COALESCE(cs.total_revenue, 0) AS total_revenue,
                COALESCE(cs.previous_total, 0) AS previous_total,
                COALESCE(cs.period_revenue, 0) AS period_revenue,
                CASE 
                WHEN (${milestoneCases}) THEN 1 ELSE 0
                END AS goal_achieved_in_period,
                CASE 
                WHEN u.birth_date IS NOT NULL
                    AND DATE_FORMAT(u.birth_date, '%m-%d')
                    BETWEEN DATE_FORMAT(:startDate, '%m-%d')
                    AND DATE_FORMAT(:endDate, '%m-%d')
                THEN 1 ELSE 0
                END AS birthday_in_period
            FROM users u
            LEFT JOIN commission_summary cs ON cs.id_user = u.id
            WHERE u.id_manager IS NOT NULL
                ${manager_id ? 'AND u.id_manager = :managerId' : ''}
                ${search ? 'AND u.full_name LIKE :search' : ''}
                ${
                  birthday_in_period === 'true'
                    ? `AND MONTH(u.birth_date) BETWEEN MONTH(:startDate) AND MONTH(:endDate)
                    AND DAY(u.birth_date) BETWEEN DAY(:startDate) AND DAY(:endDate)`
                    : ''
                }
                ${award_achieved === 'true' ? `AND (${milestoneCases})` : ''}
            ORDER BY cs.total_revenue DESC, u.full_name ASC
            LIMIT :limit OFFSET :offset;
        `;

    const totalQuery = `
            SELECT COUNT(u.id) AS total
            FROM users u
            LEFT JOIN (
                SELECT 
                c.id_user,
                SUM(CASE WHEN c.created_at < :startDate THEN c.amount ELSE 0 END) AS previous_total,
                SUM(c.amount) AS total_revenue
                FROM commissions c
                INNER JOIN sales_items si 
                ON si.id = c.id_sale_item 
                AND si.id_status = 2
                WHERE c.created_at <= :endDate
                GROUP BY c.id_user
            ) cs ON cs.id_user = u.id
            WHERE u.id_manager IS NOT NULL
                ${manager_id ? 'AND u.id_manager = :managerId' : ''}
                ${search ? 'AND u.full_name LIKE :search' : ''}
                ${
                  birthday_in_period === 'true'
                    ? `AND MONTH(u.birth_date) BETWEEN MONTH(:startDate) AND MONTH(:endDate)
                    AND DAY(u.birth_date) BETWEEN DAY(:startDate) AND DAY(:endDate)`
                    : ''
                }
                ${award_achieved === 'true' ? `AND (${milestoneCases})` : ''};
        `;

    const [totalResult, producersRaw] = await Promise.all([
      sequelize.query(totalQuery, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true,
      }),
      sequelize.query(baseQuery, { replacements, type: QueryTypes.SELECT }),
    ]);

    const total = Number(totalResult?.total || 0);

    const producers = producersRaw.map((p) => {
      const totalRevenue = +p.total_revenue || 0;
      const previousTotal = +p.previous_total || 0;
      const periodRevenue = +p.period_revenue || 0;

      const nextGoalValue =
        milestonesValues.find((v) => totalRevenue < v) ??
        milestonesValues[milestonesValues.length - 1];

      const percentageAchieved =
        nextGoalValue > 0
          ? Math.min((totalRevenue / nextGoalValue) * 100, 100)
          : 100;

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        birth_date: p.birth_formatted || null,
        phone: p.phone,
        total_revenue: totalRevenue,
        period_revenue: periodRevenue,
        goal_status: {
          next_goal: nextGoalValue,
          percentage_achieved: +percentageAchieved.toFixed(1),
          goal_achieved_in_period: !!p.goal_achieved_in_period,
        },
        birthday_in_period: p.birthday_in_period === 1,
        award_achieved: !!p.goal_achieved_in_period,
      };
    });

    return res.status(200).json({
      total,
      page: Number(page),
      size: Number(size),
      producers,
    });
  } catch (error) {
    console.error('[getProducersList] Erro:', error);
    return res
      .status(500)
      .json({ message: 'Erro ao buscar lista de produtores' });
  }
};

const getProducersSummary = async (req, res) => {
  try {
    const { manager_id, start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: 'start_date e end_date são obrigatórios',
      });
    }

    const replacements = getPeriodParams(
      start_date,
      end_date,
      manager_id ? { managerId: manager_id } : {},
    );

    const milestoneCases = milestones
      .map(
        (m) =>
          `WHEN cs.previous_total < ${m.value} AND cs.total_revenue >= ${m.value} THEN 1`,
      )
      .join(' ');

    const query = `
            WITH commissions_summary AS (
                SELECT 
                c.id_user,
                SUM(c.amount) AS total_revenue,
                SUM(CASE WHEN c.created_at < :startDate THEN c.amount ELSE 0 END) AS previous_total
                FROM commissions c
                INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
                INNER JOIN users u ON u.id = c.id_user AND u.id_manager IS NOT NULL
                WHERE c.created_at <= :endDate
                AND c.id_role = 1
                ${manager_id ? 'AND u.id_manager = :managerId' : ''}
                GROUP BY c.id_user
            )
            SELECT 
                COUNT(DISTINCT u.id) AS total_producers,
                SUM(
                CASE 
                    WHEN u.birth_date IS NOT NULL 
                    AND DATE_FORMAT(u.birth_date, '%m-%d') BETWEEN 
                        DATE_FORMAT(:startDate, '%m-%d') AND DATE_FORMAT(:endDate, '%m-%d')
                    THEN 1 ELSE 0
                END
                ) AS birthday_count,
                SUM(
                CASE ${milestoneCases} ELSE 0 END
                ) AS goal_achieved_count
            FROM users u
            LEFT JOIN commissions_summary cs ON cs.id_user = u.id
            WHERE u.id_manager IS NOT NULL
            ${manager_id ? 'AND u.id_manager = :managerId' : ''};
        `;

    const summary = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
      plain: true,
    });

    return res.status(200).json({
      total_producers: Number(summary?.total_producers || 0),
      goal_achieved_count: Number(summary?.goal_achieved_count || 0),
      birthday_count: Number(summary?.birthday_count || 0),
    });
  } catch (error) {
    console.error('[getProducersSummary] Erro:', error);
    return res
      .status(500)
      .json({ message: 'Erro ao buscar resumo dos produtores' });
  }
};

const getCalendar = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      milestones: milestonesParam,
      birthday_revenue_filters: birthdayRevenueFiltersParam,
      manager_id,
    } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: 'start_date e end_date são obrigatórios',
        example: '?start_date=2025-11-01&end_date=2025-11-30',
      });
    }

    // Processar filtro de milestones para metas batidas
    let milestoneKeys = null;
    if (milestonesParam) {
      const milestonesArray = Array.isArray(milestonesParam)
        ? milestonesParam
        : [milestonesParam];
      milestoneKeys = milestonesArray.filter((m) => {
        return milestones.find((mil) => mil.key === m);
      });
    }

    // Processar filtro de faturamento para aniversariantes
    let birthdayMinRevenue = null;
    let birthdayMaxRevenue = null;
    if (birthdayRevenueFiltersParam) {
      const filtersArray = Array.isArray(birthdayRevenueFiltersParam)
        ? birthdayRevenueFiltersParam
        : [birthdayRevenueFiltersParam];

      // Mapear filtros para valores numéricos
      const filterValues = filtersArray
        .map((filter) => {
          if (filter === 'BELOW_10K') return { min: null, max: 10000 };
          const found = milestones.find((mil) => mil.key === filter);
          if (found) return { min: found.value, max: null };
          return null;
        })
        .filter((v) => v !== null);

      if (filterValues.length > 0) {
        // Se houver "BELOW_10K", usar apenas ele
        const below10k = filterValues.find((f) => f.max === 10000);
        if (below10k) {
          birthdayMaxRevenue = 10000;
        } else {
          // Caso contrário, pegar o menor valor mínimo
          const minValues = filterValues
            .map((f) => f.min)
            .filter((v) => v !== null);
          if (minValues.length > 0) {
            birthdayMinRevenue = Math.min(...minValues);
          }
        }
      }
    }

    const replacements = getPeriodParams(start_date, end_date, {
      ...(manager_id ? { managerId: manager_id } : {}),
      ...(milestoneKeys && milestoneKeys.length > 0
        ? { milestones: milestoneKeys }
        : {}),
      ...(birthdayMinRevenue !== null ? { birthdayMinRevenue } : {}),
      ...(birthdayMaxRevenue !== null ? { birthdayMaxRevenue } : {}),
    });

    const query = `
            WITH commissions_summary AS (
                SELECT 
                c.id_user,
                SUM(c.amount) AS total_revenue,
                SUM(CASE WHEN c.created_at BETWEEN :startDate AND :endDate THEN c.amount ELSE 0 END) AS period_revenue
                FROM commissions c
                INNER JOIN sales_items si 
                ON si.id = c.id_sale_item 
                AND si.id_status = 2
                WHERE c.created_at <= :endDate
                GROUP BY c.id_user
            )
            SELECT 
                event_date,
                event_type,
                producer_id,
                name,
                email,
                phone,
                manager_email,
                milestone,
                revenue,
                revenue_total
            FROM (
                SELECT 
                DATE_FORMAT(
                    STR_TO_DATE(CONCAT(YEAR(:startDate), '-', DATE_FORMAT(u.birth_date, '%m-%d')), '%Y-%m-%d'),
                    '%Y-%m-%d'
                ) AS event_date,
                'birthday' AS event_type,
                u.id AS producer_id,
                u.full_name AS name,
                u.email,
                u.whatsapp AS phone,
                ub.email AS manager_email,
                NULL AS milestone,
                COALESCE(cs.period_revenue, 0) AS revenue,
                COALESCE(cs.total_revenue, 0) AS revenue_total
                FROM users u
                LEFT JOIN commissions_summary cs ON cs.id_user = u.id
                LEFT JOIN users_backoffice ub ON ub.id = u.id_manager
                WHERE u.id_manager IS NOT NULL
                ${manager_id ? 'AND u.id_manager = :managerId' : ''}
                AND u.birth_date IS NOT NULL
                AND (
                STR_TO_DATE(CONCAT(YEAR(:startDate), '-', DATE_FORMAT(u.birth_date, '%m-%d')), '%Y-%m-%d')
                BETWEEN :startDate AND :endDate
                OR STR_TO_DATE(CONCAT(YEAR(:endDate), '-', DATE_FORMAT(u.birth_date, '%m-%d')), '%Y-%m-%d')
                BETWEEN :startDate AND :endDate
                )
                ${
                  birthdayMinRevenue !== null
                    ? 'AND COALESCE(cs.total_revenue, 0) >= :birthdayMinRevenue'
                    : ''
                }
                ${
                  birthdayMaxRevenue !== null
                    ? 'AND COALESCE(cs.total_revenue, 0) < :birthdayMaxRevenue'
                    : ''
                }

                UNION ALL

                SELECT 
                DATE(aws.achieved_date) AS event_date,
                'goal' AS event_type,
                u.id AS producer_id,
                u.full_name AS name,
                u.email,
                u.whatsapp AS phone,
                ub.email AS manager_email,
                aws.milestone,
                COALESCE(cs.period_revenue, 0) AS revenue,
                COALESCE(cs.total_revenue, 0) AS revenue_total
                FROM award_shipments aws
                INNER JOIN users u ON u.id = aws.producer_id
                LEFT JOIN commissions_summary cs ON cs.id_user = u.id
                LEFT JOIN users_backoffice ub ON ub.id = u.id_manager
                WHERE u.id_manager IS NOT NULL
                ${manager_id ? 'AND u.id_manager = :managerId' : ''}
                AND aws.achieved_date BETWEEN :startDate AND :endDate
                ${
                  milestoneKeys && milestoneKeys.length > 0
                    ? 'AND aws.milestone IN (:milestones)'
                    : ''
                }
            ) AS combined
            ORDER BY event_date;
        `;

    const rawEvents = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const eventsByDate = {};
    let monthlyBirthdayCount = 0;
    let monthlyGoalsAchievedCount = 0;

    for (const ev of rawEvents) {
      if (!ev.event_date) continue;

      const dateKey = ev.event_date.toISOString
        ? ev.event_date.toISOString().slice(0, 10)
        : ev.event_date;

      if (!eventsByDate[dateKey])
        eventsByDate[dateKey] = { birthdays: [], goals: [] };

      const target =
        ev.event_type === 'birthday'
          ? eventsByDate[dateKey].birthdays
          : eventsByDate[dateKey].goals;

      target.push({
        producer_id: ev.producer_id,
        name: ev.name,
        email: ev.email,
        phone: ev.phone,
        manager_email: ev.manager_email,
        milestone_achieved: ev.milestone,
        revenue: +ev.revenue || 0,
        revenue_total: +ev.revenue_total || 0,
      });

      if (ev.event_type === 'birthday') monthlyBirthdayCount++;
      if (ev.event_type === 'goal') monthlyGoalsAchievedCount++;
    }

    return res.status(200).json({
      monthly_birthday_count: monthlyBirthdayCount,
      monthly_goals_achieved_count: monthlyGoalsAchievedCount,
      events_by_date: eventsByDate,
    });
  } catch (error) {
    console.error('[getCalendar] Erro:', error);
    return res.status(500).json({ message: 'Erro ao buscar calendário' });
  }
};

const getChurnCard = async (req, res) => {
  try {
    const { start_date, end_date, prev_start_date, prev_end_date, manager_id } =
      req.query;

    if (!start_date || !end_date || !prev_start_date || !prev_end_date) {
      return res.status(400).json({
        message:
          'start_date, end_date, prev_start_date e prev_end_date são obrigatórios',
      });
    }

    const tz = process.env.TZ || 'America/Sao_Paulo';
    const today = dateHelperTZ(undefined, tz).now();

    const churnThreshold = dateHelperTZ(today, tz)
      .subtract(30, 'days')
      .startOf('day')
      .add(3, 'hours');
    const churnThresholdStr = churnThreshold.format('YYYY-MM-DD HH:mm:ss');
    const churnEndDateStr = today
      .endOf('day')
      .add(3, 'hours')
      .format('YYYY-MM-DD HH:mm:ss');

    const start = dateHelperTZ(start_date, tz).startOf('day').add(3, 'hours');
    const end = dateHelperTZ(end_date, tz).endOf('day').add(3, 'hours');
    const prevStart = dateHelperTZ(prev_start_date, tz)
      .startOf('day')
      .add(3, 'hours');
    const prevEnd = dateHelperTZ(prev_end_date, tz)
      .endOf('day')
      .add(3, 'hours');

    const startDateStr = start.format('YYYY-MM-DD HH:mm:ss');
    const endDateStr = end.format('YYYY-MM-DD HH:mm:ss');
    const prevStartStr = prevStart.format('YYYY-MM-DD HH:mm:ss');
    const prevEndStr = prevEnd.format('YYYY-MM-DD HH:mm:ss');

    const replacements = {
      startDate: startDateStr,
      endDate: endDateStr,
      prevStart: prevStartStr,
      prevEnd: prevEndStr,
      churnThreshold: churnThresholdStr,
      churnEndDate: churnEndDateStr,
    };
    if (manager_id) replacements.managerId = manager_id;

    const query = `
      SELECT
        u.id,
        COALESCE(SUM(CASE WHEN c.created_at BETWEEN :startDate AND :endDate 
                         AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS current_revenue,
        COALESCE(SUM(CASE WHEN c.created_at BETWEEN :prevStart AND :prevEnd 
                         AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS prev_revenue,
        COALESCE(SUM(CASE WHEN c.created_at >= :churnThreshold 
                         AND c.created_at <= :churnEndDate
                         AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_last_30_days,
        COALESCE(SUM(CASE WHEN c.created_at < :churnThreshold 
                         AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_before_30_days
      FROM users u
      INNER JOIN products p ON p.id_user = u.id
      INNER JOIN sales_items si ON si.id_product = p.id AND si.id_status = 2
      INNER JOIN commissions c ON c.id_sale_item = si.id AND c.id_role = 1
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      AND (
        (c.created_at >= :churnThreshold AND c.created_at <= :churnEndDate)
        OR (c.created_at < :churnThreshold)
        OR (c.created_at BETWEEN :startDate AND :endDate)
        OR (c.created_at BETWEEN :prevStart AND :prevEnd)
      )
      GROUP BY u.id
      HAVING 
        COALESCE(SUM(CASE WHEN c.created_at < :churnThreshold 
                         AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) > 0
        AND COALESCE(SUM(CASE WHEN c.created_at >= :churnThreshold 
                          AND c.created_at <= :churnEndDate
                          AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) = 0;
    `;

    const churnItems = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const churnCount = churnItems.length;
    const churnRevenueLoss = churnItems.reduce(
      (acc, cur) => acc + (Number(cur.prev_revenue) || 0),
      0,
    );

    return res.status(200).json({
      churnCount,
      churnRevenueLoss,
    });
  } catch (error) {
    console.error('[getChurnCard] Erro:', error);
    return res.status(500).json({ message: 'Erro ao buscar card de churn' });
  }
};

const getChurnList = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      prev_start_date,
      prev_end_date,
      manager_id,
      page = 0,
      size = 10,
    } = req.query;

    if (!start_date || !end_date || !prev_start_date || !prev_end_date) {
      return res.status(400).json({
        message:
          'start_date, end_date, prev_start_date e prev_end_date são obrigatórios',
      });
    }

    const tz = process.env.TZ || 'America/Sao_Paulo';
    const today = dateHelperTZ(undefined, tz).now();

    const churnThreshold = dateHelperTZ(today, tz)
      .subtract(30, 'days')
      .startOf('day')
      .add(3, 'hours');
    const churnThresholdStr = churnThreshold.format('YYYY-MM-DD HH:mm:ss');
    const churnEndDateStr = today
      .endOf('day')
      .add(3, 'hours')
      .format('YYYY-MM-DD HH:mm:ss');

    const start = dateHelperTZ(start_date, tz).startOf('day').add(3, 'hours');
    const end = dateHelperTZ(end_date, tz).endOf('day').add(3, 'hours');
    const prevStart = dateHelperTZ(prev_start_date, tz)
      .startOf('day')
      .add(3, 'hours');
    const prevEnd = dateHelperTZ(prev_end_date, tz)
      .endOf('day')
      .add(3, 'hours');

    const startDateStr = start.format('YYYY-MM-DD HH:mm:ss');
    const endDateStr = end.format('YYYY-MM-DD HH:mm:ss');
    const prevStartStr = prevStart.format('YYYY-MM-DD HH:mm:ss');
    const prevEndStr = prevEnd.format('YYYY-MM-DD HH:mm:ss');

    const replacements = {
      startDate: startDateStr,
      endDate: endDateStr,
      prevStart: prevStartStr,
      prevEnd: prevEndStr,
      churnThreshold: churnThresholdStr,
      churnEndDate: churnEndDateStr,
      limit: Number(size),
      offset: Number(page) * Number(size),
    };
    if (manager_id) replacements.managerId = manager_id;

    const query = `
      SELECT
        u.id,
        u.uuid AS user_uuid,
        u.full_name AS name,
        u.email,
        u.whatsapp AS phone,
        u.created_at,
        COALESCE(SUM(CASE WHEN c.created_at BETWEEN :startDate AND :endDate 
                         AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS current_revenue,
        COALESCE(SUM(CASE WHEN c.created_at BETWEEN :prevStart AND :prevEnd 
                         AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS prev_revenue
      FROM users u
      INNER JOIN products p ON p.id_user = u.id
      INNER JOIN sales_items si ON si.id_product = p.id AND si.id_status = 2
      INNER JOIN commissions c ON c.id_sale_item = si.id AND c.id_role = 1
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      AND (
        (c.created_at >= :churnThreshold AND c.created_at <= :churnEndDate)
        OR (c.created_at < :churnThreshold)
        OR (c.created_at BETWEEN :startDate AND :endDate)
        OR (c.created_at BETWEEN :prevStart AND :prevEnd)
      )
      GROUP BY u.id
      HAVING 
        COALESCE(SUM(CASE WHEN c.created_at < :churnThreshold THEN c.amount ELSE 0 END), 0) > 0
        AND COALESCE(SUM(CASE WHEN c.created_at >= :churnThreshold AND c.created_at <= :churnEndDate THEN c.amount ELSE 0 END), 0) = 0
      ORDER BY prev_revenue DESC
      LIMIT :limit OFFSET :offset;
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT u.id) AS total
      FROM users u
      INNER JOIN products p ON p.id_user = u.id
      INNER JOIN sales_items si ON si.id_product = p.id AND si.id_status = 2
      INNER JOIN commissions c ON c.id_sale_item = si.id AND c.id_role = 1
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      AND (
        (c.created_at >= :churnThreshold AND c.created_at <= :churnEndDate)
        OR (c.created_at < :churnThreshold)
      )
      GROUP BY u.id
      HAVING 
        COALESCE(SUM(CASE WHEN c.created_at < :churnThreshold THEN c.amount ELSE 0 END), 0) > 0
        AND COALESCE(SUM(CASE WHEN c.created_at >= :churnThreshold AND c.created_at <= :churnEndDate THEN c.amount ELSE 0 END), 0) = 0;
    `;

    const [items, countResult] = await Promise.all([
      sequelize.query(query, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(countQuery, {
        replacements: {
          churnThreshold: churnThresholdStr,
          churnEndDate: churnEndDateStr,
          ...(manager_id ? { managerId: manager_id } : {}),
        },
        type: QueryTypes.SELECT,
        plain: true,
      }),
    ]);

    const totalItems = Number(countResult?.total || 0);

    return res.status(200).json({
      items: items.map((item) => ({
        id: item.id,
        user_uuid: item.user_uuid,
        name: item.name,
        email: item.email,
        phone: item.phone,
        created_at: item.created_at,
        current_revenue: Number(item.current_revenue) || 0,
        prev_revenue: Number(item.prev_revenue) || 0,
      })),
      totalItems,
      page: Number(page),
      size: Number(size),
    });
  } catch (error) {
    console.error('[getChurnList] Erro:', error);
    return res.status(500).json({ message: 'Erro ao buscar lista de churn' });
  }
};

const getRetentionCard = async (req, res) => {
  try {
    const { manager_id, start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: 'start_date e end_date são obrigatórios',
        example: '?start_date=2025-01-01&end_date=2025-01-31',
      });
    }

    const tz = process.env.TZ || 'America/Sao_Paulo';
    const periodStart = dateHelperTZ(start_date, tz)
      .startOf('day')
      .add(3, 'hours');
    const periodEnd = dateHelperTZ(end_date, tz).endOf('day').add(3, 'hours');

    const currentStartStr = periodStart.format('YYYY-MM-DD HH:mm:ss');
    const currentEndStr = periodEnd.format('YYYY-MM-DD HH:mm:ss');

    const diffDays =
      periodEnd
        .clone()
        .startOf('day')
        .diff(periodStart.clone().startOf('day'), 'days') + 1;

    const prevPeriodEnd = periodStart.clone().subtract(1, 'day').endOf('day');
    const prevPeriodStart = prevPeriodEnd
      .clone()
      .subtract(diffDays - 1, 'days')
      .startOf('day');

    const prevStartStr = prevPeriodStart.format('YYYY-MM-DD HH:mm:ss');
    const prevEndStr = prevPeriodEnd.format('YYYY-MM-DD HH:mm:ss');

    const replacements = {
      currentStart: currentStartStr,
      currentEnd: currentEndStr,
      prevStart: prevStartStr,
      prevEnd: prevEndStr,
    };
    if (manager_id) replacements.managerId = manager_id;

    const query = `
      SELECT
        u.id,
      COALESCE(SUM(CASE WHEN c.created_at < :prevStart 
                       AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_before_prev,
      COALESCE(SUM(CASE WHEN c.created_at BETWEEN :prevStart AND :prevEnd 
                       AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_prev_period,
      COALESCE(SUM(CASE WHEN c.created_at BETWEEN :currentStart AND :currentEnd 
                       AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_current
      FROM users u
      INNER JOIN commissions c ON c.id_user = u.id AND c.id_role = 1
      INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      GROUP BY u.id
      HAVING 
        COALESCE(SUM(CASE WHEN c.created_at < :prevStart 
                         AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) > 0
        AND COALESCE(SUM(CASE WHEN c.created_at BETWEEN :prevStart AND :prevEnd
                            AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) = 0
        AND COALESCE(SUM(CASE WHEN c.created_at BETWEEN :currentStart AND :currentEnd
                            AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) > 0;
    `;

    const retentionItems = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const retentionCount = retentionItems.length;
    const retentionRevenue = retentionItems.reduce(
      (acc, cur) => acc + (Number(cur.revenue_current) || 0),
      0,
    );

    return res.status(200).json({
      retention_count: retentionCount,
      retention_revenue: retentionRevenue,
    });
  } catch (error) {
    console.error('[getRetentionCard] Erro:', error);
    return res.status(500).json({ message: 'Erro ao buscar card de retenção' });
  }
};

const getRetentionList = async (req, res) => {
  try {
    const {
      manager_id,
      start_date,
      end_date,
      page = 0,
      size = 10,
      search,
    } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: 'start_date e end_date são obrigatórios',
        example: '?start_date=2025-01-01&end_date=2025-01-31',
      });
    }

    const tz = process.env.TZ || 'America/Sao_Paulo';
    const periodStart = dateHelperTZ(start_date, tz)
      .startOf('day')
      .add(3, 'hours');
    const periodEnd = dateHelperTZ(end_date, tz).endOf('day').add(3, 'hours');

    const currentStartStr = periodStart.format('YYYY-MM-DD HH:mm:ss');
    const currentEndStr = periodEnd.format('YYYY-MM-DD HH:mm:ss');

    const diffDays =
      periodEnd
        .clone()
        .startOf('day')
        .diff(periodStart.clone().startOf('day'), 'days') + 1;

    const prevPeriodEnd = periodStart.clone().subtract(1, 'day').endOf('day');
    const prevPeriodStart = prevPeriodEnd
      .clone()
      .subtract(diffDays - 1, 'days')
      .startOf('day');

    const prevStartStr = prevPeriodStart.format('YYYY-MM-DD HH:mm:ss');
    const prevEndStr = prevPeriodEnd.format('YYYY-MM-DD HH:mm:ss');

    const replacements = {
      currentStart: currentStartStr,
      currentEnd: currentEndStr,
      prevStart: prevStartStr,
      prevEnd: prevEndStr,
      limit: Number(size),
      offset: Number(page) * Number(size),
      ...(manager_id ? { managerId: manager_id } : {}),
      ...(search ? { search: `%${search}%` } : {}),
    };

    const listQuery = `
      SELECT
        u.id,
        u.uuid AS user_uuid,
        u.full_name AS name,
        u.email,
        u.whatsapp AS phone,
        u.created_at,
        COALESCE(SUM(CASE WHEN c.created_at BETWEEN :currentStart AND :currentEnd 
                         AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS retention_revenue
      FROM users u
      INNER JOIN commissions c ON c.id_user = u.id AND c.id_role = 1
      INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      ${search ? 'AND (u.full_name LIKE :search OR u.email LIKE :search)' : ''}
      GROUP BY u.id
      HAVING 
        COALESCE(SUM(CASE WHEN c.created_at < :prevStart 
                         AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) > 0
        AND COALESCE(SUM(CASE WHEN c.created_at BETWEEN :prevStart AND :prevEnd
                            AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) = 0
        AND COALESCE(SUM(CASE WHEN c.created_at BETWEEN :currentStart AND :currentEnd
                            AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) > 0
      ORDER BY retention_revenue DESC
      LIMIT :limit OFFSET :offset;
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT u.id) AS total
      FROM users u
      INNER JOIN commissions c ON c.id_user = u.id AND c.id_role = 1
      INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      ${search ? 'AND (u.full_name LIKE :search OR u.email LIKE :search)' : ''}
      GROUP BY u.id
      HAVING 
        COALESCE(SUM(CASE WHEN c.created_at < :prevStart 
                         AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) > 0
        AND COALESCE(SUM(CASE WHEN c.created_at BETWEEN :prevStart AND :prevEnd
                            AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) = 0
        AND COALESCE(SUM(CASE WHEN c.created_at BETWEEN :currentStart AND :currentEnd
                            AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) > 0;
    `;

    const [items, countResult] = await Promise.all([
      sequelize.query(listQuery, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(countQuery, {
        replacements,
        type: QueryTypes.SELECT,
        plain: true,
      }),
    ]);

    const totalItems = Number(countResult?.total || 0);

    return res.status(200).json({
      items: items.map((item) => ({
        id: item.id,
        user_uuid: item.user_uuid,
        name: item.name,
        email: item.email,
        phone: item.phone,
        created_at: item.created_at,
        retention_revenue: Number(item.retention_revenue) || 0,
      })),
      totalItems,
      page: Number(page),
      size: Number(size),
    });
  } catch (error) {
    console.error('[getRetentionList] Erro:', error);
    return res
      .status(500)
      .json({ message: 'Erro ao buscar lista de retenção' });
  }
};

const getRevenueChart = async (req, res) => {
  try {
    const { manager_id, start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        message: 'start_date e end_date são obrigatórios',
        example: '?start_date=2025-01-01&end_date=2025-01-31',
      });
    }

    const tz = process.env.TZ || 'America/Sao_Paulo';
    const start = dateHelperTZ(start_date, tz).startOf('day').add(3, 'hours');
    const end = dateHelperTZ(end_date, tz).endOf('day').add(3, 'hours');
    const startStr = start.format('YYYY-MM-DD HH:mm:ss');
    const endStr = end.format('YYYY-MM-DD HH:mm:ss');

    const today = dateHelperTZ(undefined, tz).now();
    const churnThreshold = dateHelperTZ(today, tz)
      .subtract(30, 'days')
      .startOf('day')
      .add(3, 'hours');
    const churnThresholdStr = churnThreshold.format('YYYY-MM-DD HH:mm:ss');

    const replacements = {
      startDate: startStr,
      endDate: endStr,
      churnThreshold: churnThresholdStr,
    };
    if (manager_id) replacements.managerId = manager_id;

    const totalRevenueQuery = `
      SELECT
        DATE(c.created_at) AS date,
        COALESCE(SUM(CASE WHEN si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS faturamento_total
      FROM commissions c
      INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
      INNER JOIN users u ON u.id = c.id_user AND u.id_manager IS NOT NULL
      WHERE c.created_at BETWEEN :startDate AND :endDate
      AND c.id_role = 1
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      GROUP BY DATE(c.created_at)
      ORDER BY date ASC;
    `;

    const threshold30DaysAgo = today
      .clone()
      .subtract(30, 'days')
      .startOf('day')
      .add(3, 'hours')
      .format('YYYY-MM-DD HH:mm:ss');

    const replacementsNewClients = {
      ...replacements,
      threshold30DaysAgo,
    };

    const newClientsRevenueQuery = `
      SELECT
        DATE(c.created_at) AS date,
        COALESCE(SUM(CASE WHEN si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS faturamento_novos_clientes
      FROM commissions c
      INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
      INNER JOIN users u ON u.id = c.id_user AND u.id_manager IS NOT NULL
      WHERE c.created_at BETWEEN :startDate AND :endDate
      AND c.id_role = 1
      AND u.created_at >= :threshold30DaysAgo
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      GROUP BY DATE(c.created_at)
      ORDER BY date ASC;
    `;

    const diffDaysRetention =
      end.clone().startOf('day').diff(start.clone().startOf('day'), 'days') + 1;

    const prevRetentionEnd = start.clone().subtract(1, 'day').endOf('day');
    const prevRetentionStart = prevRetentionEnd
      .clone()
      .subtract(diffDaysRetention - 1, 'days')
      .startOf('day');

    const prevRetentionStartStr = prevRetentionStart.format(
      'YYYY-MM-DD HH:mm:ss',
    );
    const prevRetentionEndStr = prevRetentionEnd.format('YYYY-MM-DD HH:mm:ss');

    const replacementsRetention = {
      startDate: startStr,
      endDate: endStr,
      prevStart: prevRetentionStartStr,
      prevEnd: prevRetentionEndStr,
    };
    if (manager_id) replacementsRetention.managerId = manager_id;

    const retentionRevenueQuery = `
      WITH retention_clients AS (
        SELECT
          u.id,
          COALESCE(SUM(CASE WHEN c.created_at < :prevStart 
                           AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_before_prev,
          COALESCE(SUM(CASE WHEN c.created_at BETWEEN :prevStart AND :prevEnd 
                           AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_prev_period,
          COALESCE(SUM(CASE WHEN c.created_at BETWEEN :startDate AND :endDate 
                           AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_current
        FROM users u
        INNER JOIN commissions c ON c.id_user = u.id AND c.id_role = 1
        INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
        WHERE u.id_manager IS NOT NULL
        ${manager_id ? 'AND u.id_manager = :managerId' : ''}
        GROUP BY u.id
        HAVING 
          revenue_before_prev > 0
          AND revenue_prev_period = 0
          AND revenue_current > 0
      )
      SELECT
        DATE(c.created_at) AS date,
        COALESCE(SUM(CASE WHEN si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS faturamento_retencao
      FROM commissions c
      INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
      INNER JOIN users u ON u.id = c.id_user AND u.id_manager IS NOT NULL
      INNER JOIN retention_clients rc ON rc.id = u.id
      WHERE c.created_at BETWEEN :startDate AND :endDate
      AND c.id_role = 1
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      GROUP BY DATE(c.created_at)
      ORDER BY date ASC;
    `;

    const startMoment = moment(start_date);
    const endMoment = moment(end_date);

    // Calcular períodos anteriores para churn (mesma lógica do card)
    const prevChurnEnd = start.clone().subtract(1, 'day').endOf('day');
    const diffDaysChurn =
      end.clone().startOf('day').diff(start.clone().startOf('day'), 'days') + 1;
    const prevChurnStart = prevChurnEnd
      .clone()
      .subtract(diffDaysChurn - 1, 'days')
      .startOf('day');

    const prevChurnStartStr = prevChurnStart.format('YYYY-MM-DD HH:mm:ss');
    const prevChurnEndStr = prevChurnEnd.format('YYYY-MM-DD HH:mm:ss');

    const replacementsChurn = {
      startDate: startStr,
      endDate: endStr,
      prevStart: prevChurnStartStr,
      prevEnd: prevChurnEndStr,
      churnThreshold: churnThresholdStr,
      churnEndDate: today
        .endOf('day')
        .add(3, 'hours')
        .format('YYYY-MM-DD HH:mm:ss'),
    };
    if (manager_id) replacementsChurn.managerId = manager_id;

    // Query de churn usando a mesma lógica do card, mas agrupada por dia
    // O churn mostra a receita do período anterior dos clientes que estão em churn
    // Para o gráfico diário, vamos distribuir essa receita proporcionalmente pelos dias do período anterior
    const churnRevenueQuery = `
      WITH churn_clients AS (
        SELECT
          u.id,
          COALESCE(SUM(CASE WHEN c.created_at BETWEEN :prevStart AND :prevEnd 
                           AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS prev_revenue,
          COALESCE(SUM(CASE WHEN c.created_at < :churnThreshold 
                           AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_before_30_days,
          COALESCE(SUM(CASE WHEN c.created_at >= :churnThreshold 
                           AND c.created_at <= :churnEndDate
                           AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_last_30_days
        FROM users u
        INNER JOIN products p ON p.id_user = u.id
        INNER JOIN sales_items si ON si.id_product = p.id AND si.id_status = 2
        INNER JOIN commissions c ON c.id_sale_item = si.id AND c.id_role = 1
        WHERE u.id_manager IS NOT NULL
        ${manager_id ? 'AND u.id_manager = :managerId' : ''}
        AND (
          (c.created_at >= :churnThreshold AND c.created_at <= :churnEndDate)
          OR (c.created_at < :churnThreshold)
          OR (c.created_at BETWEEN :startDate AND :endDate)
          OR (c.created_at BETWEEN :prevStart AND :prevEnd)
        )
        GROUP BY u.id
        HAVING 
          COALESCE(SUM(CASE WHEN c.created_at < :churnThreshold 
                           AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) > 0
          AND COALESCE(SUM(CASE WHEN c.created_at >= :churnThreshold 
                            AND c.created_at <= :churnEndDate
                            AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) = 0
      )
      SELECT
        DATE(c.created_at) AS date,
        COALESCE(SUM(CASE WHEN si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS total_churn
      FROM commissions c
      INNER JOIN sales_items si ON si.id = c.id_sale_item AND si.id_status = 2
      INNER JOIN users u ON u.id = c.id_user AND u.id_manager IS NOT NULL
      INNER JOIN products p ON p.id_user = u.id AND si.id_product = p.id
      INNER JOIN churn_clients cc ON cc.id = u.id
      WHERE c.created_at BETWEEN :prevStart AND :prevEnd
      AND c.id_role = 1
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      GROUP BY DATE(c.created_at)
      ORDER BY date ASC;
    `;

    console.log('[getRevenueChart] Executando queries...', {
      startDate: startStr,
      endDate: endStr,
      manager_id,
    });

    let totalRevenue, newClientsRevenue, retentionRevenue, churnRevenue;

    try {
      [totalRevenue, newClientsRevenue, retentionRevenue, churnRevenue] =
        await Promise.all([
          sequelize.query(totalRevenueQuery, {
            replacements,
            type: QueryTypes.SELECT,
          }),
          sequelize.query(newClientsRevenueQuery, {
            replacements: replacementsNewClients,
            type: QueryTypes.SELECT,
          }),
          sequelize.query(retentionRevenueQuery, {
            replacements: replacementsRetention,
            type: QueryTypes.SELECT,
          }),
          sequelize.query(churnRevenueQuery, {
            replacements: replacementsChurn,
            type: QueryTypes.SELECT,
          }),
        ]);

      console.log('[getRevenueChart] Todas as queries executadas com sucesso', {
        totalRevenueCount: totalRevenue?.length || 0,
        newClientsRevenueCount: newClientsRevenue?.length || 0,
        retentionRevenueCount: retentionRevenue?.length || 0,
        churnRevenueCount: churnRevenue?.length || 0,
      });
    } catch (queryError) {
      console.error('[getRevenueChart] Erro nas queries:', queryError);
      throw queryError;
    }

    const dateMap = {};
    let current = startMoment.clone();

    while (current.isSameOrBefore(endMoment, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      dateMap[dateStr] = {
        date: dateStr,
        faturamento_total: 0,
        faturamento_novos_clientes: 0,
        faturamento_retencao: 0,
        total_churn: 0,
      };
      current.add(1, 'day');
    }

    if (Array.isArray(totalRevenue)) {
      totalRevenue.forEach((item) => {
        const dateStr = moment(item.date).format('YYYY-MM-DD');
        if (dateMap[dateStr]) {
          dateMap[dateStr].faturamento_total = Number(
            item.faturamento_total || 0,
          );
        }
      });
    }

    if (Array.isArray(newClientsRevenue)) {
      newClientsRevenue.forEach((item) => {
        const dateStr = moment(item.date).format('YYYY-MM-DD');
        if (dateMap[dateStr]) {
          dateMap[dateStr].faturamento_novos_clientes = Number(
            item.faturamento_novos_clientes || 0,
          );
        }
      });
    }

    if (Array.isArray(retentionRevenue)) {
      retentionRevenue.forEach((item) => {
        const dateStr = moment(item.date).format('YYYY-MM-DD');
        if (dateMap[dateStr]) {
          dateMap[dateStr].faturamento_retencao = Number(
            item.faturamento_retencao || 0,
          );
        }
      });
    }

    if (Array.isArray(churnRevenue)) {
      // O churn mostra a receita do período anterior dos clientes que estão em churn
      // Para o gráfico diário, vamos distribuir essa receita proporcionalmente pelos dias do período selecionado
      const totalChurnRevenue = churnRevenue.reduce(
        (acc, cur) => acc + (Number(cur.total_churn) || 0),
        0,
      );
      const totalDays = Object.keys(dateMap).length;
      const dailyChurnAverage =
        totalDays > 0 ? totalChurnRevenue / totalDays : 0;

      // Distribuir proporcionalmente pelos dias do período selecionado
      Object.keys(dateMap).forEach((dateStr) => {
        dateMap[dateStr].total_churn = dailyChurnAverage;
      });
    }

    const result = Object.values(dateMap).sort((a, b) =>
      moment(a.date).diff(moment(b.date)),
    );

    console.log('[getRevenueChart] Resultado final:', {
      resultCount: result?.length || 0,
      firstItem: result?.[0],
      lastItem: result?.[result?.length - 1],
    });

    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    console.error('[getRevenueChart] Erro:', error);
    console.error('[getRevenueChart] Stack:', error.stack);
    return res.status(500).json({
      message: 'Erro ao buscar dados do gráfico',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getContactStatusSummary = async (req, res) => {
  try {
    const { manager_id } = req.query;

    const replacements = {};
    if (manager_id) replacements.managerId = manager_id;

    // Buscar contagem de clientes por status de contato
    // Status: 1=NAO_CONTATADO, 2=EM_CONTATO, 3=EM_ACOMPANHAMENTO, 4=SEM_RETORNO, 5=CONCLUIDO
    const query = `
      SELECT 
        COALESCE(u.id_manager_status_contact, 1) AS status_id,
        COUNT(*) AS count
      FROM users u
      WHERE u.id_manager IS NOT NULL
      ${manager_id ? 'AND u.id_manager = :managerId' : ''}
      GROUP BY COALESCE(u.id_manager_status_contact, 1)
      ORDER BY status_id;
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
      raw: true,
    });

    // Mapear para o formato esperado
    // Mapeamento: 1=NAO_CONTATADO, 2=EM_CONTATO (Em andamento), 3=EM_ACOMPANHAMENTO, 4=SEM_RETORNO, 5=CONCLUIDO (Finalizado)
    const summary = {
      NAO_CONTATADO: 0,
      EM_ANDAMENTO: 0, // EM_CONTATO + EM_ACOMPANHAMENTO
      SEM_RETORNO: 0,
      FINALIZADO: 0, // CONCLUIDO
    };

    results.forEach((row) => {
      const statusId = Number(row.status_id) || 1;
      const count = Number(row.count) || 0;

      switch (statusId) {
        case 1: // NAO_CONTATADO
          summary.NAO_CONTATADO = count;
          break;
        case 2: // EM_CONTATO
        case 3: // EM_ACOMPANHAMENTO
          summary.EM_ANDAMENTO += count;
          break;
        case 4: // SEM_RETORNO
          summary.SEM_RETORNO = count;
          break;
        case 5: // CONCLUIDO
          summary.FINALIZADO = count;
          break;
      }
    });

    return res.status(200).json(summary);
  } catch (error) {
    console.error('[getContactStatusSummary] Erro:', error);
    return res.status(500).json({
      message: 'Erro ao buscar resumo de status de contato',
    });
  }
};

const getProducersWithoutManagerCard = async (req, res) => {
  try {
    // Buscar contagem de produtores sem gerente
    // Produtor = usuário que teve pelo menos uma venda de um produto seu
    const query = `
      SELECT COUNT(DISTINCT u.id) AS total
      FROM users u
      INNER JOIN products p ON p.id_user = u.id
      INNER JOIN sales_items si ON si.id_product = p.id AND si.id_status = 2
      WHERE (u.id_manager IS NULL AND (u.managers IS NULL OR u.managers = ''));
    `;

    const result = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      plain: true,
    });

    return res.status(200).json({
      total: Number(result?.total || 0),
    });
  } catch (error) {
    console.error('[getProducersWithoutManagerCard] Erro:', error);
    return res.status(500).json({
      message: 'Erro ao buscar contagem de produtores sem gerente',
    });
  }
};

const getProducersWithoutManagerList = async (req, res) => {
  try {
    const { page = 0, size = 10, search } = req.query;

    const replacements = {
      limit: Number(size),
      offset: Number(page) * Number(size),
      ...(search ? { search: `%${search}%` } : {}),
    };

    const listQuery = `
      SELECT DISTINCT
        u.id,
        u.uuid,
        u.full_name AS name,
        u.email,
        u.whatsapp AS phone,
        u.created_at,
        COALESCE(SUM(CASE WHEN si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS total_revenue,
        COUNT(DISTINCT p.id) AS total_products,
        COUNT(DISTINCT si.id_sale) AS total_sales
      FROM users u
      INNER JOIN products p ON p.id_user = u.id
      INNER JOIN sales_items si ON si.id_product = p.id AND si.id_status = 2
      LEFT JOIN commissions c ON c.id_sale_item = si.id
      WHERE (u.id_manager IS NULL AND (u.managers IS NULL OR u.managers = ''))
      ${search ? 'AND (u.full_name LIKE :search OR u.email LIKE :search)' : ''}
      GROUP BY u.id, u.uuid, u.full_name, u.email, u.whatsapp, u.created_at
      ORDER BY total_revenue DESC, u.created_at DESC
      LIMIT :limit OFFSET :offset;
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT u.id) AS total
      FROM users u
      INNER JOIN products p ON p.id_user = u.id
      INNER JOIN sales_items si ON si.id_product = p.id AND si.id_status = 2
      WHERE (u.id_manager IS NULL AND (u.managers IS NULL OR u.managers = ''))
      ${search ? 'AND (u.full_name LIKE :search OR u.email LIKE :search)' : ''};
    `;

    const [items, count] = await Promise.all([
      sequelize.query(listQuery, { replacements, type: QueryTypes.SELECT }),
      sequelize.query(countQuery, {
        replacements: { ...replacements, limit: undefined, offset: undefined },
        type: QueryTypes.SELECT,
        plain: true,
      }),
    ]);

    return res.status(200).json({
      items: items.map((item) => ({
        id: item.id,
        uuid: item.uuid,
        name: item.name,
        email: item.email,
        phone: item.phone,
        created_at: item.created_at,
        total_revenue: Number(item.total_revenue || 0),
        total_products: Number(item.total_products || 0),
        total_sales: Number(item.total_sales || 0),
      })),
      totalItems: Number(count?.total || 0),
      page: Number(page),
      size: Number(size),
    });
  } catch (error) {
    console.error('[getProducersWithoutManagerList] Erro:', error);
    return res.status(500).json({
      message: 'Erro ao listar produtores sem gerente',
    });
  }
};

const assignManagerToProducer = async (req, res) => {
  try {
    const { user_id, manager_id } = req.body;
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');

    if (!user_id) {
      return res.status(400).json({ message: 'user_id é obrigatório' });
    }

    if (manager_id === undefined) {
      return res.status(400).json({ message: 'manager_id é obrigatório' });
    }

    const finalManagerValue =
      manager_id === '' || manager_id === null ? null : manager_id;

    // Verificar se o usuário existe
    const user = await sequelize.models.users.findOne({
      where: { id: user_id },
      attributes: ['id', 'id_manager'],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Verificar se o manager existe (se foi informado)
    if (finalManagerValue) {
      const manager = await UsersBackoffice.findOne({
        where: { id: finalManagerValue, active: true },
      });

      if (!manager) {
        return res
          .status(404)
          .json({ message: 'Gerente não encontrado ou inativo' });
      }
    }

    const oldManagerId = user.id_manager;

    // Atualizar o manager
    await sequelize.models.users.update(
      { id_manager: finalManagerValue },
      { where: { id: user_id } },
    );

    // Criar log (se necessário)
    try {
      const {
        createLogBackoffice,
      } = require('../database/controllers/logs_backoffice');
      const { findUserEventTypeByKey } = require('../types/userEvents');
      const { id: id_user_backoffice } = req.user || {};

      if (id_user_backoffice) {
        await createLogBackoffice({
          id_user_backoffice,
          id_event: findUserEventTypeByKey('update-manager').id,
          params: {
            user_agent,
            old_values: {
              id_manager: oldManagerId,
            },
            new_values: {
              id_manager: finalManagerValue,
            },
          },
          ip_address,
          id_user: user_id,
        });
      }
    } catch (logError) {
      console.error('Erro ao criar log:', logError);
      // Não falhar a operação por causa do log
    }

    return res.status(200).json({
      success: true,
      message: 'Gerente vinculado com sucesso',
    });
  } catch (error) {
    console.error('[assignManagerToProducer] Erro:', error);
    return res.status(500).json({
      message: 'Erro ao vincular gerente ao produtor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getManagers,
  getRevenue,
  getCommission,
  updateManagerCommission,
  getClients,
  getClientsCards,
  getActiveClients,
  getNewClients,
  getProducers,
  getProducersList,
  getProducersSummary,
  getCalendar,
  getChurnCard,
  getChurnList,
  getRetentionCard,
  getRetentionList,
  getRevenueChart,
  getContactStatusSummary,
  getProducersWithoutManagerCard,
  getProducersWithoutManagerList,
  assignManagerToProducer,
  getClientsWithManagerCard,
  getClientsWithManagerList,
};
