import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';
import ApiError from '../error/ApiError';
import FindCreatorsPaginated from '../useCases/creators/FindCreatorsPaginated';
import GetCreatorsPerformanceChart from '../useCases/creators/GetCreatorsPerformanceChart';
import GetNewCreatorsPerformanceChart from '../useCases/creators/GetNewCreatorsPerformanceChart';
import FindProducersWithCreators from '../useCases/creators/FindProducersWithCreators';
import FindProductsWithCreators from '../useCases/creators/FindProductsWithCreators';
import GetCreatorsKpiStats from '../useCases/creators/GetCreatorsKpiStats';
import GetCreatorsRegisteredStats from '../useCases/creators/GetCreatorsRegisteredStats';
import GetCreatorsActiveStats from '../useCases/creators/GetCreatorsActiveStats';
import GetCreatorsAllTimeStats from '../useCases/creators/GetCreatorsAllTimeStats';
import GetCreatorsNewStats from '../useCases/creators/GetCreatorsNewStats';
import GetCreatorsRevenueStats from '../useCases/creators/GetCreatorsRevenueStats';
import GetCreatorsConversionStats from '../useCases/creators/GetCreatorsConversionStats';

import {
  CreatorsRequest,
  CreatorsStatsRequest,
  CreatorsChartRequest,
  ProducersWithCreatorsRequest,
  ProductsWithCreatorsRequest,
  CreatorsQueryParams,
  CreatorsStatsQueryParams,
  CreatorsChartQueryParams,
  ProducersWithCreatorsQueryParams,
  ProductsWithCreatorsQueryParams,
} from '../interfaces/creators.interface';

function validateCommonParams(req: Request, res: Response): boolean {
  const { startDate, endDate, producerId, productId } = req.query as CreatorsStatsQueryParams;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      const error = ApiError.badRequest(
        'Formato de data inválido. Use YYYY-MM-DD ou ISO string',
        undefined,
      );
      res.status(error.code).send(error);
      return false;
    }
  }

  if (producerId && isNaN(Number(producerId))) {
    const error = ApiError.badRequest(
      'Parâmetro producerId deve ser um número válido',
      undefined,
    );
    res.status(error.code).send(error);
    return false;
  }

  if (productId && isNaN(Number(productId))) {
    const error = ApiError.badRequest(
      'Parâmetro productId deve ser um número válido',
      undefined,
    );
    res.status(error.code).send(error);
    return false;
  }

  return true;
}

function handleError(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
  context: string,
): void {
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

export const findAllCreators = async (
  req: CreatorsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    query: {
      page = 0,
      size = 10,
      input = null,
      startDate = null,
      endDate = null,
      producerId = null,
      productId = null,
      sortBy = 'ranking',
      sortOrder = 'asc',
      newOnly = 'false',
      origin = 'all',
      verified = 'all',
    },
  } = req;

  try {
    const findCreatorsPaginated = new FindCreatorsPaginated();
    const result = await findCreatorsPaginated.execute({
      page,
      size,
      input,
      startDate,
      endDate,
      producerId,
      productId,
      sortBy,
      sortOrder,
      newOnly,
      origin,
      verified,
    });

    res.send(result);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.code).send(error);
      return;
    }
    next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const getCreatorsPerformanceChart = async (
  req: CreatorsChartRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    query: {
      startDate = null,
      endDate = null,
      period = 'day',
      producerId = null,
      productId = null,
    },
  } = req;

  try {
    const getCreatorsPerformanceChart = new GetCreatorsPerformanceChart();
    const chartData = await getCreatorsPerformanceChart.execute({
      startDate,
      endDate,
      period,
      producerId,
      productId,
    });

    res.send(chartData);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.code).send(error);
      return;
    }
    next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const getNewCreatorsPerformanceChart = async (
  req: CreatorsChartRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    query: {
      startDate = null,
      endDate = null,
      period = 'day',
      producerId = null,
      productId = null,
    },
  } = req;

  try {
    const getNewCreatorsPerformanceChart = new GetNewCreatorsPerformanceChart();
    const chartData = await getNewCreatorsPerformanceChart.execute({
      startDate,
      endDate,
      period,
      producerId,
      productId,
    });

    res.send(chartData);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.code).send(error);
      return;
    }
    next(
      ApiError.internalservererror(
        `Internal Server Error, ${
          Object.keys(error || {})?.length ? JSON.stringify(error) : error
        }`,
      ),
    );
  }
};

