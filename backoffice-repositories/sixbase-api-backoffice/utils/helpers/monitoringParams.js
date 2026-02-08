const { dateHelperTZ } = require('./date-tz');

const MAX_PAGE_SIZE = 50;

function buildMonitoringParams(query, user, defaults = {}) {
  const tz = process.env.TZ || 'America/Sao_Paulo';

  const today = dateHelperTZ(undefined, tz).now();
  const end = query.end_date
    ? dateHelperTZ(query.end_date, tz).endOf('day')
    : null;
  const prevEnd = query.prev_end_date
    ? dateHelperTZ(query.prev_end_date, tz).endOf('day')
    : null;

  if ((end && end.isAfter(today)) || (prevEnd && prevEnd.isAfter(today))) {
    const error = new Error('Datas futuras não são permitidas');
    error.status = 400;
    throw error;
  }

  const role = String(user?.role || '').toUpperCase();

  let effectiveManagerId = undefined;

  // Se for COMERCIAL ou GERENTE, usar o ID do usuário como manager_id padrão
  if (role === 'COMERCIAL' || role === 'GERENTE') {
    effectiveManagerId = user?.id;
  }

  // Se manager_id for passado explicitamente na query, sobrescrever
  if (
    query.manager_id !== undefined &&
    query.manager_id !== null &&
    query.manager_id !== '' &&
    query.manager_id !== 'null'
  ) {
    effectiveManagerId = query.manager_id;
  }

  if (effectiveManagerId !== undefined) {
    effectiveManagerId = String(effectiveManagerId);
  }

  // 🔒 Proteção de paginação (evita travamento do back)
  const page =
    Number(query.page ?? defaults.page ?? 0) >= 0
      ? Number(query.page ?? defaults.page ?? 0)
      : 0;

  const requestedSize = Number(query.size ?? defaults.size ?? 10);
  const size = Math.min(
    Number.isFinite(requestedSize) && requestedSize > 0
      ? requestedSize
      : 10,
    MAX_PAGE_SIZE,
  );

  return {
    manager_id: effectiveManagerId,
    search: query.search || undefined,
    start_date: query.start_date || undefined,
    end_date: query.end_date || undefined,
    prev_start_date: query.prev_start_date || undefined,
    prev_end_date: query.prev_end_date || undefined,
    page,
    size,
    sort_field:
      query.sort_field || defaults.sort_field || 'variation_percentage',
    sort_direction: (
      query.sort_direction ||
      defaults.sort_direction ||
      'DESC'
    ).toUpperCase(),
    stage: query.stage || undefined,
  };
}

module.exports = { buildMonitoringParams };