const { Op, Sequelize } = require('sequelize');

const ApiError = require('../../error/ApiError');
const SerializeChart = require('../../presentation/dashboard/metrics/chart');
const SerializeProducts = require('../../presentation/dashboard/metrics/products');
const {
  DATABASE_DATE,
  DATABASE_DATE_WITHOUT_TIME,
} = require('../../types/dateTypes');
const DateHelper = require('../../utils/helpers/date');
const { findSalesStatusByKey } = require('../../status/salesStatus');
const {
  findRawUserProducts,
  findSingleProductWithProducer,
} = require('../../database/controllers/products');
const {
  findRawProductsAffiliates,
} = require('../../database/controllers/affiliates');
const CoproductionsRepository = require('../../repositories/sequelize/CoproductionsRepository');
const date = require('../../utils/helpers/date');
const SalesMetricsDaily = require('../../database/models/SalesMetricsDaily');
const UsersRevenue = require('../../database/models/UsersRevenue');
const Commissions = require('../../database/models/Commissions');
const Sales_items = require('../../database/models/Sales_items');
const UsersTotalCommission = require('../../database/models/UsersTotalCommission');
const Products = require('../../database/models/Products');

const toFixed = (number, digits) => {
  if (!number) return 0;
  return Math.trunc(number * 10 ** digits) / 10 ** digits;
};

const calculatePercentage = (count, total) => {
  if (!total) return 0;
  return toFixed((count / total) * 100, 1);
};

