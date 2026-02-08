const { AxiosError } = require('axios');
const _ = require('lodash');
const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const SerializeSaleItem = require('../../presentation/dashboard/salesItems');
const SerializeSaleItemComplete = require('../../presentation/dashboard/saleItemComplete');
const SerializeMetrics = require('../../presentation/common/salesMetrics');
const SerializeSalePage = require('../../presentation/dashboard/pageSaleFilters');
const {
  findOneSaleItemStudentAccess,
} = require('../../database/controllers/sales_items');
const {
  findAllSalesItemsPaginated,
  findAllSalesItemsMetrics,
} = require('../../database/controllers/sales_items');
const { paymentMethods } = require('../../types/paymentMethods');
const {
  salesStatus,
  findSalesStatusByKey,
  findStatus,
} = require('../../status/salesStatus');
const { rolesTypes } = require('../../types/roles');
const { findProducts } = require('../../database/controllers/products');
const {
  findRawProductsAffiliates,
} = require('../../database/controllers/affiliates');
const CoproductionsRepository = require('../../repositories/sequelize/CoproductionsRepository');

const ApprovedPaymentEmails = require('../../useCases/membership/approvedPaymentEmails');
const { findTransactionTypeByKey } = require('../../types/transactionTypes');
const SplitAffiliateCommission = require('../../useCases/dashboard/affiliates/SplitSaleItemCommission');
const SalesItemsRepository = require('../../repositories/sequelize/SalesItemsRepository');
const BalanceRepository = require('../../repositories/sequelize/BalanceRepository');
const AffiliatesRepository = require('../../repositories/sequelize/AffiliatesRepository');
const SubscriptionRepository = require('../../repositories/sequelize/SubscriptionRepository');
const DatabaseConfig = require('../../repositories/sequelize/Sequelize');
const SQS = require('../../queues/aws');
const Affiliates = require('../../database/models/Affiliates');
const Sales_items = require('../../database/models/Sales_items');
const Sales = require('../../database/models/Sales');
const models = require('../../database/models');
const date = require('../../utils/helpers/date');
const { FRONTEND_DATE } = require('../../types/dateTypes');
const { findRulesTypesByKey } = require('../../types/integrationRulesTypes');
const Products = require('../../database/models/Products');
const Plugins = require('../../database/models/Plugins');
const { findIntegrationTypeByKey } = require('../../types/integrationTypes');
const BlingV3 = require('../../services/integrations/BlingShippingV3Address');
const Cache = require('../../config/Cache');

const updateAddressBling = async (sale, address) => {
  const plugin = await Plugins.findOne({
    where: {
      id_user: sale.id_user,
      id_plugin: findIntegrationTypeByKey('blingshippingv3').id,
      active: true,
    },
  });
  if (!plugin) {
    // eslint-disable-next-line no-console
    console.log('PEDIDO BLING SEM INTEGRACAO ATIVA DO PRODUTO');
    return;
  }
  const blingV3 = new BlingV3(
    plugin.settings.refresh_token,
    plugin.settings.access_token,
  );
  const { refresh_token, access_token } = await blingV3.refreshToken();
  await Plugins.update(
    {
      settings: {
        ...plugin.settings,
        refresh_token,
        access_token,
      },
    },
    {
      where: {
        id: plugin.id,
      },
    },
  );
  await blingV3.updateAddress({
    id_bling: sale.id_order_bling,
    address,
  });
};

