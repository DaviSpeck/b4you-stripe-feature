const { parseInt } = require('lodash');
const Sequelize = require('sequelize');
const ApiError = require('../error/ApiError');
const AverageRefundsUseCase = require('../useCases/metrics/AverageRefunds');
const AverageSalesUseCase = require('../useCases/metrics/AverageSales');
const AverageRankingUseCase = require('../useCases/metrics/AverageRanking');
const AverageTicketUseCase = require('../useCases/metrics/AverageTicket');
const GeneralMetricsUseCase = require('../useCases/metrics/general');
const SerializeMetrics = require('../presentation/metrics/general');
const FindSalesAverage = require('../useCases/products/FindSalesAverage');
const FindAverageAmountRange = require('../useCases/products/FindAverageAmountRange');
const FindAverageSales = require('../useCases/users/FindAverageSales');
const FindAverageAmount = require('../useCases/products/FindAverageAmount');

const SalesItemsRepository = require('../repositories/sequelize/SalesItemsRepository');
const UserTotalCommission = require('../database/models/UserTotalCommission');
const Sales_items = require('../database/models/Sales_items');
const date = require('../utils/helpers/date');
const { capitalizeName } = require('../utils/formatters');
const { DATABASE_DATE_WITHOUT_TIME } = require('../types/dateTypes');
const UsersRevenue = require('../database/models/UsersRevenue');
const Charges = require('../database/models/Charges');

const { QueryTypes } = require('sequelize');
const Database = require('../database/models/index');
const DateHelper = require('../utils/helpers/date');
const moment = require('moment-timezone');
const { Op } = require('sequelize');
moment.tz.setDefault('America/Sao_Paulo');

module.exports.fees = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'Parâmetros "start_date" e "end_date" são obrigatórios no formato YYYY-MM-DD',
      });
    }

    const start = date(start_date).startOf('day').utc();
    const end = date(end_date).endOf('day').utc();

    const [result] = await Sales_items.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('fee_variable_amount')), 'sumVar'],
        [Sequelize.fn('SUM', Sequelize.col('fee_fixed')), 'sumFix'],
      ],
      where: {
        id_status: 2,
        paid_at: { [Op.between]: [start, end] },
      },
      raw: true,
    });

    const count = Number(result.count || 0);
    const sumVar = Number(result.sumVar || 0);
    const sumFix = Number(result.sumFix || 0);

    const variable = count > 0 ? sumVar / count : 0;
    const fixed = count > 0 ? sumFix / count : 0;

    return res.status(200).json({ variable, fixed });
  } catch (error) {
    return next(
      ApiError.internalservererror(
        `Internal Server Error (${req.method}): ${req.originalUrl}`,
        error
      )
    );
  }
};

module.exports.denieds = async (req, res, next) => {
  const { start_date, end_date } = req.query;
  try {
    const totalOcorrencias = await Charges.count({
      logging: false,
      where: {
        provider_response_details: {
          [Sequelize.Op.ne]: null,
        },
        created_at: {
          [Sequelize.Op.between]: [
            date(start_date).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            date(end_date).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
          ],
        },
      },
    });

    const results = await Charges.findAll({
      attributes: [
        'provider_response_details',
        [
          Sequelize.fn('COUNT', Sequelize.col('provider_response_details')),
          'total_ocorrencias',
        ],
        [
          Sequelize.literal(
            `(COUNT(provider_response_details) * 100.0 / ${totalOcorrencias})`,
          ),
          'porcentagem',
        ],
      ],
      where: {
        provider_response_details: {
          [Sequelize.Op.ne]: null,
        },
        created_at: {
          [Sequelize.Op.between]: [
            date(start_date).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            date(end_date).endOf('day').format('YYYY-MM-DD HH:mm:ss'),
          ],
        },
      },
      group: ['provider_response_details'],
      order: [[Sequelize.literal('porcentagem'), 'DESC']],
    });
    return res.status(200).send(results);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports.findMetrics = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, start_date, end_date },
  } = req;
  try {
    const {
      summary,
      userMetrics: { rows, count },
    } = await new GeneralMetricsUseCase({
      page,
      size,
      start_date,
      end_date,
    }).executeWithSQL();
    return res
      .status(200)
      .send({ summary, count, rows: new SerializeMetrics(rows).adapt() });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports.averageTicket = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, start_date, end_date },
  } = req;
  try {
    const { rows, count } = await new AverageTicketUseCase({
      page,
      size,
      start_date,
      end_date,
    }).executeWithSQL();
    return res.status(200).send({ rows, count: count.length });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports.ticket = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'Parâmetros "start_date" e "end_date" são obrigatórios no formato YYYY-MM-DD',
      });
    }

    const start = date(start_date).startOf('day').utc();
    const end = date(end_date).endOf('day').utc();

    const [result] = await Sales_items.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('SUM', Sequelize.col('price_total')), 'total'],
      ],
      where: {
        id_status: 2,
        paid_at: { [Op.between]: [start, end] },
      },
      raw: true,
    });

    const count = Number(result.count || 0);
    const total = Number(result.total || 0);

    const ticket = count > 0 ? total / count : 0;

    return res.status(200).json({ ticket });
  } catch (error) {
    return next(
      ApiError.internalservererror(
        `Internal Server Error (${req.method}): ${req.originalUrl}`,
        error
      )
    );
  }
};