export const getProducersWithCreators = async (
  req: ProducersWithCreatorsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    query: { startDate = null, endDate = null },
  } = req;

  try {
    const findProducersWithCreators = new FindProducersWithCreators();
    const result = await findProducersWithCreators.execute({
      startDate,
      endDate,
    });
    res.send(result);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.code).send(error);
      return;
    }
    next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const getProductsWithCreators = async (
  req: ProductsWithCreatorsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    query: { producerId = null, startDate = null, endDate = null },
  } = req;

  try {
    const findProductsWithCreators = new FindProductsWithCreators();
    const result = await findProductsWithCreators.execute({
      producerId,
      startDate,
      endDate,
    });
    res.send(result);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.code).send(error);
      return;
    }
    next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const getCreatorsKpiStats = async (
  req: CreatorsStatsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    query: { startDate = null, endDate = null },
  } = req;

  try {
    const getCreatorsKpiStats = new GetCreatorsKpiStats();
    const kpiStats = await getCreatorsKpiStats.execute({
      startDate,
      endDate,
    });

    res.send(kpiStats);
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.code).send(error);
      return;
    }
    next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

export const getCreatorsRegisteredStats = async (
  req: CreatorsStatsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      query: {
        startDate = null,
        endDate = null,
        producerId = null,
        productId = null,
      },
    } = req;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `creatorsRegisteredStats:${JSON.stringify({
      startDate,
      endDate,
      producerId,
      productId,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.send(cached);
      return;
    }

    const getCreatorsRegisteredStats = new GetCreatorsRegisteredStats();
    const registeredStats = await getCreatorsRegisteredStats.execute({
      startDate,
      endDate,
      producerId,
      productId,
    });

    await redis.set(cacheKey, registeredStats, 60);
    res.send(registeredStats);
  } catch (error) {
    handleError(error, req, res, next, 'creators registered stats');
  }
};

export const getCreatorsActiveStats = async (
  req: CreatorsStatsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      query: {
        startDate = null,
        endDate = null,
        producerId = null,
        productId = null,
      },
    } = req;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `creatorsActiveStats:${JSON.stringify({
      startDate,
      endDate,
      producerId,
      productId,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.send(cached);
      return;
    }

    const getCreatorsActiveStats = new GetCreatorsActiveStats();
    const activeStats = await getCreatorsActiveStats.execute({
      startDate,
      endDate,
      producerId,
      productId,
    });

    await redis.set(cacheKey, activeStats, 60);
    res.send(activeStats);
  } catch (error) {
    handleError(error, req, res, next, 'creators active stats');
  }
};

export const getCreatorsAllTimeStats = async (
  req: CreatorsStatsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      query: { producerId = null, productId = null },
    } = req;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `creatorsAllTimeStats:${JSON.stringify({
      producerId,
      productId,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.send(cached);
      return;
    }

    const getCreatorsAllTimeStats = new GetCreatorsAllTimeStats();
    const allTimeStats = await getCreatorsAllTimeStats.execute({
      producerId,
      productId,
    });

    await redis.set(cacheKey, allTimeStats, 60);
    res.send(allTimeStats);
  } catch (error) {
    handleError(error, req, res, next, 'creators all time stats');
  }
};

export const getCreatorsNewStats = async (
  req: CreatorsStatsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      query: {
        startDate = null,
        endDate = null,
        producerId = null,
        productId = null,
      },
    } = req;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `creatorsNewStats:${JSON.stringify({
      startDate,
      endDate,
      producerId,
      productId,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.send(cached);
      return;
    }

    const getCreatorsNewStats = new GetCreatorsNewStats();
    const newStats = await getCreatorsNewStats.execute({
      startDate,
      endDate,
      producerId,
      productId,
    });

    await redis.set(cacheKey, newStats, 60);
    res.send(newStats);
  } catch (error) {
    handleError(error, req, res, next, 'creators new stats');
  }
};

export const getCreatorsRevenueStats = async (
  req: CreatorsStatsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      query: {
        startDate = null,
        endDate = null,
        producerId = null,
        productId = null,
      },
    } = req;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `creatorsRevenueStats:${JSON.stringify({
      startDate,
      endDate,
      producerId,
      productId,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.send(cached);
      return;
    }

    const getCreatorsRevenueStats = new GetCreatorsRevenueStats();
    const revenueStats = await getCreatorsRevenueStats.execute({
      startDate,
      endDate,
      producerId,
      productId,
    });

    await redis.set(cacheKey, revenueStats, 60);
    res.send(revenueStats);
  } catch (error) {
    handleError(error, req, res, next, 'creators revenue stats');
  }
};

export const getCreatorsConversionStats = async (
  req: CreatorsStatsRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      query: {
        startDate = null,
        endDate = null,
        producerId = null,
        productId = null,
      },
    } = req;

    if (!validateCommonParams(req, res)) return;

    const cacheKey = `creatorsConversionStats:${JSON.stringify({
      startDate,
      endDate,
      producerId,
      productId,
    })}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      res.send(cached);
      return;
    }

    const getCreatorsConversionStats = new GetCreatorsConversionStats();
    const conversionStats = await getCreatorsConversionStats.execute({
      startDate,
      endDate,
      producerId,
      productId,
    });

    await redis.set(cacheKey, conversionStats, 60);
    res.send(conversionStats);
  } catch (error) {
    handleError(error, req, res, next, 'creators conversion stats');
  }
};
