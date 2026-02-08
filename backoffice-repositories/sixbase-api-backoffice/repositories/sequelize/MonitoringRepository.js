const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../database/models');
const { dateHelperTZ } = require('../../utils/helpers/date-tz');
const {
  findManagerStatusContactType,
  findManagerStatusContactTypeByKey,
} = require('../../types/manager_status_contact');
const redis = require('../../config/redis');
const { calculateStage } = require('../../utils/calculateStage');

const REDIS_TTL = 60;

async function setCache(key, value, ttl = REDIS_TTL) {
  try {
    const val = typeof value === 'string' ? value : JSON.stringify(value);
    await redis.set(key, val, { EX: ttl });
  } catch (err) {
    console.error('[Redis:setCache]', err.message);
  }
}

function makeCacheKey(prefix, params) {
  const filtered = { ...params };
  delete filtered.page;
  delete filtered.size;
  const sorted = Object.keys(filtered)
    .sort()
    .reduce((acc, k) => {
      acc[k] = filtered[k];
      return acc;
    }, {});
  return `${prefix}:${Buffer.from(JSON.stringify(sorted)).toString('base64')}`;
}

function shouldBlockNoCompleteDays(start, end, tz = 'America/Sao_Paulo') {
  const today = dateHelperTZ(undefined, tz).now();
  const isToday = (d) => d.isSame(today, 'day');

  if (!isToday(end)) return false;

  const monthStart = today.clone().startOf('month');

  if (start.isBefore(monthStart)) return false;

  if (today.date() === 1) return true;

  return false;
}