const findTotalReward = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const totalReward = await UsersTotalCommission.findOne({
      raw: true,
      where: { id_user },
    });
    return res.status(200).send({ total: totalReward ? totalReward.total : 0 });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const getMetricsByPaymentMethodsController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { start_date, end_date, product_uuid },
  } = req;
  try {
    let queryProduct = '';
    if (product_uuid) {
      const product_ids = product_uuid
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !Number.isNaN(id));
      if (product_ids.length > 0) {
        queryProduct = `and c.id_product in (${product_ids.join(',')})`;
      }
    }
    const promises = [];
    promises.push(
      Commissions.sequelize.query(
        `select sum(c.amount) as amount, count(*) as count from sales_items si inner join commissions c on si.id = c.id_sale_item where c.id_user = :id_user and si.id_status = 2 and si.list = true and si.payment_method = :payment_method and si.paid_at between :start_date and :end_date ${queryProduct}`,
        {
          plain: true,
          replacements: {
            id_user,
            payment_method: 'card',
            start_date: date(start_date).startOf('day').format(DATABASE_DATE),
            end_date: date(end_date).endOf('day').format(DATABASE_DATE),
          },
        },
      ),
    );

    promises.push(
      Commissions.sequelize.query(
        `select sum(c.amount) as amount, count(*) as count from sales_items si inner join commissions c on si.id = c.id_sale_item where c.id_user = :id_user and si.id_status = 2 and si.list = true and si.payment_method = :payment_method and si.paid_at between :start_date and :end_date ${queryProduct}`,
        {
          plain: true,
          replacements: {
            id_user,
            payment_method: 'billet',
            start_date: date(start_date).startOf('day').format(DATABASE_DATE),
            end_date: date(end_date).endOf('day').format(DATABASE_DATE),
          },
        },
      ),
    );

    promises.push(
      Commissions.sequelize.query(
        `select sum(c.amount) as amount, count(*) as count from sales_items si inner join commissions c on si.id = c.id_sale_item where c.id_user = :id_user and si.id_status = 2 and si.list = true and si.payment_method = :payment_method and si.paid_at between :start_date and :end_date ${queryProduct}`,
        {
          plain: true,
          replacements: {
            id_user,
            payment_method: 'pix',
            start_date: date(start_date).startOf('day').format(DATABASE_DATE),
            end_date: date(end_date).endOf('day').format(DATABASE_DATE),
          },
        },
      ),
    );
    const [card, billet, pix] = await Promise.all(promises);
    const total = card.count + billet.count + pix.count;
    return res.status(200).send({
      card: {
        amount: card.amount,
        count: card.count,
        percentage: `${calculatePercentage(card.count, total)}%`,
      },
      pix: {
        amount: pix.amount,
        count: pix.count,
        percentage: `${calculatePercentage(pix.count, total)}%`,
      },
      billet: {
        amount: billet.amount,
        count: billet.count,
        percentage: `${calculatePercentage(billet.count, total)}%`,
      },
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const calculateMetrics = ({ count, amount, total }) => ({
  amount,
  count,
  percentage: `${calculatePercentage(count, total)}%`,
});

const getMetricsByStatusController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { start_date, end_date, product_uuid },
  } = req;
  try {
    let queryProduct = '';
    if (product_uuid) {
      const product_ids = product_uuid
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => !Number.isNaN(id));
      if (product_ids.length > 0) {
        queryProduct = `AND id_product IN (${product_ids.join(',')})`;
      }
    }
    const metrics = await SalesMetricsDaily.sequelize.query(
      `select sum(pending_count) as pending_count, sum(pending_total) as pending_total, sum(paid_count) as paid_count, sum(paid_total) as paid_total, sum(refunded_count) as refunded_count, sum(refunded_total) as refunded_total, sum(chargeback_count) as chargeback_count, sum(chargeback_total) as chargeback_total from sales_metrics_daily where id_user = :id_user and time between :start_date and :end_date ${queryProduct}`,
      {
        plain: true,
        replacements: {
          id_user,
          start_date: date(start_date).startOf('day').format(DATABASE_DATE),
          end_date: date(end_date).endOf('day').format(DATABASE_DATE),
        },
      },
    );
    const {
      pending_count,
      pending_total,
      paid_count,
      paid_total,
      refunded_count,
      refunded_total,
      chargeback_count,
      chargeback_total,
    } = metrics;

    const total =
      pending_count + paid_count + refunded_count + chargeback_count;

    return res.status(200).send({
      pending: calculateMetrics({
        amount: pending_total,
        total,
        count: pending_count,
      }),
      approved: calculateMetrics({
        total,
        amount: paid_total,
        count: paid_count,
      }),
      refund: calculateMetrics({
        total,
        count: refunded_count,
        amount: refunded_total,
      }),
      chargeback: calculateMetrics({
        total,
        count: chargeback_count,
        amount: chargeback_total,
      }),
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const getMetricsByConversionController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { start_date, end_date, product_uuid },
  } = req;

  // Construir filtro para produtos
  const productFilter = {};
  if (product_uuid) {
    const product_ids = product_uuid
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => !Number.isNaN(id));
    if (product_ids.length > 0) {
      productFilter.id_product = { [Op.in]: product_ids };
    }
  }

  try {
    const promises = [];
    // paid card
    promises.push(
      Sales_items.count({
        col: 'id',
        where: {
          payment_method: 'card',
          list: true,
          id_status: 2,
          paid_at: {
            [Op.between]: [
              date(start_date).startOf('day').format(DATABASE_DATE),
              date(end_date).endOf('day').format(DATABASE_DATE),
            ],
          },
          ...productFilter,
        },
        include: [{ association: 'commissions', where: { id_user } }],
      }),
    );

    promises.push(
      Sales_items.count({
        col: 'id',
        where: {
          payment_method: 'card',
          list: true,
          id_status: 3,
          created_at: {
            [Op.between]: [
              date(start_date).startOf('day').format(DATABASE_DATE),
              date(end_date).endOf('day').format(DATABASE_DATE),
            ],
          },
          ...productFilter,
        },
        include: [{ association: 'commissions', where: { id_user } }],
      }),
    );

    // billet
    promises.push(
      Sales_items.count({
        col: 'id',
        where: {
          payment_method: 'billet',
          id_status: 2,
          paid_at: {
            [Op.between]: [
              date(start_date).startOf('day').format(DATABASE_DATE),
              date(end_date).endOf('day').format(DATABASE_DATE),
            ],
          },
          ...productFilter,
        },
        include: [
          { association: 'commissions', where: { id_user }, attributes: [] },
        ],
      }),
    );

    promises.push(
      Sales_items.count({
        col: 'id',
        where: {
          payment_method: 'billet',
          id_status: [1, 7],
          created_at: {
            [Op.between]: [
              date(start_date).startOf('day').format(DATABASE_DATE),
              date(end_date).endOf('day').format(DATABASE_DATE),
            ],
          },
          ...productFilter,
        },
        include: [
          { association: 'commissions', where: { id_user }, attributes: [] },
        ],
      }),
    );
    // pix
    promises.push(
      Sales_items.count({
        col: 'id',
        where: {
          payment_method: 'pix',
          id_status: 2,
          paid_at: {
            [Op.between]: [
              date(start_date).startOf('day').format(DATABASE_DATE),
              date(end_date).endOf('day').format(DATABASE_DATE),
            ],
          },
          ...productFilter,
        },
        include: [
          { association: 'commissions', where: { id_user }, attributes: [] },
        ],
      }),
    );

    promises.push(
      Sales_items.count({
        col: 'id',
        where: {
          payment_method: 'pix',
          id_status: [1, 7],
          created_at: {
            [Op.between]: [
              date(start_date).startOf('day').format(DATABASE_DATE),
              date(end_date).endOf('day').format(DATABASE_DATE),
            ],
          },
          ...productFilter,
        },
        include: [
          { association: 'commissions', where: { id_user }, attributes: [] },
        ],
      }),
    );
    const [
      paid_card,
      denied_card,
      paid_billet,
      pending_billet,
      paid_pix,
      pending_pix,
    ] = await Promise.all(promises);
    const billet_total = paid_billet + pending_billet;
    const pix_total = paid_pix + pending_pix;
    const card_total = paid_card + denied_card;
    return res.status(200).send({
      billet: {
        count_paid: paid_billet,
        count_total: billet_total,
        percentage: `${calculatePercentage(paid_billet, billet_total)}%`,
      },
      pix: {
        count_paid: paid_pix,
        count_total: pix_total,
        percentage: `${calculatePercentage(paid_pix, pix_total)}%`,
      },
      card: {
        count_paid: paid_card,
        count_total: card_total,
        percentage: `${calculatePercentage(paid_card, card_total)}%`,
      },
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const getMetricsChartController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: {
      start_date = DateHelper().utc().startOf('month'),
      end_date = DateHelper().utc(),
      product_uuid,
    },
  } = req;

  try {
    let productIds = [];
    const productsMap = new Map();

    if (product_uuid) {
      const products = await Products.findAll({
        raw: true,
        attributes: ['id', 'name', 'uuid', 'hex_color'],
        where: {
          uuid: {
            [Op.in]: product_uuid.split(','),
          },
        },
      });

      if (products.length > 0) {
        productIds = products.map((p) => p.id);
        products.forEach((p) => productsMap.set(p.id, p));
      } else {
        return res
          .status(200)
          .send(new SerializeChart([], start_date, end_date).adapt());
      }
    }

    const whereClause = { id_user };
    if (productIds.length > 0) {
      whereClause.id_product = { [Op.in]: productIds };
    }

    const saleItemInclude = {
      association: 'sale_item',
      where: {
        paid_at: {
          [Op.between]: [
            DateHelper(start_date).utc().startOf('day').format(DATABASE_DATE),
            DateHelper(end_date).utc().endOf('day').format(DATABASE_DATE),
          ],
        },
        id_status: [
          findSalesStatusByKey('paid').id,
          findSalesStatusByKey('request-refund').id,
        ],
      },
    };

    if (!product_uuid) {
      saleItemInclude.include = [
        {
          association: 'product',
          attributes: ['name', 'uuid', 'hex_color'],
        },
      ];
    }

    const commissions = await Commissions.findAll({
      nest: true,
      where: whereClause,
      include: [saleItemInclude],
    });

    const mappedMetrics = commissions.map((c) => {
      const commission = c.toJSON ? c.toJSON() : c;
      const saleItem = commission.sale_item;

      let { product } = saleItem;
      if (!product && productsMap.has(saleItem.id_product)) {
        product = productsMap.get(saleItem.id_product);
      }

      return {
        user_net_amount: parseFloat(commission.amount),
        created_at: saleItem.paid_at, // Map paid_at to created_at for date grouping
        sales_items: [
          {
            id_product: saleItem.id_product,
            product: product || {
              name: 'Unknown',
              hex_color: '#000000',
              uuid: 'unknown',
            },
          },
        ],
      };
    });

    return res
      .status(200)
      .send(new SerializeChart(mappedMetrics, start_date, end_date).adapt());
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const getProductsMetricsController = async (req, res, next) => {
  const {
    user: { id },
  } = req;
  try {
    const productions = await findRawUserProducts(id);
    const coproductions = await CoproductionsRepository.findAllRaw({
      id_user: id,
    });
    const affiliations = await findRawProductsAffiliates({ id_user: id });
    return res.status(200).send(
      new SerializeProducts({
        productions,
        coproductions,
        affiliations,
      }).adapt(),
    );
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const verifyUserSalesController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const userHasSale = await Commissions.findOne({
      raw: true,
      where: { id_user },
      attributes: ['id'],
    });

    const userHasProduct = await findSingleProductWithProducer({ id_user });

    return res.status(200).send({
      user_has_sale: !!userHasSale || !!userHasProduct,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const chartMetricsV2 = async (req, res, next) => {
  let {
    query: { start_date, end_date },
  } = req;
  const {
    user: { id: id_user },
    query: { product_uuid },
  } = req;

  try {
    const firstSale = await UsersRevenue.findOne({
      raw: true,
      attributes: ['paid_at'],
      order: [['paid_at', 'asc']],
      where: {
        id_user,
      },
    });
    if (!firstSale) {
      return res.status(200).send({
        total: 0,
        labels: [],
        last_month: [],
        current_month: [],
      });
    }
    const { paid_at } = firstSale;
    if (date(start_date).diff(paid_at, 'd') < 0) {
      start_date = paid_at;
    }
    if (date(end_date).diff(paid_at, 'd') < 0) {
      end_date = paid_at;
    }

    // Product Optimization
    let productIds = [];
    if (product_uuid) {
      const products = await Products.findAll({
        raw: true,
        attributes: ['id'],
        where: {
          uuid: {
            [Op.in]: product_uuid.split(','),
          },
        },
      });
      if (products.length > 0) {
        productIds = products.map((p) => p.id);
      } else {
        // Returned UUIDs found NO match. Return empty.
        return res.status(200).send({
          total: 0,
          labels: [],
          last_month: [],
          current_month: [],
          porcentage: { value: '0%', isPositive: false },
        });
      }
    }

    // Helper to build Commission Query
    const fetchCommissionMetrics = async (sDate, eDate, groupByFormat) => {
      const timeAttribute = [
        Sequelize.fn(
          'DATE_FORMAT',
          Sequelize.fn(
            'DATE_SUB',
            Sequelize.col('sale_item.paid_at'),
            Sequelize.literal('INTERVAL 3 HOUR'),
          ),
          groupByFormat,
        ),
        'time',
      ];

      const whereClause = {
        id_user,
      };
      if (productIds.length > 0) {
        whereClause.id_product = { [Op.in]: productIds };
      }

      const includeSaleItem = {
        association: 'sale_item',
        attributes: [],
        where: {
          paid_at: {
            [Op.between]: [
              date(sDate).startOf('day').add(3, 'hour').format(DATABASE_DATE),
              date(eDate).endOf('day').add(3, 'hour').format(DATABASE_DATE),
            ],
          },
          id_status: [
            findSalesStatusByKey('paid').id,
            findSalesStatusByKey('request-refund').id,
          ],
        },
      };

      return Commissions.findAll({
        raw: true,
        logging: console.log,
        attributes: [
          [Sequelize.fn('sum', Sequelize.col('amount')), 'paid_total'],
          timeAttribute,
        ],
        where: whereClause,
        include: [includeSaleItem],
        group: [
          Sequelize.fn(
            'DATE_FORMAT',
            Sequelize.fn(
              'DATE_SUB',
              Sequelize.col('sale_item.paid_at'),
              Sequelize.literal('INTERVAL 3 HOUR'),
            ),
            groupByFormat,
          ),
        ],
      });
    };

    const diff = date(end_date).diff(start_date, 'd');
    const labels = [];

    // Daily View
    if (diff <= 30) {
      const lastMonthStart = date(start_date)
        .subtract(1, 'month')
        .startOf('day')
        .format(DATABASE_DATE);
      const lastMonthEnd = date(end_date)
        .subtract(1, 'month')
        .endOf('day')
        .format(DATABASE_DATE);

      const [currentMonthData, lastMonthData] = await Promise.all([
        fetchCommissionMetrics(start_date, end_date, '%Y-%m-%d'),
        fetchCommissionMetrics(lastMonthStart, lastMonthEnd, '%Y-%m-%d'),
      ]);

      // Labels
      const lastMonthLabels = [];
      for (let i = 0; i <= diff; i += 1) {
        labels.push(
          date(start_date).add(i, 'days').format(DATABASE_DATE_WITHOUT_TIME),
        );
        lastMonthLabels.push(
          date(start_date)
            .subtract(1, 'month')
            .add(i, 'd')
            .format(DATABASE_DATE_WITHOUT_TIME),
        );
      }

      // Processing
      const total = currentMonthData.reduce(
        (acc, v) => acc + Number(v.paid_total || 0),
        0,
      );
      const totalLastMonth = lastMonthData.reduce(
        (acc, v) => acc + Number(v.paid_total || 0),
        0,
      );

      // Percentage
      let porcentage = 0;
      let isPositive = false;
      const differenceAbs = total - totalLastMonth;
      if (totalLastMonth > 0) {
        porcentage = parseFloat(
          ((differenceAbs / totalLastMonth) * 100).toFixed(1),
        );
        isPositive = porcentage >= 0;
      }

      // Map Data to Labels
      const mapDataToLabels = (dataArr, labelArr) =>
        labelArr.map((label) => {
          const dayData = dataArr.find((d) => d.time === label);
          return dayData ? Number(dayData.paid_total) : 0;
        });

      return res.status(200).send({
        total,
        labels,
        labels_last_month: lastMonthLabels,
        last_month: mapDataToLabels(lastMonthData, lastMonthLabels),
        current_month: mapDataToLabels(currentMonthData, labels),
        porcentage: {
          value: isPositive ? `+${porcentage}%` : `${porcentage}%`,
          isPositive,
        },
      });
    }

    // Monthly View (diff > 30)
    const monthlyData = await fetchCommissionMetrics(
      start_date,
      end_date,
      '%Y-%m',
    );
    const total = monthlyData.reduce(
      (acc, v) => acc + Number(v.paid_total || 0),
      0,
    );

    // Labels (Months)
    const monthDiff = date(end_date).diff(start_date, 'month');
    for (let i = 0; i <= monthDiff; i += 1) {
      labels.push(date(start_date).add(i, 'month').format('YYYY-MM'));
    }

    const current_month_values = labels.map((label) => {
      const mData = monthlyData.find((d) => d.time === label);
      return mData ? Number(mData.paid_total) : 0;
    });

    return res.status(200).send({
      total,
      labels, // These are YYYY-MM
      last_month: [],
      current_month: current_month_values,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const salesV2 = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { start_date, end_date, product_uuid },
  } = req;
  try {
    let productIds = [];
    if (product_uuid) {
      const products = await Products.findAll({
        raw: true,
        attributes: ['id'],
        where: {
          uuid: {
            [Op.in]: product_uuid.split(','),
          },
        },
      });
      if (products.length > 0) {
        productIds = products.map((p) => p.id);
      } else {
        return res.status(200).send({
          gross_total: 0,
          net_total: 0,
          transaction_count: 0,
        });
      }
    }

    const whereClause = {
      id_user,
    };
    if (productIds.length > 0) {
      whereClause.id_product = { [Op.in]: productIds };
    }

    const includeSaleItem = {
      association: 'sale_item',
      attributes: [],
      where: {
        paid_at: {
          [Op.between]: [
            date(start_date)
              .startOf('day')
              .add(3, 'hour')
              .format(DATABASE_DATE),
            date(end_date).endOf('day').add(3, 'hour').format(DATABASE_DATE),
          ],
        },
        id_status: [
          findSalesStatusByKey('paid').id,
          findSalesStatusByKey('request-refund').id,
        ],
      },
    };

    const result = await Commissions.findOne({
      raw: true,
      attributes: [
        [
          Sequelize.fn('count', Sequelize.col('commissions.id')),
          'transaction_count',
        ],
        [Sequelize.fn('sum', Sequelize.col('amount')), 'net_total'],
        [Sequelize.fn('sum', Sequelize.col('sale_item.price')), 'gross_total'],
      ],
      where: whereClause,
      include: [includeSaleItem],
    });

    return res.status(200).send({
      gross_total: Number(result?.gross_total || 0),
      net_total: Number(result?.net_total || 0),
      transaction_count: Number(result?.transaction_count || 0),
    });
  } catch (error) {
    console.log(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const metricsByStatusV2 = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { start_date = date(), end_date = date(), product },
  } = req;

  const productFilter = {};
  if (product) {
    const product_ids = product
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => !Number.isNaN(id));
    if (product_ids.length > 0) {
      productFilter.id_product = { [Op.in]: product_ids };
    }
  }

  try {
    const metricsQuery = await SalesMetricsDaily.findAll({
      raw: true,
      attributes: [
        [Sequelize.fn('sum', Sequelize.col('pending_count')), 'pending_count'],
        [Sequelize.fn('sum', Sequelize.col('paid_count')), 'paid_count'],
        [
          Sequelize.fn('sum', Sequelize.col('refunded_count')),
          'refunded_count',
        ],
        [
          Sequelize.fn('sum', Sequelize.col('chargeback_count')),
          'chargeback_count',
        ],
      ],
      where: {
        id_user,
        time: {
          [Op.between]: [
            date(start_date).startOf('day').format(DATABASE_DATE),
            date(end_date).endOf('day').format(DATABASE_DATE),
          ],
        },
        ...productFilter,
      },
    });
    const [metrics] = metricsQuery;
    const { pending_count, paid_count, refunded_count, chargeback_count } =
      metrics;
    const total =
      (pending_count ?? 0) +
      (paid_count ?? 0) +
      (refunded_count ?? 0) +
      (chargeback_count ?? 0);

    if (total === 0)
      return res.status(200).send({
        labels_series: ['Pago', 'Pendente', 'Reembolsado', 'Chargeback'],
        total,
        data_series: [0, 0, 0, 0],
      });
    return res.status(200).send({
      labels_series: ['Pago', 'Pendente', 'Reembolsado', 'Chargeback'],
      total,
      data_series: [
        ((paid_count ?? 0) / total) * 100,
        ((pending_count ?? 0) / total) * 100,
        ((refunded_count ?? 0) / total) * 100,
        ((chargeback_count ?? 0) / total) * 100,
      ],
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports = {
  getMetricsByConversionController,
  getMetricsByPaymentMethodsController,
  getMetricsByStatusController,
  getMetricsChartController,
  getProductsMetricsController,
  verifyUserSalesController,
  chartMetricsV2,
  salesV2,
  metricsByStatusV2,
  findTotalReward,
};