module.exports.averageSales = async (req, res, next) => {
  const {
    query: { start_date, end_date },
  } = req;
  try {
    const sales = await new AverageSalesUseCase({
      start_date,
      end_date,
    }).executeWithSQL();
    return res.status(200).send(sales);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports.averageRefunds = async (req, res, next) => {
  const {
    query: { start_date, end_date },
  } = req;
  try {
    const refunds = await new AverageRefundsUseCase({
      start_date,
      end_date,
    }).executeWithSQL();
    return res.status(200).send(refunds);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports.averageRanking = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, start_date, end_date },
  } = req;
  try {
    const refunds = await new AverageRankingUseCase({
      page,
      size,
      start_date,
      end_date,
    }).executeWithSQL();
    return res.status(200).send(refunds);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports.averageProducts = async (req, res, next) => {
  const {
    query: { start_date, end_date, page = 0, size = 10 },
  } = req;
  try {
    const averageProductSales = await new FindSalesAverage(
      SalesItemsRepository,
    ).execute({ start_date, end_date, page, size });
    return res.status(200).send(averageProductSales);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.averageProducer = async (req, res, next) => {
  const {
    query: { start_date, end_date, page = 0, size = 10 },
  } = req;
  try {
    const averageProductSales = await new FindAverageSales(
      SalesItemsRepository,
    ).execute({ start_date, end_date, page, size });
    return res.status(200).send(averageProductSales);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.averageGeneralProducers = async (req, res, next) => {
  const {
    query: { start_date, end_date, page = 0, size = 10 },
  } = req;
  try {
    const limit = parseInt(size, 10);
    const offset = parseInt(page, 10) * size;
    const averageGeneralProducers = await UsersRevenue.findAndCountAll({
      raw: true,
      nest: true,
      limit,
      offset,
      attributes: [
        'id_user',
        [Sequelize.fn('SUM', Sequelize.col('total')), 'total'],
      ],
      group: 'id_user',
      order: [['total', 'DESC']],
      include: [
        {
          association: 'user',
          attributes: ['uuid', 'full_name', 'profile_picture'],
        },
      ],
      where: {
        paid_at: {
          [Sequelize.Op.between]: [
            date(start_date)
              .startOf('day')
              .add(3, 'hours')
              .format(DATABASE_DATE_WITHOUT_TIME),
            date(end_date)
              .endOf('day')
              .add(3, 'hours')
              .format(DATABASE_DATE_WITHOUT_TIME),
          ],
        },
      },
    });
    return res.status(200).send({
      count: averageGeneralProducers.count.length,
      rows: averageGeneralProducers.rows.map(({ user, total }) => ({
        uuid: user.uuid,
        total,
        full_name: capitalizeName(user.full_name),
        profile_picture: user.profile_picture,
      })),
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.averageAmount = async (req, res, next) => {
  const {
    query: { start_date, end_date },
  } = req;
  try {
    const averageProductSales = await new FindAverageAmount(
      SalesItemsRepository,
    ).execute({ start_date, end_date });
    return res.status(200).send(averageProductSales);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

module.exports.averageAmountRange = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'start_date e end_date são obrigatórios no formato YYYY-MM-DD',
      });
    }

    const result = await new FindAverageAmountRange(SalesItemsRepository).execute({
      start_date,
      end_date,
    });

    return res.status(200).json(result);
  } catch (error) {
    return next(
      ApiError.internalservererror(
        `Internal Server Error (${req.method}): ${req.originalUrl}`,
        error
      )
    );
  }
};

module.exports.rewards = async (req, res, next) => {
  const {
    query: { size = 10, page = 0 },
  } = req;
  try {
    const limit = parseInt(size, 10);
    const offset = limit * parseInt(page, 10);
    const rewards = await UserTotalCommission.findAndCountAll({
      nest: true,
      attributes: ['total'],
      offset,
      limit,
      include: [
        {
          association: 'user',
          attributes: ['uuid', 'full_name', 'email', 'profile_picture'],
        },
      ],
      order: [['total', 'desc']],
    });

    return res.status(200).send({
      count: rewards.count,
      rows: rewards.rows.map((r) => r.toJSON()),
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

/* ============================================================================
//  Painel 1 – Overview de Produtos
// ========================================================================== */

const DATE_FMT = 'YYYY-MM-DD HH:mm:ss';

module.exports.getActiveProducts = async (req, res, next) => {
  const days = Number.parseInt(req.query.days, 10) || 30;

  try {
    const [{ totalActive }] = await Database.sequelize.query(
      `SELECT COUNT(DISTINCT id_product) AS totalActive
         FROM sales_items
        WHERE id_status = 2
          AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL :days DAY)`,
      { replacements: { days }, type: QueryTypes.SELECT },
    );

    return res.json({ totalActive: Number(totalActive) });
  } catch (err) {
    next(ApiError.internalservererror('Erro ao buscar totalActive', err));
  }
};

module.exports.getNewProducts = async (req, res, next) => {
  const days = Number.parseInt(req.query.days, 10) || 30;

  try {
    const rows = await Database.sequelize.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
         FROM products
        WHERE created_at >= DATE_SUB(UTC_DATE(), INTERVAL :days DAY)
        GROUP BY DATE(created_at)
        ORDER BY date`,
      { replacements: { days }, type: QueryTypes.SELECT },
    );

    return res.json(rows);
  } catch (err) {
    next(ApiError.internalservererror('Erro ao buscar newProducts', err));
  }
};

module.exports.getProductRanking = async (req, res, next) => {
  const threshold = parseInt(req.query.threshold, 10) || 1;
  const page = parseInt(req.query.page, 10) || 0;
  const size = parseInt(req.query.size, 10) || 10;
  const offset = page * size;

  const { startDate, endDate } = req.query;
  const hasRange = startDate && endDate;

  let start, end;
  if (hasRange) {
    const startLocal = moment
      .tz(startDate, 'YYYY-MM-DD', 'America/Sao_Paulo')
      .startOf('day');
    const endLocal = moment
      .tz(endDate, 'YYYY-MM-DD', 'America/Sao_Paulo')
      .endOf('day');
    start = startLocal.utc().format(DATE_FMT);
    end = endLocal.utc().format(DATE_FMT);
  }

  try {
    let sql = `
      WITH agg AS (
        SELECT si.id_product,
              COUNT(*)              AS totalSales,
              SUM(si.price_total)   AS totalRevenue
          FROM sales_items si
        WHERE si.id_status = 2
          ${hasRange ? 'AND si.paid_at BETWEEN :start AND :end' : ''}
        GROUP BY si.id_product
        HAVING totalSales >= :threshold
      )
      SELECT p.uuid,
             p.name,
             agg.totalSales,
             agg.totalRevenue,
             COUNT(*) OVER() AS totalRows
        FROM agg
        JOIN products p ON p.id = agg.id_product
       ORDER BY agg.totalSales DESC
       LIMIT :size OFFSET :offset
    `;

    const replacements = { threshold, size, offset };
    if (hasRange) {
      replacements.start = start;
      replacements.end = end;
    }

    const rows = await Database.sequelize.query(sql, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const total = rows.length ? Number(rows[0].totalRows) : 0;
    return res.json({
      count: total,
      rows: rows.map((r) => ({
        uuid: r.uuid,
        name: r.name,
        totalSales: Number(r.totalSales),
        totalRevenue: Number(r.totalRevenue),
      })),
    });
  } catch (err) {
    next(ApiError.internalservererror('Erro ao buscar ranking', err));
  }
};

/* ============================================================================
//  Painel 2 – Análise de Produtores
// ========================================================================== */

// 1) PRM – Pausados
const SQL_PRM_BASE = `
WITH prev_prod AS (
  SELECT p.id_user,
         MAX(si.paid_at) AS lastSaleDate,
         SUBSTRING_INDEX(MAX(CONCAT(si.paid_at,'||',p.name)), '||', -1) AS lastProduct,
         COUNT(*) AS lastMonthSales
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
     AND si.paid_at BETWEEN :startNow AND :endNow
)
SELECT u.uuid,
       CONCAT(u.first_name,' ',u.last_name) AS name,
       u.whatsapp AS whatsapp,
       pp.lastMonthSales,
       pp.lastSaleDate,
       pp.lastProduct,
       COUNT(*) OVER () AS totalRows
  FROM users u
  JOIN prev_prod pp     ON pp.id_user = u.id
  LEFT JOIN curr_prod cp ON cp.id_user = u.id
 WHERE cp.id_user IS NULL
   AND EXISTS (SELECT 1 FROM products pr WHERE pr.id_user = u.id)
   AND EXISTS (
     SELECT 1
       FROM sales_items si2
       JOIN products pr2 ON pr2.id = si2.id_product
      WHERE si2.id_status = 2
        AND pr2.id_user = u.id
   )
 ORDER BY pp.lastMonthSales DESC, name
`;

// 2) PD10K – Comparativo (UTC-3)
const SQL_PD_BASE = `
WITH agg AS (
  SELECT p.id_user,
         SUM(CASE WHEN si.paid_at BETWEEN :startPrev AND :endPrev THEN si.price_total ELSE 0 END) AS prevSales,
         SUM(CASE WHEN si.paid_at BETWEEN :startNow  AND :endNow  THEN si.price_total ELSE 0 END) AS currSales
    FROM sales_items si
    JOIN products p ON p.id = si.id_product
   WHERE si.id_status = 2
  GROUP BY p.id_user
  HAVING prevSales >= :threshold AND currSales >= :threshold
)
SELECT u.uuid,
       CONCAT(u.first_name,' ',u.last_name) AS name,
       u.whatsapp AS whatsapp,
       agg.prevSales,
       agg.currSales,
       ROUND((agg.currSales - agg.prevSales) / NULLIF(agg.prevSales,0) * 100, 1) AS diffPct,
       COUNT(*) OVER () AS totalRows
  FROM agg
  JOIN users u ON u.id = agg.id_user
 WHERE EXISTS (SELECT 1 FROM products pr WHERE pr.id_user = u.id)
   AND EXISTS (
     SELECT 1
       FROM sales_items si2
       JOIN products pr2 ON pr2.id = si2.id_product
      WHERE si2.id_status = 2
        AND pr2.id_user = u.id
   )
 ORDER BY diffPct DESC
`;

// 3) PIN 30/60/90
const SQL_PIN = `
SELECT
  SUM(last_paid >= :d30) AS pin30,
  SUM(last_paid >= :d60) AS pin60,
  SUM(last_paid >= :d90) AS pin90
FROM (
  SELECT p.id_user, MAX(si.paid_at) AS last_paid
    FROM sales_items si
    JOIN products p ON p.id = si.id_product
   WHERE si.id_status = 2
  GROUP BY p.id_user
) t
JOIN users u ON u.id = t.id_user
WHERE EXISTS (SELECT 1 FROM products pr WHERE pr.id_user = u.id)
  AND EXISTS (
    SELECT 1
      FROM sales_items si2
      JOIN products pr2 ON pr2.id = si2.id_product
     WHERE si2.id_status = 2
       AND pr2.id_user = u.id
  )
`;

// 4) PP5D – Performance Drop (UTC-3)
const SQL_PP_BASE = `
WITH agg AS (
  SELECT p.id_user,
         SUM(CASE WHEN si.paid_at BETWEEN :startPrev AND :endPrev THEN si.price_total ELSE 0 END) AS older,
         SUM(CASE WHEN si.paid_at BETWEEN :startNow  AND :endNow   THEN si.price_total ELSE 0 END) AS recent
    FROM sales_items si
    JOIN products p ON p.id = si.id_product
   WHERE si.id_status = 2
GROUP BY p.id_user
)
SELECT u.uuid,
       CONCAT(u.first_name,' ',u.last_name) AS name,
       u.whatsapp AS whatsapp,
       agg.older,
       agg.recent,
       ROUND((agg.older - agg.recent) / NULLIF(agg.older,0) * 100,1) AS dropPct,
       COUNT(*) OVER () AS totalRows
  FROM agg
  JOIN users u ON u.id = agg.id_user
 WHERE agg.older > 0
   AND ROUND((agg.older - agg.recent) / NULLIF(agg.older,0) * 100,1) >= :dropPct
   AND EXISTS (SELECT 1 FROM products pr WHERE pr.id_user = u.id)
   AND EXISTS (
     SELECT 1
       FROM sales_items si2
       JOIN products pr2 ON pr2.id = si2.id_product
      WHERE si2.id_status = 2
        AND pr2.id_user = u.id
   )
 ORDER BY 
       (agg.recent > 0) DESC,  -- primeiro quem vendeu no período atual
       agg.older DESC
 LIMIT :size OFFSET :offset
`;

/** PRM – Pausados */
module.exports.getPausedProducers = async (req, res, next) => {
  try {
    const {
      prevStart,
      prevEnd,
      currStart,
      currEnd,
      page = 0,
      size = 10,
    } = req.query;
    const pageNum = Number(page),
      sizeNum = Number(size),
      offset = pageNum * sizeNum;

    const rows = await Database.sequelize.query(
      `${SQL_PRM_BASE} LIMIT :size OFFSET :offset`,
      {
        replacements: {
          startPrev: prevStart,
          endPrev: prevEnd,
          startNow: currStart,
          endNow: currEnd,
          size: sizeNum,
          offset,
        },
        type: QueryTypes.SELECT,
      },
    );

    const total = rows.length ? Number(rows[0].totalRows) : 0;
    return res.json({ rows, count: total });
  } catch (err) {
    next(ApiError.internalservererror('PRM', err));
  }
};

/** PD10K – Comparativo */
module.exports.getTopProducersComparison = async (req, res, next) => {
  try {
    const threshold = Number(req.query.threshold) || 0;
    const pageNum = Math.max(0, Number(req.query.page) || 0);
    const sizeNum = Math.max(1, Number(req.query.size) || 10);
    const offset = pageNum * sizeNum;
    const { prevStart, prevEnd, currStart, currEnd } = req.query;
    const hasCustom = prevStart && prevEnd && currStart && currEnd;

    let dp = DateHelper(prevStart).utcOffset(-180);
    let ep = DateHelper(prevEnd).utcOffset(-180);
    let dc = DateHelper(currStart).utcOffset(-180);
    let ec = DateHelper(currEnd).utcOffset(-180);

    if (!hasCustom) {
      dp = DateHelper().subtract(2, 'month').startOf('month').utcOffset(-180);
      ep = DateHelper().subtract(2, 'month').endOf('month').utcOffset(-180);
      dc = DateHelper().subtract(1, 'month').startOf('month').utcOffset(-180);
      ec = DateHelper().subtract(1, 'month').endOf('month').utcOffset(-180);
    }

    const rows = await Database.sequelize.query(
      `${SQL_PD_BASE} LIMIT :size OFFSET :offset`,
      {
        replacements: {
          startPrev: dp.format(DATE_FMT),
          endPrev: ep.format(DATE_FMT),
          startNow: dc.format(DATE_FMT),
          endNow: ec.format(DATE_FMT),
          threshold,
          size: sizeNum,
          offset,
        },
        type: QueryTypes.SELECT,
      },
    );

    const total = rows.length ? Number(rows[0].totalRows) : 0;
    return res.json({ rows, count: total });
  } catch (err) {
    next(ApiError.internalservererror('PD10K', err));
  }
};

/** PIN 30/60/90 */
module.exports.getProducerIntervals = async (_req, res, next) => {
  try {
    const now = DateHelper().utcOffset(-180);
    const d30 = now.clone().subtract(30, 'days').format(DATE_FMT);
    const d60 = now.clone().subtract(60, 'days').format(DATE_FMT);
    const d90 = now.clone().subtract(90, 'days').format(DATE_FMT);

    const [pin] = await Database.sequelize.query(SQL_PIN, {
      replacements: { d30, d60, d90 },
      type: QueryTypes.SELECT,
    });

    return res.json(pin);
  } catch (err) {
    next(ApiError.internalservererror('PIN', err));
  }
};

/** PP5D – Performance Drop */
module.exports.getProducerPerformanceDrop = async (req, res, next) => {
  try {
    const {
      prevStart,
      prevEnd,
      currStart,
      currEnd,
      dropPct = 0,
      page = 0,
      size = 10,
    } = req.query;

    const pageNum = Number(page),
      sizeNum = Number(size),
      offset = pageNum * sizeNum;

    const replacements = {
      startPrev: prevStart,
      endPrev: prevEnd,
      startNow: currStart,
      endNow: currEnd,
      dropPct: Number(dropPct),
      size: sizeNum,
      offset,
    };

    const rows = await Database.sequelize.query(SQL_PP_BASE, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const total = rows.length ? Number(rows[0].totalRows) : 0;
    return res.json({ rows, count: total });
  } catch (err) {
    next(ApiError.internalservererror('PP5D', err));
  }
};
