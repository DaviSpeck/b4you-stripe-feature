const ApiError = require('../error/ApiError');
const SerializeProducts = require('../presentation/products/products');
const SerializeProduct = require('../presentation/products/SingleProduct');
const ProductsRepository = require('../repositories/sequelize/ProductsRepository');
const SalesItemsRepository = require('../repositories/sequelize/SalesItemsRepository');
const CoproductionsRepository = require('../repositories/sequelize/CoproductionsRepository');
const FindProductsPaginated = require('../useCases/products/FindProductsPaginated');
const FindSingleProduct = require('../useCases/products/FindSingleProduct');
const FindFilteredProducts = require('../useCases/products/FindFilteredProducts');
const FindProductCoproductions = require('../useCases/coproductions/FindProductsCoproductions');
const FindRefundAverage = require('../useCases/products/FindRefundAverage');
const SerializeAllProducts = require('../presentation/products/SerializeProducts');
const SerializeCoproductions = require('../presentation/coproductions/single');
const StudentSessionRepository = require('../repositories/sequelize/StudentSessionRepository');
const Database = require('../database/models/index');
const DateHelper = require('../utils/helpers/date');
const { DATABASE_DATE } = require('../types/dateTypes');
const Pages = require('../database/models/ProductPages');
const Products = require('../database/models/Products');
const Product_offer = require('../database/models/Product_offer');
const {
  findProductMarketStatus,
  findProductMarketStatusByKey,
} = require('../status/productMarketStatus');
const { findProductPageTypeByID } = require('../types/productPagesTypes');
const {
  createLogBackoffice,
} = require('../database/controllers/logs_backoffice');
const { findRoleTypeByKey } = require('../types/userEvents');
const HttpClient = require('../services/HTTPClient');
const Suppliers = require('../database/models/Suppliers');
const { capitalizeName } = require('../utils/formatters');
const { findSupplierStatus } = require('../status/suppliersStatus');
const { QueryTypes } = require('sequelize');