async function getBaseProducersData(params) {
  const {
    manager_id,
    search,
    start_date,
    end_date,
    prev_start_date,
    prev_end_date,
    stage,
    excludeRemovedFromFlow = false
  } = params;

  const tz = process.env.TZ || 'America/Sao_Paulo';
  const today = dateHelperTZ(undefined, tz);
  const now = today.now();

  const start = dateHelperTZ(start_date || today.startOf('month'), tz)
    .startOf('day')
    .add(3, 'hours');
  let end = end_date
    ? dateHelperTZ(end_date, tz).endOf('day').add(3, 'hours')
    : dateHelperTZ(undefined, tz)
      .subtract(1, 'day')
      .endOf('day')
      .add(3, 'hours');

  if (end.isSame(now, 'day')) end = end.subtract(1, 'day');

  const prevStart = dateHelperTZ(prev_start_date || start.format(), tz)
    .startOf('day')
    .add(3, 'hours');
  const prevEnd = dateHelperTZ(prev_end_date || end.format(), tz)
    .endOf('day')
    .add(3, 'hours');

  const startDateStr = start.format('YYYY-MM-DD HH:mm:ss');
  const endDateStr = end.format('YYYY-MM-DD HH:mm:ss');
  const prevStartStr = prevStart.format('YYYY-MM-DD HH:mm:ss');
  const prevEndStr = prevEnd.format('YYYY-MM-DD HH:mm:ss');
  const implementationThresholdStr = dateHelperTZ(end.format(), tz)
    .subtract(90, 'days')
    .format('YYYY-MM-DD HH:mm:ss');

  const newClientThresholdStr = dateHelperTZ(now, tz)
    .subtract(30, 'days')
    .startOf('day')
    .add(3, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');

  const todayEndOfDay = today.now().endOf('day').add(3, 'hours');
  const churnThresholdStr = dateHelperTZ(now, tz)
    .subtract(30, 'days')
    .startOf('day')
    .add(3, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
  const churnEndDateStr = todayEndOfDay.format('YYYY-MM-DD HH:mm:ss');

  const cacheKey = makeCacheKey('baseProducers', {
    manager_id,
    search,
    stage,
    startDateStr,
    endDateStr,
    prevStartStr,
    prevEndStr,
  });

  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      console.warn(`[Redis] Valor corrompido no cache: ${key}`);
    }
  }

  let where = `
    u.id_manager IS NOT NULL
  `;
  if (excludeRemovedFromFlow) {
    where += `
      AND (
        u.id_manager_status_contact IS NULL
        OR u.id_manager_status_contact != 6
      )
    `;
  }
  if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
    where += `
      AND u.id_manager = :managerId
    `;
  }
  if (search)
    where += ` AND (u.full_name LIKE :search OR u.email LIKE :search)`;

  const query = `
    WITH revenue_data AS (
      SELECT 
        u.id AS user_id,
        u.uuid AS user_uuid,
        u.full_name AS name,
        u.email,
        u.whatsapp AS phone,
        u.created_at,
        u.id_manager_status_contact,
        u.next_contact_date,
        COALESCE(SUM(CASE WHEN c.created_at BETWEEN :startDate AND :endDate 
                 AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS current_revenue,
        COALESCE(SUM(CASE WHEN c.created_at BETWEEN :prevStart AND :prevEnd 
                 AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS prev_revenue,
        COUNT(CASE WHEN c.created_at IS NOT NULL AND si.id_status = 2 AND c.id_role = 1 THEN 1 END) AS has_sales,
        COALESCE(SUM(CASE WHEN c.created_at >= :churnThreshold 
                 AND c.created_at <= :churnEndDate
                 AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_last_30_days,
        COALESCE(SUM(CASE WHEN c.created_at < :churnThreshold 
                 AND si.id_status = 2 AND c.id_role = 1 THEN c.amount ELSE 0 END), 0) AS revenue_before_30_days
      FROM users u
      LEFT JOIN products p ON p.id_user = u.id
      LEFT JOIN sales_items si ON si.id_product = p.id AND si.id_status = 2
      LEFT JOIN commissions c ON c.id_sale_item = si.id 
        AND c.id_role = 1
        AND (
          c.created_at BETWEEN :startDate AND :endDate
          OR c.created_at BETWEEN :prevStart AND :prevEnd
          OR (c.created_at >= :churnThreshold AND c.created_at <= :churnEndDate)
          OR c.created_at < :churnThreshold
        )
      WHERE ${where}
      GROUP BY u.id, u.uuid, u.full_name, u.email, u.whatsapp, u.created_at, u.id_manager_status_contact, u.next_contact_date
    )
    SELECT
      user_id AS id,
      user_uuid,
      name,
      email,
      phone,
      created_at,
      id_manager_status_contact,
      next_contact_date,
      COALESCE(current_revenue, 0) AS current_revenue,
      COALESCE(prev_revenue, 0) AS prev_revenue,
      COALESCE(revenue_before_30_days, 0) AS revenue_before_30_days,
      COALESCE(revenue_last_30_days, 0) AS revenue_last_30_days,
      ROUND(
        CASE 
          WHEN COALESCE(prev_revenue, 0) = 0 THEN 100
          ELSE (COALESCE(current_revenue, 0) - COALESCE(prev_revenue, 0)) 
               / COALESCE(prev_revenue, 0) * 100
        END, 2
      ) AS variation_percentage,
      CASE
        WHEN COALESCE(revenue_before_30_days, 0) > 0 AND COALESCE(revenue_last_30_days, 0) = 0 THEN 'CHURN'
        WHEN COALESCE(prev_revenue, 0) > 0 AND (
          (COALESCE(current_revenue, 0) - COALESCE(prev_revenue, 0)) 
          / NULLIF(prev_revenue, 0) * 100
        ) <= -30 THEN 'DROP'
        WHEN COALESCE(prev_revenue, 0) > 0 AND (
          (COALESCE(current_revenue, 0) - COALESCE(prev_revenue, 0)) 
          / NULLIF(prev_revenue, 0) * 100
        ) >= -10 THEN 'HEALTHY'
        ELSE 'ATTENTION'
      END AS stage,
      CASE WHEN created_at >= :newClientThreshold THEN 1 ELSE 0 END AS is_new_client,
      CASE WHEN has_sales > 0 THEN 1 ELSE 0 END AS is_active_client,
      DATEDIFF(:endDate, created_at) AS days_since_created
    FROM revenue_data
    WHERE (
      (COALESCE(revenue_before_30_days, 0) > 0 AND COALESCE(revenue_last_30_days, 0) = 0)
      OR COALESCE(prev_revenue, 0) > 0
    )
    ${stage
      ? `AND (
      CASE
        WHEN COALESCE(revenue_before_30_days, 0) > 0 AND COALESCE(revenue_last_30_days, 0) = 0 THEN 'CHURN'
        WHEN COALESCE(prev_revenue, 0) > 0 AND (
          (COALESCE(current_revenue, 0) - COALESCE(prev_revenue, 0)) 
          / NULLIF(prev_revenue, 0) * 100
        ) <= -30 THEN 'DROP'
        WHEN COALESCE(prev_revenue, 0) > 0 AND (
          (COALESCE(current_revenue, 0) - COALESCE(prev_revenue, 0)) 
          / NULLIF(prev_revenue, 0) * 100
        ) >= -10 THEN 'HEALTHY'
        ELSE 'ATTENTION'
      END
    ) = :stage`
      : ''
    };
  `;

  const replacements = {
    startDate: startDateStr,
    endDate: endDateStr,
    prevStart: prevStartStr,
    prevEnd: prevEndStr,
    implementationThreshold: implementationThresholdStr,
    newClientThreshold: newClientThresholdStr,
    churnThreshold: churnThresholdStr,
    churnEndDate: churnEndDateStr,
  };
  if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
    replacements.managerId = manager_id;
  }
  if (search) replacements.search = `%${search}%`;
  if (stage) replacements.stage = stage;

  const rows = await sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT,
  });

  const processed = rows.map((r) => {
    const statusId = r.id_manager_status_contact || 0;
    const statusObj = findManagerStatusContactType(statusId);
    const statusKey = statusObj?.key || 'NAO_CONTATADO';
    return {
      ...r,
      contact_status: statusKey,
      is_new_client: r.is_new_client === 1,
      is_active_client: r.is_active_client === 1,
    };
  });

  await setCache(cacheKey, processed);
  return processed;
}

