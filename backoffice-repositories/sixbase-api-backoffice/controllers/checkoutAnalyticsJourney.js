const dateHelper = require('../utils/helpers/date');
const logger = require('../utils/logger');
const redis = require('../config/redis');
const CheckoutAnalyticsJourneyRepository = require('../repositories/sequelize/CheckoutAnalyticsJourneyRepository');
const JourneyService = require('../services/checkout/analytics/journey/journey.service');
const OfferContextService = require('../services/checkout/analytics/journey/offerContext.service');
const {
  isNonProdEnvironmentValue,
  isProductionEnvironment,
} = require('../utils/analyticsEnvironment');
const {
  FUNNEL_STEPS,
  STEP_DEFINITIONS,
} = require('../services/checkout/analytics/journey/journey.constants');

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_CACHE_TTL_SECONDS = 60;
const TTL_BY_ENDPOINT = {
  '/checkout/analytics/journey/summary': 120,
  '/checkout/analytics/journey/funnel': 120,
  '/checkout/analytics/journey/steps': 120,
  '/checkout/analytics/journey/payment-methods': 180,
  '/checkout/analytics/journey/distribution': 180,
  '/checkout/analytics/journey/breakdowns': 120,
  '/checkout/analytics/journey/products': 60,
  '/checkout/analytics/journey/producers': 60,
  '/checkout/analytics/journey/domains': 60,
  '/checkout/analytics/journey/sessions': 30,
};

const repository = new CheckoutAnalyticsJourneyRepository();
const offerContextService = new OfferContextService();
const journeyService = new JourneyService(repository, offerContextService);

const sanitizeString = (value) => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  return str.length > 0 ? str : null;
};

const sanitizeNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const parseBooleanFilter = (value) => {
  if (value === true || value === false) return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return null;
};

const parseNumberFilter = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeDateRange = ({ start_date, end_date }) => {
  if (!start_date || !end_date) {
    return null;
  }

  const startDate = dateHelper(start_date);
  const endDate = dateHelper(end_date);

  if (!startDate.isValid() || !endDate.isValid()) {
    return null;
  }

  return {
    start_ms: startDate.startOf('day').utc().valueOf(),
    end_ms: endDate.endOf('day').utc().valueOf(),
    start_date,
    end_date,
  };
};

const normalizePagination = ({ page, page_size }) => {
  const normalizedPage = Number(page || 1);
  const normalizedSize = Number(page_size || DEFAULT_PAGE_SIZE);

  if (!Number.isInteger(normalizedPage) || normalizedPage < 1) {
    return null;
  }

  if (!Number.isInteger(normalizedSize) || normalizedSize < 1) {
    return null;
  }

  return {
    page: normalizedPage,
    page_size: Math.min(normalizedSize, MAX_PAGE_SIZE),
    limit: Math.min(normalizedSize, MAX_PAGE_SIZE),
    offset: (normalizedPage - 1) * Math.min(normalizedSize, MAX_PAGE_SIZE),
  };
};

const normalizeFilters = (body) => {
  const dateRange = normalizeDateRange(body);
  if (!dateRange) {
    return null;
  }

  const executionEnvironment = sanitizeString(
    body.environment || body.execution_environment,
  );
  const checkoutMode = sanitizeString(body.checkout_mode);

  return {
    ...dateRange,
    offer_id: sanitizeString(body.offer_id),
    product_id: sanitizeString(body.product_id),
    producer_id: sanitizeString(body.producer_id),
    checkout_type: sanitizeString(body.checkout_type),
    checkout_mode:
      isProductionEnvironment && isNonProdEnvironmentValue(checkoutMode)
        ? null
        : checkoutMode,
    payment_method: sanitizeString(body.payment_method),
    execution_environment: isProductionEnvironment
      ? 'production'
      : executionEnvironment,
    root_domain: sanitizeString(
      body.root_domain || body.domain || body.full_hostname,
    ),
    has_success: parseBooleanFilter(body.has_success),
    has_error: parseBooleanFilter(body.has_error),
  };
};

const buildCacheKey = (endpoint, filters, body = {}) => {
  const pagination = normalizePagination(body) || {
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
  };

  return [
    'checkoutJourney',
    endpoint,
    pagination.page,
    pagination.page_size,
    filters.start_date,
    filters.end_date,
    filters.offer_id || '-',
    filters.product_id || '-',
    filters.producer_id || '-',
    filters.checkout_type || '-',
    filters.checkout_mode || '-',
    filters.payment_method || '-',
    filters.execution_environment || '-',
    filters.root_domain || '-',
    filters.has_success ?? '-',
    filters.has_error ?? '-',
  ].join(':');
};

const logQuery = (endpoint, filters, durationMs) => {
  logger.info({
    type: 'CHECKOUT_ANALYTICS_QUERY',
    endpoint,
    range: {
      start_date: filters.start_date,
      end_date: filters.end_date,
    },
    filters: {
      offer_id: filters.offer_id,
      product_id: filters.product_id,
      producer_id: filters.producer_id,
      checkout_type: filters.checkout_type,
      checkout_mode: filters.checkout_mode,
      payment_method: filters.payment_method,
      environment: filters.execution_environment,
      root_domain: filters.root_domain,
      has_success: filters.has_success,
      has_error: filters.has_error,
    },
    duration_ms: durationMs,
  });
};