module.exports.findProducts = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 10,
      input = null,
      producerId = null,
      start_date = null,
      end_date = null,
    },
  } = req;

  try {
    const defaultStart = DateHelper()
      .utc()
      .subtract(7, 'd')
      .startOf('day')
      .format(DATABASE_DATE);

    const defaultEnd = DateHelper()
      .utc()
      .endOf('day')
      .format(DATABASE_DATE);

    const finalStartDate = start_date
      ? DateHelper(start_date).startOf('day').format(DATABASE_DATE)
      : defaultStart;

    const finalEndDate = end_date
      ? DateHelper(end_date).endOf('day').format(DATABASE_DATE)
      : defaultEnd;

    const { rows, count } = await new FindFilteredProducts({
      input,
      page,
      size,
      producerUuid: producerId,
      start_date: finalStartDate,
      end_date: finalEndDate,
    }).executeWithSQL();

    const [{ totalProductsAll }] = await Database.sequelize.query(
      `SELECT COUNT(id) AS totalProductsAll FROM products`,
      { type: QueryTypes.SELECT },
    );

    const last30Days = DateHelper()
      .utc()
      .subtract(30, 'd')
      .format(DATABASE_DATE);

    const [{ productsWithSalesLast30Days }] =
      await Database.sequelize.query(
        `
          SELECT COUNT(*) AS productsWithSalesLast30Days
          FROM (
            SELECT id_product
            FROM sales_items
            WHERE id_status = 2
              AND created_at >= :date
            GROUP BY id_product
          ) src
        `,
        {
          replacements: { date: last30Days },
          type: QueryTypes.SELECT,
        },
      );

    return res.send({
      success: true,
      message: 'Busca realizada com sucesso',
      info: {
        rows: new SerializeAllProducts(rows).adapt(),

        metrics: {
          totalProductsAll: Number(totalProductsAll) || 0,
          productsCreatedInPeriod: Number(count) || 0,
          productsWithSalesLast30Days:
            Number(productsWithSalesLast30Days) || 0,
        },

        pagination: {
          page: Number(page),
          size: Number(size),
          total: Number(count) || 0,
        },
      },
      status: 200,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }

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

module.exports.findSuppliers = async (req, res, next) => {
  const { productUuid } = req.params;
  try {
    const product = await Products.findOne({
      raw: true,
      where: {
        uuid: productUuid,
      },
      attributes: ['id'],
    });

    const suppliers = await Suppliers.findAll({
      nest: true,
      where: { id_product: product.id },
      include: [
        {
          association: 'user',
          attributes: ['full_name', 'email'],
        },
        {
          association: 'offer',
          attributes: ['name'],
        },
      ],
    });

    return res.status(200).send(
      suppliers.map((s) => ({
        user: {
          full_name: capitalizeName(s.user.full_name),
          email: s.user.email,
        },
        offer: s.offer ? { name: s.offer.name } : { name: 'N/A' },
        status: findSupplierStatus(s.id_status),
        id: s.id,
        commission: s.amount,
      })),
    );
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

module.exports.findAllUserProducts = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, input = null, userUuid },
  } = req;
  try {
    const { rows, count } = await new FindProductsPaginated(
      ProductsRepository,
    ).executeWithSQL({ input, page, size, userUuid });
    return res.send({
      count,
      rows: new SerializeProducts(rows).adapt(),
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

module.exports.findSingleProduct = async (req, res, next) => {
  const {
    params: { productUuid },
  } = req;
  try {
    const product = await new FindSingleProduct(
      ProductsRepository,
    ).executeWithSQL({
      productUuid,
    });
    product.refund_average = await new FindRefundAverage(
      SalesItemsRepository,
    ).executeWithSQL(product.id);
    return res.send(new SerializeProduct(product).adapt());
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

module.exports.findCoproductions = async (req, res, next) => {
  const {
    params: { productUuid },
  } = req;
  try {
    const coproductions = await new FindProductCoproductions(
      ProductsRepository,
      CoproductionsRepository,
    ).executeWithSQL({
      productUuid,
    });
    return res.send(new SerializeCoproductions(coproductions).adapt());
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

module.exports.accessMembership = async (req, res, next) => {
  const {
    params: { productUuid },
  } = req;
  try {
    const product = await ProductsRepository.find({ uuid: productUuid });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    const session = await StudentSessionRepository.create({ id_student: 0 });
    return res.status(200).send({
      url: `https://membros.b4you.com.br/acessar/${session.uuid}?producer_id=${product.id_user}`,
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

module.exports.getProductPages = async (req, res, next) => {
  const {
    params: { productUuid },
  } = req;
  try {
    const product = await ProductsRepository.find({ uuid: productUuid });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    const { count, rows } = await Pages.findAndCountAll({
      raw: true,
      where: {
        id_product: product.id,
      },
    });
    return res.send({
      count,
      rows: rows.map(({ label, url, id_type }) => ({
        label,
        url,
        type: findProductPageTypeByID(id_type).label,
      })),
    });
  } catch (error) {
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

module.exports.getProductMarket = async (req, res, next) => {
  const {
    query: { page = 0, size = 10 },
  } = req;
  try {
    const offset = page * size;
    const limit = Number(size);
    const { count, rows } = await Products.findAndCountAll({
      raw: true,
      offset,
      limit,
      attributes: [
        'uuid',
        'name',
        'list_on_market',
        'id_status_market',
        'recommended_market',
      ],
    });
    return res.send({
      count,
      rows: rows.map(
        ({
          uuid,
          name,
          list_on_market,
          id_status_market,
          recommended_market,
        }) => ({
          uuid,
          name,
          list_on_market,
          recommended_market,
          status: findProductMarketStatus(id_status_market),
        }),
      ),
    });
  } catch (error) {
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

module.exports.updateProductMarket = async (req, res, next) => {
  const {
    params: { productUuid },
    body: { recommend = false },
    user: { id },
  } = req;
  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    const product = await Products.findOne({
      where: {
        uuid: productUuid,
      },
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    await Products.update(
      { recommended_market: recommend },
      { where: { id: product.id } },
    );
    await createLogBackoffice({
      id_user_backoffice: id,
      id_event: recommend
        ? findRoleTypeByKey('recommend-market-approve').id
        : findRoleTypeByKey('recommend-market-remove').id,
      params: {
        user_agent,
        product_name: product.name,
      },
      ip_address,
      id_user: product.id_user,
    });
    return res.sendStatus(200);
  } catch (error) {
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

module.exports.removeProductMarket = async (req, res, next) => {
  const {
    params: { productUuid },
    user: { id },
  } = req;
  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    const product = await Products.findOne({
      where: {
        uuid: productUuid,
      },
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    await Products.update(
      { id_status_market: findProductMarketStatusByKey('hide').id },
      { where: { id: product.id } },
    );
    await createLogBackoffice({
      id_user_backoffice: id,
      id_event: findRoleTypeByKey('market-remove').id,
      params: {
        user_agent,
        product_name: product.name,
      },
      ip_address,
      id_user: product.id_user,
    });
    return res.sendStatus(200);
  } catch (error) {
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

module.exports.removeProductCheckout = async (req, res, next) => {
  const {
    params: { productUuid },
    body: { offerUuid },
    user: { id },
  } = req;
  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    const product = await Products.findOne({
      where: {
        uuid: productUuid,
      },
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    const offer = await Product_offer.findOne({
      where: {
        uuid: offerUuid,
      },
    });
    await Product_offer.update(
      { active: !offer.active, hide: !offer.active },
      { where: { uuid: offerUuid } },
    );
    const service = new HttpClient({
      baseURL: `https://api-b4.b4you.com.br/api/backoffice/`,
    });

    try {
      await service.post('offer', {
        offer_id: offerUuid,
        token: process.env.BACKOFFICE_TOKEN_OFFER_CACHE,
      });
    } catch (error) {
      console.log(`error ao tentar limpar cache oferta`, error);
    }

    await createLogBackoffice({
      id_user_backoffice: id,
      id_event: offer.hide
        ? findRoleTypeByKey('active-checkout').id
        : findRoleTypeByKey('remove-checkout').id,
      params: {
        user_agent,
        product_name: product.name,
      },
      ip_address,
      id_user: product.id_user,
    });
    return res.sendStatus(200);
  } catch (error) {
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

module.exports.updateSupportNumber = async (req, res, next) => {
  const {
    params: { productUuid },
    user: { id },
    body: { number = '' },
  } = req;
  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    const product = await Products.findOne({
      where: {
        uuid: productUuid,
      },
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    await Products.update(
      { support_whatsapp: number },
      { where: { id: product.id } },
    );
    await createLogBackoffice({
      id_user_backoffice: id,
      id_event: findRoleTypeByKey('update-number-product').id,
      params: {
        user_agent,
        product_name: product.name,
      },
      ip_address,
      id_user: product.id_user,
    });
    return res.sendStatus(200);
  } catch (error) {
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

module.exports.positionProductMarket = async (req, res, next) => {
  const {
    params: { productUuid },
    body: { index },
  } = req;
  try {
    const product = await Products.findOne({
      where: {
        uuid: productUuid,
      },
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    await Products.update(
      { recommend_market_position: index },
      { where: { id: product.id } },
    );
    return res.sendStatus(200);
  } catch (error) {
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

module.exports.secureEmail = async (req, res, next) => {
  const {
    params: { productUuid },
  } = req;
  try {
    const product = await Products.findOne({
      where: {
        uuid: productUuid,
      },
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    await Products.update(
      { secure_email: !product.secure_email },
      { where: { id: product.id } },
    );
    return res.sendStatus(200);
  } catch (error) {
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

module.exports.findAllUserProducts = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, input = null, userUuid },
  } = req;
  try {
    const { rows, count } =
      await ProductsRepository.findUserProductsPaginatedWithSQL({
        input,
        page,
        size,
        userUuid,
      });
    return res.send({
      count,
      rows: new SerializeProducts(rows).adapt(),
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

module.exports.findSingleProduct = async (req, res, next) => {
  const {
    params: { productUuid },
  } = req;
  try {
    const product = await ProductsRepository.findByUUIDWithSQL(productUuid);
    if (!product) throw ApiError.badRequest('Produto não encontrado');

    product.refund_average = await new FindRefundAverage(
      SalesItemsRepository,
    ).execute(product.id);

    return res.send(new SerializeProduct(product).adapt());
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
