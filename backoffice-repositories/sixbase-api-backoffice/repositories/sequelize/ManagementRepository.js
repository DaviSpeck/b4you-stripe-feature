const { QueryTypes } = require('sequelize');
const { sequelize } = require('../../database/models');
const { dateHelperTZ } = require('../../utils/helpers/date-tz');
const {
  managerPhaseTypes,
  findManagerPhaseTypeByKey,
  findManagerPhaseTypeById,
} = require('../../types/manager_phase');
const redis = require('../../config/redis');

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

const MANAGER_PHASE_IDS = {
  NOVOS_CLIENTES: 1,
  NEGOCIACAO: 2,
  IMPLEMENTACAO: 3,
  PRONTO_PARA_VENDER: 4,
};

async function getNewClientsData(params) {
  const { manager_id, search } = params;

  const tz = process.env.TZ || 'America/Sao_Paulo';
  const now = dateHelperTZ(undefined, tz).now();
  const thirtyDaysAgo = dateHelperTZ(now, tz)
    .subtract(30, 'days')
    .startOf('day')
    .add(3, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');

  let where = `
    u.id_manager IS NOT NULL
    AND u.created_at >= :thirtyDaysAgo
    AND u.manager_phase IS NULL
    AND (u.id_manager_status_contact IS NULL OR u.id_manager_status_contact != 6)
  `;
  if (manager_id) {
    where += `
      AND u.id_manager = :managerId
    `;
  }
  if (search)
    where += ` AND (u.full_name LIKE :search OR u.email LIKE :search)`;

  const query = `
    SELECT 
      u.id,
      u.uuid AS user_uuid,
      u.full_name AS name,
      u.email,
      u.created_at,
      u.manager_phase,
      u.manager_phase_updated_at,
      u.id_manager_status_contact,
      COALESCE(SUM(CASE WHEN c.created_at IS NOT NULL AND si.id_status = 2 AND c.id_role = 1 THEN c.amount END), 0) AS current_revenue,
      DATEDIFF(:now, u.created_at) AS days_since_created
    FROM users u
    LEFT JOIN products p ON p.id_user = u.id
    LEFT JOIN sales_items si ON si.id_product = p.id
    LEFT JOIN commissions c ON c.id_sale_item = si.id
    WHERE ${where}
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `;

  const replacements = {
    thirtyDaysAgo,
    now: now.format('YYYY-MM-DD HH:mm:ss'),
  };
  if (manager_id) replacements.managerId = manager_id;
  if (search) replacements.search = `%${search}%`;

  const rows = await sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT,
  });

  return rows.map((r) => ({
    id: r.id,
    user_uuid: r.user_uuid,
    name: r.name,
    email: r.email,
    created_at: r.created_at,
    manager_phase: r.manager_phase,
    manager_phase_updated_at: r.manager_phase_updated_at,
    current_revenue: Number(r.current_revenue) || 0,
    days_since_created: Number(r.days_since_created) || 0,
  }));
}