const validateFilters = (
  id_user,
  {
    endDate,
    page = 0,
    paymentMethod,
    product,
    role,
    size = 10,
    startDate,
    status,
    input,
    src,
    sck,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    affiliates,
    offers,
    coupons,
    offersNotTracking,
  },
) => {
  const query = {
    id_user,
    page,
    size,
  };
  if (product && product !== 'all') query.productID = product;
  if (offers) query.offers = offers;
  if (input) query.input = input;
  if (offersNotTracking) query.tracking_code = offersNotTracking === 'true';

  if (paymentMethod && paymentMethod !== 'all') {
    query.paymentMethod = paymentMethod.split(',');
  }

  if (status && status !== 'all') {
    query.id_status = status
      .split(',')
      .map((element) => findSalesStatusByKey(element).id);
  }

  if (startDate && endDate) {
    query.startDate = startDate;
    query.endDate = endDate;
  }

  if (affiliates) {
    query.affiliates = affiliates.split(',');
  }

  if (coupons) {
    if (coupons.includes(',')) {
      query.coupons = coupons.split(',');
    } else if (coupons === 'all') {
      query.coupons = 'all';
    } else {
      query.coupons = coupons;
    }
  }

  if (role && role !== 'all') {
    const splitedRole = role.split(',');
    const queryRole = {
      producer: false,
      coproducer: false,
      affiliate: false,
      supplier: false,
      manager: false,
    };
    if (splitedRole.includes('1')) queryRole.producer = true;
    if (splitedRole.includes('2')) queryRole.coproducer = true;
    if (splitedRole.includes('3')) queryRole.affiliate = true;
    if (splitedRole.includes('4')) queryRole.supplier = true;
    if (splitedRole.includes('5')) queryRole.manager = true;
    query.role = queryRole;
  } else {
    query.role = {
      producer: true,
      coproducer: true,
      affiliate: true,
      supplier: true,
      manager: true,
    };
  }

  const queryTracking = {
    src: '',
    sck: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
  };
  if (src) queryTracking.src = src;
  if (sck) queryTracking.sck = sck;
  if (utm_source) queryTracking.utm_source = utm_source;
  if (utm_medium) queryTracking.utm_medium = utm_medium;
  if (utm_campaign) queryTracking.utm_campaign = utm_campaign;
  if (utm_content) queryTracking.utm_content = utm_content;
  if (utm_term) queryTracking.utm_term = utm_term;

  query.trackingParameters = queryTracking;

  return query;
};

