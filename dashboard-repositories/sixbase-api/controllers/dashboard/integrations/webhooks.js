const { Op } = require('sequelize');
const moment = require('moment');
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
const Webhooks = require('../../../services/integrations/Webhooks');
const { findRulesTypes } = require('../../../types/integrationRulesTypes');
const SerializeWebhooks = require('../../../presentation/dashboard/webhooks/webhooks');
const TestWebook = require('../../../useCases/dashboard/webhooks/eventsTest');
const { findAffiliateStatusByKey } = require('../../../status/affiliateStatus');
const Webhooks_logs = require('../../../database/models/Webhooks_logs');
const Suppliers = require('../../../database/models/Suppliers');
const {
  resendWebhookLog,
} = require('../../../database/controllers/webhooks_logs');

module.exports.createWebhook = async (req, res, next) => {
  const {
    user: { id: id_user },
    body,
  } = req;

  const {
    product_id,
    events: eventsArray,
    name,
    url,
    token,
    is_affiliate,
    is_supplier,
    id_type = 1,
  } = body;

  let id_product = null;

  try {
    try {
      // await new Webhooks(url, token).testURL(); // desativando para integracao 23/01/2025
    } catch (error) {
      throw ApiError.badRequest('URL inválida');
    }
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
      const productSupplier = await Suppliers.findOne({
        nest: true,
        where: {
          id_user,
          id_status: 2,
          '$product.uuid$': product_id,
        },
        include: [
          {
            association: 'product',
            attributes: ['id', 'uuid'],
          },
        ],
      });
      if (!productSupplier) throw ApiError.badRequest('Produto não encontrado');
      id_product = productSupplier.id_product;
    }

    let events = '';

    for (const event of eventsArray) {
      const integrationType = findRulesTypes(event);
      if (!integrationType) throw ApiError.badRequest('Evento inválido');
      events += `${integrationType.id},`;
    }

    await createWebhook({
      id_product,
      events: events.slice(0, events.length - 1),
      id_user,
      name,
      url,
      token,
      is_affiliate,
      id_type,
      is_supplier,
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

module.exports.verifyWebhook = async (req, res) => {
  const { url, token } = req.body;
  try {
    await new Webhooks(url, token).testURL();
    return res.status(200).send({ success: true });
  } catch (error) {
    return res.status(200).send({ success: false });
  }
};

module.exports.getUserWebhooks = async (req, res, next) => {
  const {
    query: { page = 0, size = 50, id_type = 1 },
    user: { id: id_user },
  } = req;
  try {
    const { count, rows } = await findUserWebhooks(
      { id_user, id_type },
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

module.exports.getUserHistoryWebhooks = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 10,
      event = 'all',
      status = 'all',
      date = 'null',
    },
    params: { id },
    user: { id: id_user },
  } = req;

  try {
    const offset = Number(page * size);
    const limit = Number(size);

    const where = {
      id_webhook: id,
    };

    if (event !== 'all') {
      where.id_event = event;
    }

    if (status !== 'all') {
      where.success = status;
    }

    if (date && date !== 'null') {
      const startDate = moment(date).startOf('day').toDate();
      const endDate = moment(date).endOf('day').toDate();

      where[Op.or] = [
        {
          [Op.and]: [
            { sent_at: { [Op.ne]: null } },
            { sent_at: { [Op.gte]: startDate, [Op.lte]: endDate } },
          ],
        },
        {
          [Op.and]: [
            { sent_at: null },
            { created_at: { [Op.gte]: startDate, [Op.lte]: endDate } },
          ],
        },
      ];
    }

    const webhooks = await Webhooks_logs.findAndCountAll({
      raw: true,
      where,
      offset,
      limit,
      order: [['id', 'desc']],
      include: [
        {
          association: 'webhook',
          where: { id_user },
          attributes: ['id', 'id_user'],
        },
      ],
    });

    const data = webhooks.rows.map((e) => ({
      ...e,
      event: findRulesTypes(e.id_event),
    }));

    return res.status(200).send({
      count: webhooks.count,
      rows: data,
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

module.exports.updateWebhook = async (req, res, next) => {
  const {
    params: { webhook_uuid },
    user: { id: id_user },
    body,
  } = req;
  try {
    if (Object.keys(req.body).length === 0)
      throw ApiError.badRequest({ message: 'empty body' });
    if (body.url) {
      try {
        // await new Webhooks(body.url).testURL();
      } catch (error) {
        throw ApiError.badRequest('URL inválida');
      }
    }
    if (body.product_id && body.is_affiliate === false) {
      const product = await findSingleProductWithProducer({
        uuid: body.product_id,
        id_user,
      });
      if (!product) throw ApiError.badRequest('Produto não encontrado');
      body.id_product = product.id;
    }
    if (body.product_id === '') {
      body.id_product = null;
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
    if (body.events) {
      let events = '';
      for (const event of body.events) {
        const integrationType = findRulesTypes(event);
        if (!integrationType) throw ApiError.badRequest('Evento inválido');
        events += `${integrationType.id},`;
      }
      body.events = events.slice(0, events.length - 1);
    }
    body.invalid = false;
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

module.exports.deleteWebhook = async (req, res, next) => {
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

module.exports.testWebhooks = async (req, res, next) => {
  const {
    body: { id_event, url, token },
  } = req;
  try {
    const data = await new TestWebook({ url, id_event, token }).execute();
    return res.status(200).send(data);
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

module.exports.resendWebhook = async (req, res, next) => {
  const { id, url, reqBody } = req.body;

  try {
    const data = await resendWebhookLog(id, url, reqBody);
    return res.status(200).send(data);
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