async function getBaseProducersDataForChurn(params) {
  const {
    manager_id,
    search,
    start_date,
    end_date,
    prev_start_date,
    prev_end_date,
  } = params;

  const tz = process.env.TZ || 'America/Sao_Paulo';

  const start = dateHelperTZ(start_date, tz).startOf('day').add(3, 'hours');
  const end = dateHelperTZ(end_date, tz).endOf('day').add(3, 'hours');
  const prevStart = dateHelperTZ(prev_start_date, tz)
    .startOf('day')
    .add(3, 'hours');
  const prevEnd = dateHelperTZ(prev_end_date, tz).endOf('day').add(3, 'hours');

  const startDateStr = start.format('YYYY-MM-DD HH:mm:ss');
  const endDateStr = end.format('YYYY-MM-DD HH:mm:ss');
  const prevStartStr = prevStart.format('YYYY-MM-DD HH:mm:ss');
  const prevEndStr = prevEnd.format('YYYY-MM-DD HH:mm:ss');

  const today = dateHelperTZ(undefined, tz).now();
  const churnThresholdStr = today
    .clone()
    .subtract(30, 'days')
    .startOf('day')
    .add(3, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');

  const churnEndDateStr = today
    .endOf('day')
    .add(3, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');

  let where = `
    u.id_manager IS NOT NULL
    AND (
      u.id_manager_status_contact IS NULL
      OR u.id_manager_status_contact != 6
    )
  `;

  if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
    where += `
      AND u.id_manager = :managerId
    `;
  }

  if (search)
    where += ` AND (u.full_name LIKE :search OR u.email LIKE :search)`;

  const query = `
    WITH revenue_data AS (
      SELECT 
        u.id AS user_id,
        u.uuid AS user_uuid,
        u.full_name AS name,
        u.email,
        u.whatsapp AS phone,
        u.created_at,
        
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
      LEFT JOIN products p ON p.id_user = u.id
      LEFT JOIN sales_items si ON si.id_product = p.id AND si.id_status = 2
      LEFT JOIN commissions c ON c.id_sale_item = si.id 
        AND c.id_role = 1
        AND (
          c.created_at BETWEEN :startDate AND :endDate
          OR c.created_at BETWEEN :prevStart AND :prevEnd
          OR (c.created_at >= :churnThreshold AND c.created_at <= :churnEndDate)
          OR c.created_at < :churnThreshold
        )
      WHERE ${where}
      GROUP BY u.id, u.uuid, u.full_name, u.email, u.whatsapp, u.created_at
    )
    SELECT
      user_id AS id,
      user_uuid,
      name,
      email,
      phone,
      created_at,
      COALESCE(current_revenue, 0) AS current_revenue,
      COALESCE(prev_revenue, 0) AS prev_revenue,
      COALESCE(revenue_before_30_days, 0) AS revenue_before_30_days,
      COALESCE(revenue_last_30_days, 0) AS revenue_last_30_days,
      CASE
        WHEN COALESCE(revenue_before_30_days, 0) > 0 
         AND COALESCE(revenue_last_30_days, 0) = 0 THEN 'CHURN'
        ELSE 'ACTIVE'
      END AS stage
    FROM revenue_data;
  `;

  const replacements = {
    startDate: startDateStr,
    endDate: endDateStr,
    prevStart: prevStartStr,
    prevEnd: prevEndStr,
    churnThreshold: churnThresholdStr,
    churnEndDate: churnEndDateStr,
  };

  if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
    replacements.managerId = manager_id;
  }
  if (search) replacements.search = `%${search}%`;

  return sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT,
  });
}