const logError = (endpoint, error) => {
  logger.error({
    type: 'CHECKOUT_ANALYTICS_ERROR',
    endpoint,
    error: error.message,
    stack: error.stack,
  },
  );
};

const SLOW_QUERY_MS = 300;

const handleJourneyRequest = (
  endpoint,
  emptyResponse,
  handler,
  defaultCacheTtlSeconds = DEFAULT_CACHE_TTL_SECONDS,
) =>
  async (req, res) => {
    if (!req.is('application/json')) {
      return res.status(200).send(emptyResponse);
    }

    const filters =
      req._journeyFilters ??
      (req._journeyFilters = normalizeFilters(req.body || {}));

    if (!filters) {
      return res.status(200).send(emptyResponse);
    }

    const cacheKey = buildCacheKey(endpoint, filters, req.body || {});
    const startTime = Date.now();

    try {
      const cachedRaw = await redis.get(cacheKey);
      if (cachedRaw) {
        return res.status(200).send(JSON.parse(cachedRaw));
      }
    } catch (error) {
      logger.warn(
        JSON.stringify({
          type: 'CHECKOUT_ANALYTICS_CACHE_WARN',
          endpoint,
          phase: 'get',
          error: error.message,
        }),
      );
    }

    try {
      const result = await handler(filters, req.body || {});
      const durationMs = Date.now() - startTime;

      if (durationMs > SLOW_QUERY_MS) {
        logQuery(endpoint, filters, durationMs);
      }

      const ttl = TTL_BY_ENDPOINT[endpoint] ?? defaultCacheTtlSeconds;

      try {
        await redis.set(cacheKey, JSON.stringify(result), ttl);
      } catch (error) {
        logger.warn({
          type: 'CHECKOUT_ANALYTICS_CACHE_WARN',
          endpoint,
          phase: 'set',
          error: error.message,
        },
        );
      }

      return res.status(200).send(result);
    } catch (error) {
      logError(endpoint, error);
      return res.status(200).send(emptyResponse);
    }
  };

const emptySummary = {
  total_sessions: 0,
  total_events: 0,
  success_sessions: 0,
  conversion_success_sessions: 0,
  payment_success_sessions: 0,
  error_sessions: 0,
};

const emptyFunnel = {
  steps: FUNNEL_STEPS.map((step) => ({
    event_name: step.event_name,
    label: step.label,
    sessions: 0,
  })),
};

const emptySteps = {
  steps: STEP_DEFINITIONS.map((definition) => ({
    step: definition.step,
    started: 0,
    completed: 0,
    errors: 0,
  })),
};

const emptyPaymentMethods = { items: [] };

const emptyDistribution = { checkout_type: [], checkout_mode: [] };

const emptyBreakdowns = {
  by_checkout_type: [],
  by_checkout_mode: [],
  by_payment_method: [],
};

const emptyPaginated = (pagination) => ({
  items: [],
  page: pagination?.page || 1,
  page_size: pagination?.page_size || DEFAULT_PAGE_SIZE,
  total: 0,
});

module.exports.getJourneySummary = handleJourneyRequest(
  '/checkout/analytics/journey/summary',
  emptySummary,
  (filters) => journeyService.getSummary(filters),
);

module.exports.getJourneyFunnel = handleJourneyRequest(
  '/checkout/analytics/journey/funnel',
  emptyFunnel,
  (filters) => journeyService.getFunnel(filters),
);

module.exports.getJourneySteps = handleJourneyRequest(
  '/checkout/analytics/journey/steps',
  emptySteps,
  (filters) => journeyService.getSteps(filters),
);

module.exports.getJourneyPaymentMethods = handleJourneyRequest(
  '/checkout/analytics/journey/payment-methods',
  emptyPaymentMethods,
  (filters) => journeyService.getPaymentMethods(filters),
);

module.exports.getJourneyDistribution = handleJourneyRequest(
  '/checkout/analytics/journey/distribution',
  emptyDistribution,
  (filters) => journeyService.getDistribution(filters),
);

module.exports.getJourneyBreakdowns = handleJourneyRequest(
  '/checkout/analytics/journey/breakdowns',
  emptyBreakdowns,
  (filters) => journeyService.getBreakdowns(filters),
);

module.exports.getJourneyProducts = handleJourneyRequest(
  '/checkout/analytics/journey/products',
  emptyPaginated(),
  (filters, body) => {
    const pagination = normalizePagination(body);
    if (!pagination) {
      return emptyPaginated();
    }
    return journeyService.getProducts(filters, pagination);
  },
);

module.exports.getJourneyProducers = handleJourneyRequest(
  '/checkout/analytics/journey/producers',
  emptyPaginated(),
  (filters, body) => {
    const pagination = normalizePagination(body);
    if (!pagination) {
      return emptyPaginated();
    }
    return journeyService.getProducers(filters, pagination);
  },
);

module.exports.getJourneySessions = handleJourneyRequest(
  '/checkout/analytics/journey/sessions',
  emptyPaginated(),
  (filters, body) => {
    const pagination = normalizePagination(body);
    if (!pagination) {
      return emptyPaginated();
    }
    return journeyService.getSessions(filters, pagination);
  },
);

module.exports.getJourneyDomains = handleJourneyRequest(
  '/checkout/analytics/journey/domains',
  emptyPaginated(),
  (filters, body) => {
    const pagination = normalizePagination(body);
    if (!pagination) {
      return emptyPaginated();
    }
    return journeyService.getDomains(filters, pagination);
  },
);