async function getPhaseClientsData(params) {
  let { manager_id, search, phase } = params;

  if (typeof phase === 'string' && /^\d+$/.test(phase)) {
    phase = Number(phase);
  }

  // phase pode ser string (key) ou number (id)
  let phaseId = phase;
  if (typeof phase === 'string') {
    const phaseType = findManagerPhaseTypeByKey(phase);
    if (!phaseType) return [];
    phaseId = phaseType.id;
  } else if (typeof phase === 'number') {
    const phaseType = findManagerPhaseTypeById(phase);
    if (!phaseType) return [];
    phaseId = phase;
  } else {
    return [];
  }

  let where = `
    u.id_manager IS NOT NULL
    AND u.manager_phase = :phase
    AND (u.id_manager_status_contact IS NULL OR u.id_manager_status_contact != 6)
  `;

  if (manager_id) {
    where += `
      AND u.id_manager = :managerId
    `;
  }
  if (search)
    where += ` AND (u.full_name LIKE :search OR u.email LIKE :search)`;

  const query = `
    SELECT 
      u.id,
      u.uuid AS user_uuid,
      u.full_name AS name,
      u.email,
      u.created_at,
      u.manager_phase,
      u.manager_phase_updated_at,
      u.id_manager_status_contact,
      COALESCE(SUM(CASE WHEN c.created_at IS NOT NULL AND si.id_status = 2 AND c.id_role = 1 THEN c.amount END), 0) AS current_revenue,
      DATEDIFF(:now, u.manager_phase_updated_at) AS days_in_phase
    FROM users u
    LEFT JOIN products p ON p.id_user = u.id
    LEFT JOIN sales_items si ON si.id_product = p.id
    LEFT JOIN commissions c ON c.id_sale_item = si.id
    WHERE ${where}
    GROUP BY u.id
    ORDER BY u.manager_phase_updated_at DESC
  `;

  const tz = process.env.TZ || 'America/Sao_Paulo';
  const now = dateHelperTZ(undefined, tz).now();

  const replacements = {
    phase: phaseId,
    now: now.format('YYYY-MM-DD HH:mm:ss'),
  };
  if (manager_id) replacements.managerId = manager_id;
  if (search) replacements.search = `%${search}%`;

  const rows = await sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT,
  });

  return rows.map((r) => ({
    id: r.id,
    user_uuid: r.user_uuid,
    name: r.name,
    email: r.email,
    created_at: r.created_at,
    manager_phase: r.manager_phase,
    manager_phase_updated_at: r.manager_phase_updated_at,
    current_revenue: Number(r.current_revenue) || 0,
    days_in_phase: r.manager_phase_updated_at
      ? Number(r.days_in_phase) || 0
      : null,
  }));
}

async function findManagementKanban(params) {
  let { manager_id, search, phase, page = 0, size = 10 } = params;

  if (typeof phase === 'string' && /^\d+$/.test(phase)) {
    phase = Number(phase);
  }

  const cacheKey = makeCacheKey('managementKanban', params);
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      console.warn(`[Redis] Valor corrompido no cache: ${cacheKey}`);
    }
  }

  // phase pode ser string (key) ou number (id)
  let allItems = [];
  if (typeof phase === 'string') {
    // if (phase === 'NOVOS_CLIENTES') {
    //   allItems = await getNewClientsData({ manager_id, search });
    // } else {
    const phaseType = findManagerPhaseTypeByKey(phase);
    if (!phaseType) {
      return { items: [], total: 0, page: Number(page), size: Number(size) };
    }
    allItems = await getPhaseClientsData({
      manager_id,
      search,
      phase: phaseType.id,
    });
    // }F
  } else if (typeof phase === 'number') {
    // if (phase === MANAGER_PHASE_IDS.NOVOS_CLIENTES) {
    //   allItems = await getNewClientsData({ manager_id, search });
    // } else {
    const phaseType = findManagerPhaseTypeById(phase);
    if (!phaseType) {
      return { items: [], total: 0, page: Number(page), size: Number(size) };
    }
    allItems = await getPhaseClientsData({ manager_id, search, phase });
    // }
  } else {
    return { items: [], total: 0, page: Number(page), size: Number(size) };
  }

  const offset = Number(page) * Number(size);
  const items = allItems.slice(offset, offset + Number(size));

  const result = {
    items,
    total: allItems.length,
    page: Number(page),
    size: Number(size),
  };

  await setCache(cacheKey, result);
  return result;
}