async function findSingleProducerStage(params) {
  try {
    const tz = process.env.TZ || 'America/Sao_Paulo';

    const start = dateHelperTZ(params.start_date, tz)
      .startOf('day')
      .add(3, 'hours');

    const end = dateHelperTZ(params.end_date, tz).endOf('day').add(3, 'hours');

    const prevStart = dateHelperTZ(params.prev_start_date, tz)
      .startOf('day')
      .add(3, 'hours');

    const prevEnd = dateHelperTZ(params.prev_end_date, tz)
      .endOf('day')
      .add(3, 'hours');

    if (shouldBlockNoCompleteDays(start, end, tz)) {
      return {
        user_id: params.user_id,
        stage: null,
        current_revenue: 0,
        prev_revenue: 0,
        variation_percentage: 0,
        meta: {
          no_complete_days: true,
          note: 'Sem dias completos para o mês corrente (regra N-1).',
        },
      };
    }

    function isUUID(value) {
      return typeof value === 'string' && /^[0-9a-fA-F-]{36}$/.test(value);
    }

    const where = isUUID(params.user_id)
      ? { uuid: params.user_id }
      : { id: params.user_id };

    const producer = await sequelize.models.users.findOne({
      where,
      attributes: ['id', 'uuid', 'id_manager_status_contact', 'manager_phase'],
      raw: true,
    });

    if (!producer) {
      return { message: 'Producer not found', stage: null };
    }

    async function sumRevenue(startDate, endDate) {
      const result = await sequelize.query(
        `
          SELECT 
            COALESCE(SUM(c.amount), 0) AS total
          FROM commissions c
          INNER JOIN sales_items si 
            ON si.id = c.id_sale_item
          AND si.id_status = 2
          WHERE c.id_role = 1
            AND c.id_user = :user
            AND c.created_at BETWEEN :start AND :end
        `,
        {
          replacements: {
            user: params.user_id,
            start: startDate.format('YYYY-MM-DD HH:mm:ss'),
            end: endDate.format('YYYY-MM-DD HH:mm:ss'),
          },
          type: QueryTypes.SELECT,
        },
      );

      return Number(result[0]?.total || 0);
    }

    const current = await sumRevenue(start, end);
    const previous = await sumRevenue(prevStart, prevEnd);

    const variation =
      previous > 0 ? ((current - previous) / previous) * 100 : 100;

    const stage = calculateStage({
      current_revenue: current,
      prev_revenue: previous,
      variation_percentage: variation,
    });

    // Converter id_manager_status_contact para contact_status (string)
    const statusMap = {
      1: 'NAO_CONTATADO',
      2: 'EM_CONTATO',
      3: 'EM_ACOMPANHAMENTO',
      4: 'SEM_RETORNO',
      5: 'CONCLUIDO',
      6: 'CONCLUIDO_REMOVIDO',
    };

    const contact_status = producer.id_manager_status_contact
      ? statusMap[producer.id_manager_status_contact] || 'NAO_CONTATADO'
      : 'NAO_CONTATADO';

    return {
      user_id: params.user_id,
      id: producer.id,
      uuid: producer.uuid,
      stage,
      variation_percentage: variation,
      current_revenue: current,
      prev_revenue: previous,
      id_manager_status_contact: producer.id_manager_status_contact || null,
      contact_status,
      manager_phase: producer.manager_phase || null,
    };
  } catch (err) {
    console.error('[findSingleProducerStage] Error:', err);
    throw err;
  }
}

