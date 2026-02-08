const redis = require('../config/redis');
const ApiError = require('../error/ApiError');
const SalesItemsRepository = require('../repositories/sequelize/SalesItemsRepository');
const FindCheckoutAnalytics = require('../useCases/checkout/FindCheckoutAnalytics');
const CalculateSalesByPaymentMethod = require('../useCases/checkout/CalculateSalesByPaymentMethod');
const CalculateSalesByStatus = require('../useCases/checkout/CalculateSalesByStatus');
const CalculateSalesBySeller = require('../useCases/checkout/CalculateSalesBySeller');
const CalculateSalesByProduct = require('../useCases/checkout/CalculateSalesByProduct');
const CalculateCommissionsByRole = require('../useCases/checkout/CalculateCommissionsByRole');
const CalculateConversionRates = require('../useCases/checkout/CalculateConversionRates');
const GetAgentStats = require('../useCases/checkout/GetAgentStats');
const CalculateTotalFeeB4you = require('../useCases/checkout/CalculateTotalFeeB4you');

function validateCommonParams(req, res) {
  const { start_date, end_date, statuses, id_product, id_user } = req.body;

  if (!start_date || !end_date) {
    const error = ApiError.badRequest(
      'Parâmetros obrigatórios não fornecidos: start_date e end_date são necessários',
      undefined,
    );
    res.status(error.code).send(error);
    return false;
  }

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    const error = ApiError.badRequest(
      'Formato de data inválido. Use YYYY-MM-DD ou ISO string',
      undefined,
    );
    res.status(error.code).send(error);
    return false;
  }

  if (
    statuses &&
    (!Array.isArray(statuses) || statuses.some((s) => isNaN(Number(s))))
  ) {
    const error = ApiError.badRequest(
      'Parâmetro statuses deve ser um array de números válidos',
      undefined,
    );
    res.status(error.code).send(error);
    return false;
  }

  if (id_product && isNaN(Number(id_product))) {
    const error = ApiError.badRequest(
      'Parâmetro id_product deve ser um número válido',
      undefined,
    );
    res.status(error.code).send(error);
    return false;
  }

  if (id_user && isNaN(Number(id_user))) {
    const error = ApiError.badRequest(
      'Parâmetro id_user deve ser um número válido',
      undefined,
    );
    res.status(error.code).send(error);
    return false;
  }

  return true;
}

function handleError(error, req, res, next, context) {
  console.error(`Erro ao executar ${context}:`, error);

  if (error instanceof ApiError) {
    console.error('ApiError detectado:', {
      code: error.code,
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      context,
    });
    res.status(error.code).send(error);
    return;
  }

  const internalError = ApiError.internalservererror(
    `Erro interno ao executar ${context}: ${req.method.toUpperCase()}: ${
      req.originalUrl
    }`,
    error,
  );
  next(internalError);
}