async function findManagementKanbanAll(params) {
  const { manager_id, search, page = 0, size = 10 } = params;

  const cacheKey = makeCacheKey('managementKanbanAll', params);
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      console.warn(`[Redis] Valor corrompido no cache: ${cacheKey}`);
    }
  }

  const [newClients, negociacao, implementacao, prontoParaVender] =
    await Promise.all([
      // getNewClientsData({ manager_id, search }),
      getPhaseClientsData({
        manager_id,
        search,
        phase: MANAGER_PHASE_IDS.NOVOS_CLIENTES,
      }),
      getPhaseClientsData({
        manager_id,
        search,
        phase: MANAGER_PHASE_IDS.NEGOCIACAO,
      }),
      getPhaseClientsData({
        manager_id,
        search,
        phase: MANAGER_PHASE_IDS.IMPLEMENTACAO,
      }),
      getPhaseClientsData({
        manager_id,
        search,
        phase: MANAGER_PHASE_IDS.PRONTO_PARA_VENDER,
      }),
    ]);

  const offset = Number(page) * Number(size);

  const result = {
    novos_clientes: {
      items: newClients.slice(offset, offset + Number(size)),
      total: newClients.length,
    },
    negociacao: {
      items: negociacao.slice(offset, offset + Number(size)),
      total: negociacao.length,
    },
    implementacao: {
      items: implementacao.slice(offset, offset + Number(size)),
      total: implementacao.length,
    },
    pronto_para_vender: {
      items: prontoParaVender.slice(offset, offset + Number(size)),
      total: prontoParaVender.length,
    },
  };

  await setCache(cacheKey, result);
  return result;
}

async function updateManagerPhase(params) {
  const { user_id, phase } = params;

  if (!user_id) {
    return {
      success: false,
      updated_rows: 0,
      message: 'user_id é obrigatório',
    };
  }

  // phase pode ser string (key), number (id) ou null/undefined
  let phaseId = null;
  if (phase !== null && phase !== undefined) {
    if (typeof phase === 'string') {
      const phaseType = findManagerPhaseTypeByKey(phase);
      if (!phaseType) {
        return {
          success: false,
          updated_rows: 0,
          message: 'Fase inválida',
          valid_options: managerPhaseTypes.map((p) => p.key),
        };
      }
      phaseId = phaseType.id;
    } else if (typeof phase === 'number') {
      const phaseType = findManagerPhaseTypeById(phase);
      if (!phaseType) {
        return {
          success: false,
          updated_rows: 0,
          message: 'Fase inválida',
          valid_options: managerPhaseTypes.map((p) => p.id),
        };
      }
      phaseId = phase;
    } else {
      return {
        success: false,
        updated_rows: 0,
        message: 'Tipo de fase inválido',
      };
    }
  }

  const updateData = {};
  if (phaseId !== null) {
    updateData.manager_phase = phaseId;
    updateData.manager_phase_updated_at = new Date();
  } else {
    // Remove a fase (quando clicar em "Pronto" no kanban Pronto para Vender)
    updateData.manager_phase = null;
    updateData.manager_phase_updated_at = null;
  }

  const [updatedRowsCount] = await sequelize.models.users.update(updateData, {
    where: { id: user_id },
    limit: 1,
  });

  const success = updatedRowsCount > 0;
  return {
    success,
    updated_rows: updatedRowsCount,
    message: success
      ? phase
        ? 'Fase atualizada com sucesso'
        : 'Fase removida com sucesso'
      : 'Usuário não encontrado',
  };
}