async function findProducersPerformance(params) {
  const tz = process.env.TZ || 'America/Sao_Paulo';

  const start_tz = dateHelperTZ(params.start_date, tz)
    .startOf('day')
    .add(3, 'hours');
  const end_tz = dateHelperTZ(params.end_date, tz).endOf('day').add(3, 'hours');

  if (shouldBlockNoCompleteDays(start_tz, end_tz, tz))
    return {
      items: [],
      total: 0,
      meta: {
        no_complete_days: true,
        note: 'Sem dias completos para o mês corrente (regra N-1).',
      },
    };

  const cacheKey = makeCacheKey('perf', params);
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      console.warn(`[Redis] Valor corrompido no cache: ${key}`);
    }
  }

  const sortField = ['variation_percentage', 'current_revenue'].includes(
    params.sort_field,
  )
    ? params.sort_field
    : 'variation_percentage';
  const sortDir =
    String(params.sort_direction || 'DESC').toUpperCase() === 'ASC'
      ? 'ASC'
      : 'DESC';

  const MAX_PAGE_SIZE = 50;

  params.size = Math.min(Number(params.size) || 10, MAX_PAGE_SIZE);
  params.page = Math.max(Number(params.page) || 0, 0);

  const offset = params.page * params.size;

  const baseData = await getBaseProducersData(params);

  const sortedData = baseData.sort((a, b) => {
    // Sempre priorizar clientes com status "Não contatado"
    const aIsNaoContatado = a.contact_status === 'NAO_CONTATADO';
    const bIsNaoContatado = b.contact_status === 'NAO_CONTATADO';

    if (aIsNaoContatado && !bIsNaoContatado) return -1;
    if (!aIsNaoContatado && bIsNaoContatado) return 1;

    // Se ambos têm o mesmo status de contato, aplicar ordenação normal
    return sortDir === 'ASC'
      ? a[sortField] - b[sortField]
      : b[sortField] - a[sortField];
  });

  const items = sortedData.slice(offset, offset + Number(params.size));

  const result = {
    producers: items,
    total: baseData.length,
    page: params.page || 0,
    size: params.size || items.length,
  };
  await setCache(cacheKey, result);
  return result;
}

async function findProducersSummary(params) {
  const tz = process.env.TZ || 'America/Sao_Paulo';

  const start_tz = dateHelperTZ(params.start_date, tz)
    .startOf('day')
    .add(3, 'hours');
  const end_tz = dateHelperTZ(params.end_date, tz).endOf('day').add(3, 'hours');

  if (shouldBlockNoCompleteDays(start_tz, end_tz, tz)) {
    return {
      DROP: 0,
      HEALTHY: 0,
      ATTENTION: 0,
      CHURN: 0,
      meta: {
        no_complete_days: true,
        note: 'Sem dias completos para o mês corrente (regra N-1).',
      },
    };
  }

  const cacheKey = makeCacheKey('summary', params);
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      console.warn(`[Redis] Valor corrompido no cache: ${key}`);
    }
  }

  const producers = await getBaseProducersData(params);

  const counts = {
    DROP: 0,
    HEALTHY: 0,
    ATTENTION: 0,
    CHURN: 0,
  };
  for (const p of producers) {
    const stage = p.stage || 'ATTENTION';
    counts[stage] = (counts[stage] || 0) + 1;
  }

  await setCache(cacheKey, counts);
  return counts;
}

