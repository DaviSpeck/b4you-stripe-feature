const {
  findSingleProductWithProducer,
} = require('../../../database/controllers/products');
const {
  findAffiliateProduct,
} = require('../../../database/controllers/affiliates');
const {
  createWebhook,
  findUserWebhooks,
  updateWebhook,
  deleteWebhook,
} = require('../../../database/controllers/webhooks');
const ApiError = require('../../../error/ApiError');
const SerializeWebhooks = require('../../../presentation/dashboard/webhooks/webhooks');
const { findAffiliateStatusByKey } = require('../../../status/affiliateStatus');
const { findSupplierStatusByKey } = require('../../../status/suppliersStatus');
const { findWebhookTypeByKey } = require('../../../types/webhookTypes');
const Suppliers = require('../../../database/models/Suppliers');
const Products = require('../../../database/models/Products');

module.exports.create = async (req, res, next) => {
  const {
    user: { id: id_user },
    body,
  } = req;

  const {
    product_id,
    name,
    url,
    token,
    is_affiliate,
    is_supplier = false,
  } = body;

  let id_product = null;

  try {
    if (product_id && !is_affiliate && !is_supplier) {
      const product = await findSingleProductWithProducer({
        uuid: product_id,
        id_user,
      });
      if (!product) throw ApiError.badRequest('Produto não encontrado');
      id_product = product.id;
    }
    if (product_id !== 'all_affiliate' && is_affiliate) {
      const productAffiliate = await findAffiliateProduct({
        status: findAffiliateStatusByKey('active').id,
        id_user,
        '$product.uuid$': product_id,
      });
      if (!productAffiliate)
        throw ApiError.badRequest('Produto não encontrado');
      id_product = productAffiliate.id_product;
    }

    if (product_id !== 'all_supplier' && is_supplier) {
      const product = await Products.findOne({
        raw: true,
        where: {
          uuid: product_id,
        },
        attributes: ['id'],
      });
      if (!product) throw ApiError.badRequest('Produto não encontrado');

      const productSupplier = await Suppliers.findOne({
        where: {
          id_status: findSupplierStatusByKey('approved').id,
          id_user,
          id_product: product.id,
        },
      });

      if (!productSupplier) throw ApiError.badRequest('Produto não encontrado');
      id_product = productSupplier.id_product;
    }

    await createWebhook({
      id_product,
      events: '1,3,4,11',
      id_user,
      name,
      url,
      token,
      is_affiliate,
      is_supplier,
      id_type: findWebhookTypeByKey('arco').id,
    });

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

module.exports.get = async (req, res, next) => {
  const {
    query: { page = 0, size = 50 },
    user: { id: id_user },
  } = req;
  try {
    const { count, rows } = await findUserWebhooks(
      { id_user, id_type: findWebhookTypeByKey('arco').id },
      page,
      size,
    );
    return res
      .status(200)
      .send({ count, rows: new SerializeWebhooks(rows).adapt() });
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

module.exports.update = async (req, res, next) => {
  const {
    params: { webhook_uuid },
    user: { id: id_user },
    body,
  } = req;
  try {
    if (body.product_id && body.is_affiliate === false) {
      const product = await findSingleProductWithProducer({
        uuid: body.product_id,
        id_user,
      });
      if (!product) throw ApiError.badRequest('Produto não encontrado');
      body.id_product = product.id;
    }
    if (body.product_id !== 'all_affiliate' && body.is_affiliate) {
      const productAffiliate = await findAffiliateProduct({
        status: findAffiliateStatusByKey('active').id,
        id_user,
        '$product.uuid$': body.product_id,
      });
      if (!productAffiliate)
        throw ApiError.badRequest('Produto não encontrado');
      body.id_product = productAffiliate.id_product;
    }
    if (body.product_id && body.product_id === 'all_affiliate') {
      body.id_product = null;
    }
    if (!body.product_id) {
      body.id_product = null;
    }
    await updateWebhook({ uuid: webhook_uuid, id_user }, body);
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

module.exports.delete = async (req, res, next) => {
  const {
    params: { webhook_uuid },
    user: { id: id_user },
  } = req;
  try {
    await deleteWebhook({ uuid: webhook_uuid, id_user });
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