async function findManagementTable(params) {
  let {
    manager_id,
    search,
    phase,
    page = 0,
    size = 10,
    sortField,
    sortDirection,
  } = params;

  if (typeof phase === 'string' && /^\d+$/.test(phase)) {
    phase = Number(phase);
  }

  const cacheKey = makeCacheKey('managementTable', params);
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      console.warn(`[Redis] Valor corrompido no cache: ${cacheKey}`);
    }
  }

  let where = `
    u.id_manager IS NOT NULL
    AND (u.id_manager_status_contact IS NULL OR u.id_manager_status_contact != 6)
  `;

  if (phase === 'null' || phase === null) {
    // Filtro especial para "sem etapa" - clientes sem manager_phase
    where += ` AND u.manager_phase IS NULL`;
  } else if (phase) {
    let phaseId = phase;
    if (typeof phase === 'string') {
      const phaseType = findManagerPhaseTypeByKey(phase);
      if (!phaseType) {
        return { items: [], total: 0, page: Number(page), size: Number(size) };
      }
      phaseId = phaseType.id;
    } else if (typeof phase === 'number') {
      const phaseType = findManagerPhaseTypeById(phase);
      if (!phaseType) {
        return { items: [], total: 0, page: Number(page), size: Number(size) };
      }
      phaseId = phase;
    }
    where += ` AND u.manager_phase = :phase`;
  }
  // Se não há filtro de fase (phase é undefined), não adiciona filtro de manager_phase
  // Isso mostra todos os clientes (com e sem etapa)

  if (manager_id) {
    where += `
      AND u.id_manager = :managerId
    `;
  }

  if (search) {
    where += ` AND (u.full_name LIKE :search OR u.email LIKE :search)`;
  }

  // Ordenação
  let orderBy = 'u.manager_phase_updated_at DESC';
  if (sortField) {
    const direction = sortDirection === 'asc' ? 'ASC' : 'DESC';
    if (sortField === 'name') {
      orderBy = `u.full_name ${direction}`;
    } else if (sortField === 'current_revenue') {
      orderBy = `current_revenue ${direction}`;
    }
  }

  const query = `
    SELECT 
      u.id,
      u.uuid AS user_uuid,
      u.full_name AS name,
      u.email,
      u.created_at,
      u.manager_phase,
      u.manager_phase_updated_at,
      u.id_manager_status_contact,
      COALESCE(SUM(CASE WHEN c.created_at IS NOT NULL AND si.id_status = 2 AND c.id_role = 1 THEN c.amount END), 0) AS current_revenue,
      DATEDIFF(:now, COALESCE(u.manager_phase_updated_at, u.created_at)) AS days_in_phase
    FROM users u
    LEFT JOIN products p ON p.id_user = u.id
    LEFT JOIN sales_items si ON si.id_product = p.id
    LEFT JOIN commissions c ON c.id_sale_item = si.id
    WHERE ${where}
    GROUP BY u.id
    ORDER BY ${orderBy}
    LIMIT :limit OFFSET :offset
  `;

  const countQuery = `
    SELECT COUNT(DISTINCT u.id) as total
    FROM users u
    WHERE ${where}
  `;

  const tz = process.env.TZ || 'America/Sao_Paulo';
  const now = dateHelperTZ(undefined, tz).now();

  const replacements = {
    now: now.format('YYYY-MM-DD HH:mm:ss'),
    limit: Number(size),
    offset: Number(page) * Number(size),
  };

  // Adicionar phase aos replacements apenas se não for 'null' ou null
  if (phase && phase !== 'null' && phase !== null) {
    if (typeof phase === 'number') {
      replacements.phase = phase;
    } else if (typeof phase === 'string') {
      const phaseType = findManagerPhaseTypeByKey(phase);
      if (phaseType) {
        replacements.phase = phaseType.id;
      }
    }
  }

  if (phase) {
    let phaseId = phase;
    if (typeof phase === 'string') {
      const phaseType = findManagerPhaseTypeByKey(phase);
      if (phaseType) phaseId = phaseType.id;
    }
    replacements.phase = phaseId;
  }
  if (manager_id) replacements.managerId = manager_id;
  if (search) replacements.search = `%${search}%`;

  const rows = await sequelize.query(query, {
    replacements,
    type: QueryTypes.SELECT,
  });

  const countReplacements = { ...replacements };
  delete countReplacements.limit;
  delete countReplacements.offset;

  const countResults = await sequelize.query(countQuery, {
    replacements: countReplacements,
    type: QueryTypes.SELECT,
  });

  const total = Number(countResults[0]?.total || 0);
  const items = Array.isArray(rows) ? rows : [];

  const result = {
    items: items.map((r) => ({
      id: r.id,
      user_uuid: r.user_uuid,
      name: r.name,
      email: r.email,
      created_at: r.created_at,
      manager_phase: r.manager_phase,
      manager_phase_updated_at: r.manager_phase_updated_at,
      current_revenue: Number(r.current_revenue) || 0,
      days_in_phase: r.manager_phase_updated_at
        ? Number(r.days_in_phase) || 0
        : null,
    })),
    total,
    page: Number(page),
    size: Number(size),
  };

  await setCache(cacheKey, result);
  return result;
}