async function findProducersKanban(params) {
  const {
    manager_id,
    search,
    stage,
    page = 0,
    size = 5,
    start_date,
    end_date,
    prev_start_date,
    prev_end_date,
  } = params;

  const tz = process.env.TZ || 'America/Sao_Paulo';

  const start_tz = dateHelperTZ(start_date, tz).startOf('day').add(3, 'hours');
  const end_tz = dateHelperTZ(end_date, tz).endOf('day').add(3, 'hours');

  if (shouldBlockNoCompleteDays(start_tz, end_tz, tz)) {
    return {
      items: [],
      total: 0,
      meta: {
        no_complete_days: true,
        note: 'Sem dias completos para o mês corrente (regra N-1).',
      },
    };
  }

  const cacheKey = makeCacheKey('kanban', params);
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      console.warn(`[Redis] Valor corrompido no cache: ${key}`);
    }
  }

  const today = dateHelperTZ(undefined, tz);
  const now = today.now();

  const start = dateHelperTZ(start_date || today.startOf('month'), tz)
    .startOf('day')
    .add(3, 'hours');
  let end = end_date
    ? dateHelperTZ(end_date, tz).endOf('day').add(3, 'hours')
    : dateHelperTZ(undefined, tz)
      .subtract(1, 'day')
      .endOf('day')
      .add(3, 'hours');

  if (end.isSame(now, 'day')) end = end.subtract(1, 'day');

  const prevStart = dateHelperTZ(prev_start_date || start.format(), tz)
    .startOf('day')
    .add(3, 'hours');
  const prevEnd = dateHelperTZ(prev_end_date || end.format(), tz)
    .endOf('day')
    .add(3, 'hours');

  const startDateStr = start.format('YYYY-MM-DD HH:mm:ss');
  const endDateStr = end.format('YYYY-MM-DD HH:mm:ss');
  const prevStartStr = prevStart.format('YYYY-MM-DD HH:mm:ss');
  const prevEndStr = prevEnd.format('YYYY-MM-DD HH:mm:ss');
  const implementationThresholdStr = dateHelperTZ(end.format(), tz)
    .subtract(90, 'days')
    .format('YYYY-MM-DD HH:mm:ss');

  let where = `
    u.id_manager IS NOT NULL
  `;
  if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
    where += `
      AND u.id_manager = :managerId
    `;
  }
  if (search)
    where += ' AND (u.full_name LIKE :search OR u.email LIKE :search)';

  const replacements = {
    startDate: startDateStr,
    endDate: endDateStr,
    prevStart: prevStartStr,
    prevEnd: prevEndStr,
    implementationThreshold: implementationThresholdStr,
    limit: Number(size),
    offset: Number(page) * Number(size),
  };
  if (manager_id !== undefined && manager_id !== null && manager_id !== '') {
    replacements.managerId = manager_id;
  }
  if (search) replacements.search = `%${search}%`;
  if (stage) replacements.stage = stage;

  const baseData = await getBaseProducersData({
    manager_id,
    search,
    start_date,
    end_date,
    prev_start_date,
    prev_end_date,
    excludeRemovedFromFlow: true
  });

  const filtered = stage
    ? baseData.filter((item) => item.stage === stage)
    : baseData;

  const sorted = filtered.sort((a, b) => b.current_revenue - a.current_revenue);

  const MAX_PAGE_SIZE = 50;

  params.size = Math.min(Number(params.size) || 10, MAX_PAGE_SIZE);
  params.page = Math.max(Number(params.page) || 0, 0);

  const offset = params.page * params.size;

  const items = sorted.slice(offset, offset + params.size);

  const result = {
    items: items.map((item) => ({
      id: item.id,
      user_uuid: item.user_uuid,
      name: item.name,
      email: item.email,
      created_at: item.created_at,
      current_revenue: item.current_revenue,
      prev_revenue: item.prev_revenue,
      variation_percentage: item.variation_percentage,
      stage: item.stage,
      contact_status: item.contact_status,
      is_new_client: item.is_new_client,
      is_active_client: item.is_active_client,
      days_since_created: item.days_since_created,
    })),
    total: filtered.length,
  };

  await setCache(cacheKey, result);
  return result;
}