async function findCheckoutAnalyticsByPeriod(req, res, next) {
  try {
    const {
      start_date,
      end_date,
      payment_method = 'all',
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    } = req.body;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `checkoutAnalytics:${JSON.stringify({
      start_date,
      end_date,
      payment_method,
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    const findCheckoutAnalytics = new FindCheckoutAnalytics(
      SalesItemsRepository,
    );

    const result = await findCheckoutAnalytics.execute({
      start_date,
      end_date,
      payment_method,
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    });

    await redis.set(cacheKey, result, 60);

    res.send(result);
  } catch (error) {
    handleError(error, req, res, next, 'checkout analytics');
  }
}

async function getPaymentMethodAnalytics(req, res, next) {
  try {
    const {
      start_date,
      end_date,
      payment_method = 'all',
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    } = req.body;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `paymentMethodAnalytics:${JSON.stringify({
      start_date,
      end_date,
      payment_method,
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    const statusFilter =
      Array.isArray(statuses) && statuses.length > 0
        ? statuses.map(Number)
        : [1, 2, 3, 4, 5, 6, 7, 8];

    const normalizedProductId = id_product
      ? Number(id_product)
      : input
      ? Number(input)
      : undefined;
    const normalizedUserId = id_user ? Number(id_user) : undefined;

    const baseWhere = {
      ...(payment_method !== 'all' ? { payment_method } : {}),
      ...(normalizedProductId ? { id_product: normalizedProductId } : {}),
      ...(statusFilter?.length ? { id_status: statusFilter } : {}),
      start_date,
      end_date,
    };

    const baseSaleWhere = {
      ...(normalizedUserId ? { id_user: normalizedUserId } : {}),
      ...(state ? { state: state } : {}),
      ...(region ? { region } : {}),
    };

    const calculateSalesByPaymentMethod = new CalculateSalesByPaymentMethod(
      SalesItemsRepository,
    );
    const result = await calculateSalesByPaymentMethod.execute({
      where: baseWhere,
      saleWhere: baseSaleWhere,
    });

    await redis.set(cacheKey, result, 60);
    res.send(result);
  } catch (error) {
    handleError(error, req, res, next, 'payment method analytics');
  }
}

async function getStatusAnalytics(req, res, next) {
  try {
    const {
      start_date,
      end_date,
      payment_method = 'all',
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    } = req.body;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `statusAnalytics:${JSON.stringify({
      start_date,
      end_date,
      payment_method,
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    const statusFilter =
      Array.isArray(statuses) && statuses.length > 0
        ? statuses.map(Number)
        : [1, 2, 3, 4, 5, 6, 7, 8];

    const normalizedProductId = id_product
      ? Number(id_product)
      : input
      ? Number(input)
      : undefined;
    const normalizedUserId = id_user ? Number(id_user) : undefined;

    const baseWhere = {
      ...(payment_method !== 'all' ? { payment_method } : {}),
      ...(normalizedProductId ? { id_product: normalizedProductId } : {}),
      ...(statusFilter?.length ? { id_status: statusFilter } : {}),
      start_date,
      end_date,
    };

    const baseSaleWhere = {
      ...(normalizedUserId ? { id_user: normalizedUserId } : {}),
      ...(state ? { state: state } : {}),
      ...(region ? { region } : {}),
    };

    const calculateSalesByStatus = new CalculateSalesByStatus(
      SalesItemsRepository,
    );
    const result = await calculateSalesByStatus.execute({
      where: baseWhere,
      saleWhere: baseSaleWhere,
    });

    await redis.set(cacheKey, result, 60);
    res.send(result);
  } catch (error) {
    handleError(error, req, res, next, 'status analytics');
  }
}

async function getRegionAnalytics(req, res, next) {
  try {
    const {
      start_date,
      end_date,
      payment_method = 'all',
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    } = req.body;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `regionAnalytics:${JSON.stringify({
      start_date,
      end_date,
      payment_method,
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    const statusFilter =
      Array.isArray(statuses) && statuses.length > 0
        ? statuses.map(Number)
        : [1, 2, 3, 4, 5, 6, 7, 8];

    const normalizedProductId = id_product
      ? Number(id_product)
      : input
      ? Number(input)
      : undefined;
    const normalizedUserId = id_user ? Number(id_user) : undefined;

    const { regionCounts } =
      await SalesItemsRepository.findAllSalesItemsForStats({
        start_date,
        end_date,
        id_status: statusFilter,
        payment_method,
        input,
        region,
        state,
        id_product: normalizedProductId,
        id_user: normalizedUserId,
      });

    const result = { regionCounts };

    await redis.set(cacheKey, result, 60);
    res.send(result);
  } catch (error) {
    handleError(error, req, res, next, 'region analytics');
  }
}

async function getStateAnalytics(req, res, next) {
  try {
    const {
      start_date,
      end_date,
      payment_method = 'all',
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    } = req.body;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `stateAnalytics:${JSON.stringify({
      start_date,
      end_date,
      payment_method,
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    const statusFilter =
      Array.isArray(statuses) && statuses.length > 0
        ? statuses.map(Number)
        : [1, 2, 3, 4, 5, 6, 7, 8];

    const normalizedProductId = id_product
      ? Number(id_product)
      : input
      ? Number(input)
      : undefined;
    const normalizedUserId = id_user ? Number(id_user) : undefined;

    const { stateCounts } =
      await SalesItemsRepository.findAllSalesItemsForStats({
        start_date,
        end_date,
        id_status: statusFilter,
        payment_method,
        input,
        region,
        state,
        id_product: normalizedProductId,
        id_user: normalizedUserId,
      });

    const result = { stateCounts };

    await redis.set(cacheKey, result, 60);
    res.send(result);
  } catch (error) {
    handleError(error, req, res, next, 'state analytics');
  }
}

async function getSellerAnalytics(req, res, next) {
  try {
    const {
      start_date,
      end_date,
      payment_method = 'all',
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    } = req.body;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `sellerAnalytics:${JSON.stringify({
      start_date,
      end_date,
      payment_method,
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    const statusFilter =
      Array.isArray(statuses) && statuses.length > 0
        ? statuses.map(Number)
        : [1, 2, 3, 4, 5, 6, 7, 8];

    const normalizedProductId = id_product
      ? Number(id_product)
      : input
      ? Number(input)
      : undefined;
    const normalizedUserId = id_user ? Number(id_user) : undefined;

    const baseWhere = {
      ...(payment_method !== 'all' ? { payment_method } : {}),
      ...(normalizedProductId ? { id_product: normalizedProductId } : {}),
      ...(statusFilter?.length ? { id_status: statusFilter } : {}),
      start_date,
      end_date,
    };

    const baseSaleWhere = {
      ...(normalizedUserId ? { id_user: normalizedUserId } : {}),
      ...(state ? { state: state } : {}),
      ...(region ? { region } : {}),
    };

    const calculateSalesBySeller = new CalculateSalesBySeller(
      SalesItemsRepository,
    );
    const result = await calculateSalesBySeller.execute({
      where: baseWhere,
      saleWhere: baseSaleWhere,
    });

    await redis.set(cacheKey, result, 60);
    res.send(result);
  } catch (error) {
    handleError(error, req, res, next, 'seller analytics');
  }
}

async function getProductAnalytics(req, res, next) {
  try {
    const {
      start_date,
      end_date,
      payment_method = 'all',
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    } = req.body;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `productAnalytics:${JSON.stringify({
      start_date,
      end_date,
      payment_method,
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    const statusFilter =
      Array.isArray(statuses) && statuses.length > 0
        ? statuses.map(Number)
        : [1, 2, 3, 4, 5, 6, 7, 8];

    const normalizedProductId = id_product
      ? Number(id_product)
      : input
      ? Number(input)
      : undefined;
    const normalizedUserId = id_user ? Number(id_user) : undefined;

    const baseWhere = {
      ...(payment_method !== 'all' ? { payment_method } : {}),
      ...(normalizedProductId ? { id_product: normalizedProductId } : {}),
      ...(statusFilter?.length ? { id_status: statusFilter } : {}),
      start_date,
      end_date,
    };

    const baseSaleWhere = {
      ...(normalizedUserId ? { id_user: normalizedUserId } : {}),
      ...(state ? { state: state } : {}),
      ...(region ? { region } : {}),
    };

    const calculateSalesByProduct = new CalculateSalesByProduct(
      SalesItemsRepository,
    );
    const result = await calculateSalesByProduct.execute({
      where: baseWhere,
      saleWhere: baseSaleWhere,
      limit: 50,
    });

    await redis.set(cacheKey, result, 60);
    res.send(result);
  } catch (error) {
    handleError(error, req, res, next, 'product analytics');
  }
}

async function getProductSearchAnalytics(req, res, next) {
  try {
    const {
      start_date,
      end_date,
      payment_method = 'all',
      statuses,
      region,
      state,
      id_user,
      search_term,
      limit = 20,
    } = req.body;

    if (!validateCommonParams(req, res)) return;

    if (!search_term || !search_term.trim()) {
      return res.send({});
    }

    const cacheKey = `productSearchAnalytics:${JSON.stringify({
      start_date,
      end_date,
      payment_method,
      statuses,
      region,
      state,
      id_user,
      search_term: search_term.trim(),
      limit,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    const statusFilter =
      Array.isArray(statuses) && statuses.length > 0
        ? statuses.map(Number)
        : [1, 2, 3, 4, 5, 6, 7, 8];

    const normalizedUserId = id_user ? Number(id_user) : undefined;

    const baseWhere = {
      ...(payment_method !== 'all' ? { payment_method } : {}),
      ...(statusFilter?.length ? { id_status: statusFilter } : {}),
      start_date,
      end_date,
    };

    const baseSaleWhere = {
      ...(normalizedUserId ? { id_user: normalizedUserId } : {}),
      ...(state ? { state: state } : {}),
      ...(region ? { region } : {}),
    };

    const calculateSalesByProduct = new CalculateSalesByProduct(
      SalesItemsRepository,
    );
    const result = await calculateSalesByProduct.execute({
      where: baseWhere,
      saleWhere: baseSaleWhere,
      searchTerm: search_term.trim(),
      limit,
    });

    await redis.set(cacheKey, result, 100);
    res.send(result);
  } catch (error) {
    handleError(error, req, res, next, 'product search analytics');
  }
}

async function getOriginAnalytics(req, res, next) {
  try {
    const {
      start_date,
      end_date,
      payment_method = 'all',
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    } = req.body;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `originAnalytics:${JSON.stringify({
      start_date,
      end_date,
      payment_method,
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    const statusFilter =
      Array.isArray(statuses) && statuses.length > 0
        ? statuses.map(Number)
        : [1, 2, 3, 4, 5, 6, 7, 8];

    const normalizedProductId = id_product
      ? Number(id_product)
      : input
      ? Number(input)
      : undefined;
    const normalizedUserId = id_user ? Number(id_user) : undefined;

    const { totalItems, totalSalesPrice } =
      await SalesItemsRepository.findAllSalesItemsForStats({
        start_date,
        end_date,
        id_status: statusFilter,
        payment_method,
        input,
        region,
        state,
        id_product: normalizedProductId,
        id_user: normalizedUserId,
      });

    const result = {
      totalItems,
      totalSalesPrice: Number(totalSalesPrice.toFixed(2)),
      input,
    };

    await redis.set(cacheKey, result, 60);
    res.send(result);
  } catch (error) {
    handleError(error, req, res, next, 'origin analytics');
  }
}

async function getCalculationsAnalytics(req, res, next) {
  try {
    const {
      start_date,
      end_date,
      payment_method = 'all',
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    } = req.body;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `calculationsAnalytics:${JSON.stringify({
      start_date,
      end_date,
      payment_method,
      input,
      statuses,
      region,
      state,
      id_product,
      id_user,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.send(cached);
    }

    const statusFilter =
      Array.isArray(statuses) && statuses.length > 0
        ? statuses.map(Number)
        : [1, 2, 3, 4, 5, 6, 7, 8];

    const normalizedProductId = id_product
      ? Number(id_product)
      : input
      ? Number(input)
      : undefined;
    const normalizedUserId = id_user ? Number(id_user) : undefined;

    const baseWhere = {
      ...(payment_method !== 'all' ? { payment_method } : {}),
      ...(normalizedProductId ? { id_product: normalizedProductId } : {}),
      ...(statusFilter?.length ? { id_status: statusFilter } : {}),
      start_date,
      end_date,
    };

    const baseSaleWhere = {
      ...(normalizedUserId ? { id_user: normalizedUserId } : {}),
      ...(state ? { state: state } : {}),
      ...(region ? { region } : {}),
    };

    const [commissionsByRole, agentStatus, conversionRates, totalFeeB4you] =
      await Promise.all([
        new CalculateCommissionsByRole(SalesItemsRepository).execute({
          where: baseWhere,
          saleWhere: baseSaleWhere,
        }),
        new GetAgentStats(SalesItemsRepository).execute({
          where: baseWhere,
          saleWhere: baseSaleWhere,
        }),
        new CalculateConversionRates(SalesItemsRepository).execute({
          where: {
            ...baseWhere,
            id_status: undefined,
          },
          saleWhere: baseSaleWhere,
        }),
        new CalculateTotalFeeB4you(SalesItemsRepository).execute({
          where: baseWhere,
          saleWhere: baseSaleWhere,
        }),
      ]);

    const result = {
      commissionsByRole,
      agentStatus,
      conversionRates,
      totalFeeB4you: Number(totalFeeB4you.total.toFixed(2)),
    };

    await redis.set(cacheKey, result, 60);
    res.send(result);
  } catch (error) {
    handleError(error, req, res, next, 'calculations analytics');
  }
}

module.exports = {
  findCheckoutAnalyticsByPeriod,
  getPaymentMethodAnalytics,
  getStatusAnalytics,
  getRegionAnalytics,
  getStateAnalytics,
  getSellerAnalytics,
  getProductAnalytics,
  getProductSearchAnalytics,
  getOriginAnalytics,
  getCalculationsAnalytics,
};