const findSalesController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;
  try {
    const { is_url_query = false } = query;
    const formattedQuery = validateFilters(id_user, query);
    if (is_url_query) {
      formattedQuery.uuid_sale_item = query.uuid_sale;
    }
    const sales = await findAllSalesItemsPaginated(formattedQuery);
    return res.status(200).send({
      count: sales.count,
      rows: new SerializeSaleItem(sales.rows, id_user).adapt(),
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

const findGroupedSalesController = async (req, res, next) => {
  const {
    params: { id_sale_item },
    query: { size = 10, page = 0 },
  } = req;
  try {
    const limit = parseInt(size, 10);
    const offset = limit * parseInt(page, 10);
    const salesItems = await Sales_items.findAndCountAll({
      nest: true,
      attributes: ['id', 'id_status', 'created_at', 'price_product'],
      offset,
      limit,
      where: {
        list: false,
        id_parent: id_sale_item,
      },
      order: [['id', 'desc']],
    });

    return res.status(200).send({
      count: salesItems.count,
      rows: salesItems.rows
        .map((r) => r.toJSON())
        .map((si) => ({
          ...si,
          status: findStatus(si.id_status),
          created_at: date(si.created_at).format(FRONTEND_DATE),
        })),
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

const exportSalesTrackingController = async (req, res, next) => {
  const {
    user: { id: id_user, first_name },
    body: { email, params },
  } = req;
  try {
    const formattedQuery = validateFilters(id_user, params);
    await SQS.add('exportSalesShipping', {
      query: formattedQuery,
      first_name,
      email,
    });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof AxiosError) {
      return res.status(400).send({ message: 'Faltou rodar o lambda' });
    }
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const uploadSalesTrackingController = async (req, res, next) => {
  const {
    body: { rows },
  } = req;
  try {
    for await (const [i, chunk] of _.chunk(rows, 20).entries()) {
      _.delay(SQS.add, 2000 * (i + 1), 'importSalesShipping', { rows: chunk });
    }
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof AxiosError) {
      return res.status(400).send({ message: 'Faltou rodar o lambda' });
    }
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const exportSalesController = async (req, res, next) => {
  const {
    user: { id: id_user, first_name },
    body: { email, params },
  } = req;
  const { format = 'xlsx' } = params;
  try {
    if (format !== 'csv' && format !== 'xlsx') {
      throw ApiError.badRequest('Formato inválido');
    }
    const formattedQuery = validateFilters(id_user, params);
    await SQS.add('exportSales', {
      query: formattedQuery,
      first_name,
      format,
      email,
    });

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof AxiosError) {
      return res.status(400).send({ message: 'Faltou rodar o lambda' });
    }
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const findSingleSaleController = async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { sale_item_id },
  } = req;

  try {
    const saleItem = await Sales_items.findOne({
      nest: true,
      where: { uuid: sale_item_id },
      include: [
        {
          association: 'sale_item_plugin',
          required: false,
          attributes: ['id_bling'],
        },
        {
          association: 'commissions',
          include: [{ association: 'user', attributes: ['full_name', 'uuid'] }],
        },
        { association: 'charges' },
        {
          association: 'coupon_sale',
          required: false,
          include: [
            {
              association: 'coupons_sales',
              required: false,
              paranoid: false,
              attributes: ['coupon', 'percentage', 'amount'],
            },
          ],
        },
        {
          association: 'offer',
          required: false,
          attributes: ['name', 'metadata'],
          paranoid: false,
        },
        {
          association: 'sale',
          attributes: [
            'full_name',
            'document_number',
            'whatsapp',
            'email',
            'address',
            'id_order_bling',
            'id_order_notazz',
          ],
        },
        {
          association: 'student',
          attributes: [
            'id',
            'email',
            'full_name',
            'document_number',
            'whatsapp',
            'bank_code',
            'account_agency',
            'account_number',
          ],
        },
        {
          association: 'refund',
          required: false,
        },
        {
          association: 'plan',
          paranoid: false,
        },
        {
          association: 'product',
          attributes: ['uuid', 'name', 'id_type', 'payment_type'],
          paranoid: false,
        },
      ],
    });
    if (!saleItem) throw ApiError.badRequest('Item de venda não encontrado');
    saleItem.id_user = id_user;
    return res
      .status(200)
      .send(new SerializeSaleItemComplete(saleItem).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const findSaleFiltersController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { search },
  } = req;

  try {
    const cacheKey = `sale_filters_${id_user}_${search || 'all'}`;
    const cachedData = await Cache.get(cacheKey);

    if (cachedData) {
      return res.status(200).send(JSON.parse(cachedData));
    }

    const [productions, coproductions, affiliations] = await Promise.all([
      findProducts({ id_user }),
      CoproductionsRepository.findAllRaw({ id_user }),
      findRawProductsAffiliates({ id_user }),
    ]);

    let affiliatesOptions = null;

    if (search) {
      const whereCondition = {
        '$product.id_user$': id_user,
        '$user.email$': { [Op.like]: `%${search}%` },
      };

      const affiliates = await Affiliates.findAll({
        raw: true,
        nest: true,
        attributes: ['uuid', 'id_user'],
        group: [
          'affiliates.id_user',
          'user.email',
          'user.full_name',
          'user.uuid',
        ],
        order: [['user', 'full_name', 'asc']],
        include: [
          { association: 'product', attributes: [] },
          {
            association: 'user',
            attributes: ['full_name', 'uuid', 'email'],
          },
        ],
        where: whereCondition,
      });

      affiliatesOptions = affiliates;
    }

    const response = new SerializeSalePage({
      productions,
      coproductions,
      affiliations,
      paymentMethods,
      salesStatus,
      rolesTypes,
      affiliates: affiliatesOptions,
    }).adapt();

    await Cache.set(cacheKey, JSON.stringify(response), 5);

    return res.status(200).send(response);
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

const studentAccessController = async (req, res, next) => {
  const {
    params: { sale_item_id },
    user: { id },
  } = req;
  try {
    const saleItem = await findOneSaleItemStudentAccess({
      uuid: sale_item_id,
      '$product.id_user$': id,
      id_status: findSalesStatusByKey('paid').id,
    });

    if (!saleItem) throw ApiError.badRequest('Item de venda não encontrado');
    const body = {
      product: saleItem.product,
      currentStudent: saleItem.student,
      saleItem,
      costTransaction: saleItem.transactions.find(
        (t) => t.id_type === findTransactionTypeByKey('cost').id,
      ),
      renew: false,
    };

    const urlStudentPassword = await new ApprovedPaymentEmails(body).execute();
    return res.status(200).send({
      message:
        'Link para aluno poder redefinir a senha. Um email já foi enviado para ele também',
      url: urlStudentPassword,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const splitCommissionAffiliateController = async (req, res, next) => {
  const {
    user: { id: id_user },
    body: { affiliate_uuid, sale_item_uuid },
  } = req;

  try {
    await new SplitAffiliateCommission(
      {
        affiliate_uuid,
        sale_item_uuid,
        id_user,
      },
      SalesItemsRepository,
      AffiliatesRepository,
      BalanceRepository,
      SubscriptionRepository,
      DatabaseConfig,
    ).execute();
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const findSalesMetricsController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;
  try {
    const formattedQuery = validateFilters(id_user, query);
    const salesMetrics = await findAllSalesItemsMetrics(formattedQuery);
    return res.status(200).send(new SerializeMetrics(salesMetrics).adapt());
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const findSalesOffersMetricsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const [offers] = await models.sequelize.query(
      `select id, name, id_product from product_offer where id_product in (select id from products where id_user = ${id_user})`,
    );
    return res.status(200).send({ offers });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const findCouponsOffersMetricsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const [coupons] = await models.sequelize.query(
      `SELECT c.id, c.coupon FROM coupons c WHERE c.id_product IN (SELECT id from products where id_user = :id_user) OR c.id_user_created = :id_user GROUP BY c.coupon;`,
      {
        replacements: {
          id_user,
        },
      },
    );
    return res.status(200).send({ coupons });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
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

const updateStudentDataController = async (req, res, next) => {
  const {
    params: { sale_item_uuid },
    body,
  } = req;
  try {
    const saleItem = await Sales_items.findOne({
      raw: true,
      attributes: ['id_sale'],
      where: { uuid: sale_item_uuid },
    });
    if (!saleItem) throw ApiError.badRequest('Venda não encontrada');
    const { street, zipcode, state, city, neighborhood, number, complement } =
      body;

    const sale = await Sales.findOne({
      raw: true,
      where: {
        id: saleItem.id_sale,
      },
      attributes: ['address', 'id_user', 'id_order_bling', 'id'],
    });

    const address = {
      ...sale.address,
      ...(street && { street }),
      ...(zipcode && { zipcode }),
      ...(state && { state }),
      ...(city && { city }),
      ...(neighborhood && { neighborhood }),
      ...(number && { number }),
      ...(complement && { complement }),
    };
    if (sale.id_order_bling) {
      try {
        // eslint-disable-next-line no-console
        console.log('UPDATE ADDRESS BLING', sale.id_order_bling);
        await updateAddressBling(sale, address);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(
          `ERROR ON UPDATE ADDRESS BLING ${sale.id_order_bling}`,
          error?.response?.data,
        );
      }
    }
    await Sales.update(
      { ...body, address },
      { where: { id: saleItem.id_sale } },
    );
    return res.sendStatus(200);
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

const updateTrackingController = async (req, res, next) => {
  const {
    params: { sale_item_uuid },
    body,
  } = req;
  try {
    const saleItem = await Sales_items.findOne({
      attributes: ['id', 'id_product'],
      where: { uuid: sale_item_uuid },
    });
    if (!saleItem) throw ApiError.badRequest('Venda não encontrada');
    const { tracking_code, tracking_url } = body;

    saleItem.tracking_url = tracking_url;
    saleItem.tracking_code = tracking_code;
    await saleItem.save();
    const product = await Products.findOne({
      where: {
        id: saleItem.id_product,
      },
    });
    await SQS.add('webhookEvent', {
      id_product: saleItem.id_product,
      id_sale_item: saleItem.id,
      id_user: product.id_user,
      id_event: findRulesTypesByKey('tracking').id,
    });
    return res.sendStatus(200);
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

module.exports = {
  findSalesController,
  findSaleFiltersController,
  findSingleSaleController,
  studentAccessController,
  splitCommissionAffiliateController,
  findSalesMetricsController,
  exportSalesController,
  exportSalesTrackingController,
  uploadSalesTrackingController,
  updateStudentDataController,
  findSalesOffersMetricsController,
  findCouponsOffersMetricsController,
  findGroupedSalesController,
  updateTrackingController,
};