async function findProducersKanbanAll(params) {
  const {
    manager_id,
    search,
    start_date,
    end_date,
    prev_start_date,
    prev_end_date,
    page = 0,
    size = 5,
  } = params;

  const tz = process.env.TZ || 'America/Sao_Paulo';

  const start_tz = dateHelperTZ(start_date, tz).startOf('day').add(3, 'hours');
  const end_tz = dateHelperTZ(end_date, tz).endOf('day').add(3, 'hours');

  if (shouldBlockNoCompleteDays(start_tz, end_tz, tz)) {
    return {
      items_by_stage: {
        HEALTHY: [],
        ATTENTION: [],
        DROP: [],
        CHURN: [],
      },
      total_by_stage: {
        HEALTHY: 0,
        ATTENTION: 0,
        DROP: 0,
        CHURN: 0,
      },
      meta: {
        no_complete_days: true,
        note: 'Sem dias completos para o mês corrente (regra N-1).',
      },
    };
  }

  const cacheKey = makeCacheKey('kanbanAll', params);
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      console.warn(`[Redis] Valor corrompido no cache: ${key}`);
    }
  }

  const allItems = await getBaseProducersData(params);

  const grouped = {
    HEALTHY: [],
    ATTENTION: [],
    DROP: [],
    CHURN: [],
  };
  for (const item of allItems) {
    if (item.stage && grouped[item.stage]) {
      grouped[item.stage].push(item);
    }
  }

  const total_by_stage = Object.fromEntries(
    Object.entries(grouped).map(([stage, items]) => [stage, items.length]),
  );

  const items_by_stage = Object.fromEntries(
    Object.entries(grouped).map(([stage, items]) => {

      const MAX_PAGE_SIZE = 50;

      params.size = Math.min(Number(params.size) || 10, MAX_PAGE_SIZE);
      params.page = Math.max(Number(params.page) || 0, 0);

      const offset = params.page * params.size;

      const paged = items
        .sort((a, b) => b.current_revenue - a.current_revenue)
        .slice(offset, offset + Number(params.size));
      return [stage, paged];
    }),
  );

  const result = {
    items_by_stage,
    total_by_stage,
  };
  await setCache(cacheKey, result);
  return result;
}

async function findChurnCard(params) {
  const allItems = await getBaseProducersDataForChurn(params);

  const churnItems = allItems.filter((i) => i.stage === 'CHURN');

  return {
    cardCount: churnItems.length,
    cardRevenueLoss: churnItems.reduce(
      (acc, cur) => acc + (cur.prev_revenue || 0),
      0,
    ),
  };
}

async function findChurnPaginated(params) {
  const { page = 0, size = 10 } = params;

  const allItems = await getBaseProducersDataForChurn(params);

  const churnItems = allItems.filter((i) => i.stage === 'CHURN');

  const sorted = churnItems.sort(
    (a, b) => (b.prev_revenue || 0) - (a.prev_revenue || 0),
  );

  const MAX_PAGE_SIZE = 50;

  params.size = Math.min(Number(params.size) || 10, MAX_PAGE_SIZE);
  params.page = Math.max(Number(params.page) || 0, 0);

  const offset = params.page * params.size;

  return {
    items: sorted.slice(offset, offset + params.size),
    totalItems: churnItems.length,
    page: params.page,
    size: params.size,
  };
}

async function updateContactStatus(params) {
  const { user_id, contact_status, next_contact_date } = params;

  if (!user_id || !contact_status) {
    return {
      success: false,
      updated_rows: 0,
      message: 'user_id e contact_status são obrigatórios',
    };
  }

  const status = findManagerStatusContactTypeByKey(String(contact_status));
  const idStatus = status?.id || null;

  if (!idStatus) {
    return {
      success: false,
      updated_rows: 0,
      message: 'Status de contato inválido',
    };
  }

  const start = Date.now();

  const updateData = { id_manager_status_contact: idStatus };
  if (next_contact_date !== undefined) {
    updateData.next_contact_date = next_contact_date
      ? new Date(next_contact_date)
      : null;
  }

  const [updatedRowsCount] = await sequelize.models.users.update(updateData, {
    where: { id: user_id },
    limit: 1,
  });

  const duration = Date.now() - start;
  if (duration > 100) {
    console.warn(
      `[MonitoringRepo:updateContactStatus] Execução lenta (${duration}ms)`,
      {
        user_id,
        contact_status,
      },
    );
  }

  const success = updatedRowsCount > 0;
  return {
    success,
    updated_rows: updatedRowsCount,
    message: success
      ? 'Status atualizado com sucesso'
      : 'Usuário não encontrado',
  };
}

module.exports = {
  getBaseProducersData,
  findSingleProducerStage,
  findProducersPerformance,
  findProducersSummary,
  findProducersKanban,
  findProducersKanbanAll,
  updateContactStatus,
  findChurnCard,
  findChurnPaginated,
};