async function addClientToNovosClientes(params) {
  const { user_id, user_uuid, manager_id } = params;

  if (!user_id && !user_uuid) {
    return {
      success: false,
      updated_rows: 0,
      message: 'user_id ou user_uuid é obrigatório',
    };
  }

  if (!manager_id) {
    return {
      success: false,
      updated_rows: 0,
      message: 'manager_id é obrigatório',
    };
  }

  // Construir where clause baseado no que foi fornecido
  const whereClause = user_id ? { id: user_id } : { uuid: user_uuid };

  // Verificar se o usuário existe
  const user = await sequelize.models.users.findOne({
    where: whereClause,
    attributes: ['id', 'id_manager', 'managers', 'manager_phase'],
  });

  if (!user) {
    return {
      success: false,
      updated_rows: 0,
      message: 'Usuário não encontrado',
    };
  }

  // Usar o id do usuário encontrado
  const finalUserId = user.id;

  // Verificar se o gerente existe
  const UsersBackoffice = require('../../database/models/Users_backoffice');
  const manager = await UsersBackoffice.findOne({
    where: { id: manager_id, active: true },
    attributes: ['id'],
  });

  if (!manager) {
    return {
      success: false,
      updated_rows: 0,
      message: 'Gerente não encontrado ou inativo',
    };
  }

  // Vincular o gerente ao usuário e atualizar para fase Novos Clientes
  const [updatedRowsCount] = await sequelize.models.users.update(
    {
      id_manager: manager_id,
      manager_phase: MANAGER_PHASE_IDS.NOVOS_CLIENTES,
      manager_phase_updated_at: new Date(),
    },
    {
      where: { id: finalUserId },
      limit: 1,
    },
  );

  const success = updatedRowsCount > 0;
  return {
    success,
    updated_rows: updatedRowsCount,
    message: success
      ? 'Cliente vinculado ao gerente e adicionado a Novos Clientes com sucesso'
      : 'Erro ao adicionar cliente',
  };
}

async function checkUsersInWallet(params) {
  const { user_ids, user_uuids } = params;

  if (
    (!user_ids || user_ids.length === 0) &&
    (!user_uuids || user_uuids.length === 0)
  ) {
    return { usersInWallet: [] };
  }

  try {
    const whereConditions = [];
    const replacements = {};

    if (user_ids && user_ids.length > 0) {
      // Filtrar valores válidos e converter para números
      const validIds = user_ids
        .map((id) => {
          const numId = typeof id === 'string' ? parseInt(id, 10) : id;
          return isNaN(numId) ? null : numId;
        })
        .filter((id) => id !== null);

      if (validIds.length > 0) {
        whereConditions.push('u.id IN (:userIds)');
        replacements.userIds = validIds;
      }
    }

    if (user_uuids && user_uuids.length > 0) {
      // Filtrar valores válidos
      const validUuids = user_uuids.filter(
        (uuid) => uuid && uuid.trim() !== '',
      );

      if (validUuids.length > 0) {
        whereConditions.push('u.uuid IN (:userUuids)');
        replacements.userUuids = validUuids;
      }
    }

    if (whereConditions.length === 0) {
      return { usersInWallet: [] };
    }

    const whereClause = whereConditions.join(' OR ');

    const query = `
      SELECT 
        u.id,
        u.uuid,
        u.manager_phase
      FROM users u
      WHERE (${whereClause})
      AND u.manager_phase IS NOT NULL;
    `;

    const results = await sequelize.query(query, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return {
      usersInWallet: results.map((row) => ({
        id: Number(row.id) || null,
        uuid: row.uuid || null,
        manager_phase: row.manager_phase,
      })),
    };
  } catch (error) {
    console.error('[checkUsersInWallet] Erro:', error);
    return { usersInWallet: [] };
  }
}

module.exports = {
  findManagementKanban,
  findManagementKanbanAll,
  updateManagerPhase,
  findManagementTable,
  addClientToNovosClientes,
  checkUsersInWallet,
  MANAGER_PHASE_IDS,
};
