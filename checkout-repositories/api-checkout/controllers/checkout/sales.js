const moment = require('moment');
const ApiError = require('../../error/ApiError');
const CreditCardSale = require('../../useCases/checkout/sales/CreditCardSale');
const PixSale = require('../../useCases/checkout/sales/PixSale');
const BilletSale = require('../../useCases/checkout/sales/BilletSale');
const SubscriptionSale = require('../../useCases/checkout/sales/SubscriptionSale');
const UpsellSale = require('../../useCases/checkout/sales/UpsellSale');
const Sales_items = require('../../database/models/Sales_items');
const RenewSubscription = require('../../useCases/checkout/sales/RenewSubscription');
const { findSaleItemInfo } = require('../../database/controllers/sales_items');
const { findStatus } = require('../../status/salesStatus');
const { resolveUpsellURL } = require('../../useCases/checkout/sales/common');
const models = require('../../database/models/index');
const Cache = require('../../config/Cache');
const Charges = require('../../database/models/Charges');
const { pixelsTypes } = require('../../types/pixelsTypes');
const ShopifyNotificationUseCase = require('../../useCases/checkout/sales/ShopifyNotifySale');
const {
  recordEcommerceSaleIfApplicable,
} = require('../../database/controllers/shopify_catalog');

let serializeError;

(async () => {
  const module = await import('serialize-error');
  serializeError = module.serializeError;
})();
require('moment/locale/pt-br');

moment.locale('pt-br');

const { formatWhatsapp } = require('../../utils/formatters');

const shopifyNotificationController = async (req, res, next) => {
  const { shopName, accessToken, orderData } = req.body;

  try {
    const response = await new ShopifyNotificationUseCase(
      shopName,
      accessToken,
      orderData,
    ).execute();

    return res.status(200).send(response);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    if (error && error.response && error.response.status === 400) {
      return res.status(error.response.status).send(error.response.data);
    }
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

/**
 * Controller for processing credit card sales
 * Handles single and multi-card payments with order bumps and coupons
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Array<Object>} req.body.cards - Array of card objects for payment
 * @param {string} req.body.offer_id - UUID of the offer
 * @param {Array<Object>} [req.body.order_bumps] - Array of order bump offers
 * @param {string} [req.body.coupon] - Coupon code
 * @param {string} [req.body.sessionID] - Session identifier
 * @param {string} [req.body.b4f] - B4F identifier
 * @param {string} [req.body.full_name] - Customer full name
 * @param {string} [req.body.email] - Customer email
 * @param {string} [req.body.document_number] - Customer CPF/CNPJ
 * @param {string} [req.body.whatsapp] - Customer WhatsApp number
 * @param {Object} [req.body.address={}] - Customer address
 * @param {number} [req.body.integration_shipping_price] - External shipping price
 * @param {string} [req.body.integration_shipping_company] - External shipping company
 * @param {string} [req.body.visitorId] - Visitor identifier
 * @param {Object} [req.body.params] - Additional parameters
 * @param {Object} req.cookies - Request cookies
 * @param {string} req.ip - Client IP address
 * @param {string} [req.eventSessionId] - Event session identifier
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends payment data response or error
 */
const createSaleCardController = async (req, res, next) => {
  const {
    body: {
      cards,
      offer_id,
      order_bumps,
      coupon,
      sessionID,
      b4f,
      full_name,
      email,
      document_number,
      whatsapp,
      address = {},
      integration_shipping_price,
      integration_shipping_company,
      visitorId,
      params,
    },
    cookies,
    ip,
    eventSessionId,
  } = req;

  let {
    session: { personal_data = {} },
  } = req;

  if (Object.keys(personal_data).length === 0) {
    personal_data = {
      full_name,
      email,
      whatsapp: formatWhatsapp(whatsapp),
      document_number,
      address,
      params,
    };
  }

  // forçando o address que vem na requisição
  personal_data.address = address;

  try {
    const agent = req.headers['user-agent'];

    const paymentData = await new CreditCardSale(
      {
        offer_id,
        order_bumps,
        cards,
        cookie: cookies.sixid,
        ip,
        agent,
        coupon,
        session_id: sessionID,
        eventSessionId,
        b4f,
        integration_shipping_price,
        integration_shipping_company,
        visitor_id: visitorId,
      },
      { ...personal_data, document_number },
    ).execute();

    return res.status(200).send(paymentData);
  } catch (error) {
    // eslint-disable-next-line

    try {
      const method = Object.keys(req.route?.methods || {})[0]?.toUpperCase();
      const url = req.originalUrl;
      const body = JSON.stringify(req.body);
      const errorSerialized = serializeError
        ? serializeError(error)
        : { message: error.message };
      const logMsg = `${req.id}Erro CARTÃO | **ERROR -> ${JSON.stringify(
        errorSerialized,
      )} | method: ${method} | url: ${url} | body: ${body}`;
      // eslint-disable-next-line no-console
      console.dir(logMsg, { depth: 4 });
    } catch (logError) {
      // eslint-disable-next-line no-console
      console.error(
        '(error) Erro ao gerar compra no CARTÃO (fallback log)',
        req,
        error,
      );
      // eslint-disable-next-line no-console
      console.log(
        '(log) Erro ao gerar compra no CARTÃO (fallback log)',
        req,
        error,
      );
    }
    if (error instanceof ApiError) return res.status(error.code).send(error);
    if (
      error.response &&
      error.response.status &&
      error.response.status === 400
    ) {
      return res.status(error.response.status).send(error.response.data);
    }
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

/**
 * Controller for processing PIX sales
 * Handles PIX payment generation with order bumps and coupons
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.offer_id - UUID of the offer
 * @param {Array<Object>} [req.body.order_bumps] - Array of order bump offers
 * @param {string} [req.body.socket_id] - Socket ID for real-time updates
 * @param {string} [req.body.coupon] - Coupon code
 * @param {string} [req.body.b4f] - B4F identifier
 * @param {string} [req.body.full_name] - Customer full name
 * @param {string} [req.body.email] - Customer email
 * @param {string} [req.body.document_number] - Customer CPF/CNPJ
 * @param {string} [req.body.whatsapp] - Customer WhatsApp number
 * @param {Object} [req.body.address={}] - Customer address
 * @param {number} [req.body.integration_shipping_price] - External shipping price
 * @param {string} [req.body.integration_shipping_company] - External shipping company
 * @param {Object} [req.body.params] - Additional parameters
 * @param {Object} req.cookies - Request cookies
 * @param {string} req.ip - Client IP address
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Sends payment data response or error
 */
const createSalePixController = async (req, res, next) => {
  const {
    body: {
      offer_id,
      order_bumps,
      socket_id,
      coupon,
      b4f,
      full_name,
      email,
      document_number,
      whatsapp,
      address = {},
      integration_shipping_price,
      integration_shipping_company,
      params,
    },
    cookies,
    ip,
  } = req;
  let {
    session: { personal_data = {} },
  } = req;
  if (Object.keys(personal_data).length === 0) {
    personal_data = {
      full_name,
      email,
      whatsapp: formatWhatsapp(whatsapp),
      document_number,
      address,
      params,
    };
  }

  // forçando o address que vem na requisição
  personal_data.address = address;

  const startTime = Date.now();
  let executionTime = null;
  try {
    const paymentData = await new PixSale(
      {
        offer_id,
        order_bumps,
        socket_id,
        cookie: cookies.sixid,
        coupon,
        b4f,
        integration_shipping_price,
        integration_shipping_company,
      },
      personal_data,
      ip,
    ).execute();
    executionTime = Date.now() - startTime;
    // eslint-disable-next-line no-console
    console.log(
      `[PIX Sale Execution] Time: ${executionTime}ms | Body: ${JSON.stringify(
        req.body,
      )}`,
    );
    return res.status(200).send(paymentData);
  } catch (error) {
    executionTime = Date.now() - startTime;
    // eslint-disable-next-line no-console
    console.log(
      `ERROR [PIX Sale Execution] Time: ${executionTime}ms | Body: ${JSON.stringify(
        req.body,
      )}`,
    );
    try {
      const method = Object.keys(req.route?.methods || {})[0]?.toUpperCase();
      const url = req.originalUrl;
      const body = JSON.stringify(req.body);
      const stack = error instanceof Error ? error.stack : undefined;
      const logMsg = `${
        req.id
      } (log-02) Erro ao gerar PIX | method: ${method} | url: ${url} | body: ${body} | **ERROR -> ${JSON.stringify(
        error,
      )} | stack: ${stack}`;
      // eslint-disable-next-line no-console
      console.log(logMsg);
    } catch (logError) {
      // eslint-disable-next-line no-console
      console.error('(error) Erro ao gerar PIX (fallback log)', req, error);
      // eslint-disable-next-line no-console
      console.log('(log) Erro ao gerar PIX (fallback log)', req, error);
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

const resolveStatus = (id_status) => {
  if (id_status === 1) return 'pending';
  if (id_status === 2) return 'confirmed';
  if (id_status === 6) return 'expired';
  return 'error';
};

const salePixStatusController = async (req, res, next) => {
  const { sale_id } = req.body;
  const key = `sale_status_${sale_id}`;
  try {
    const cachedStatus = await Cache.get(key);
    if (cachedStatus) {
      return res.status(200).send({
        status: cachedStatus,
      });
    }
    const mainProductSaleItem = await Sales_items.findOne({
      where: { uuid: sale_id },
      attributes: ['id_status', 'id', 'id_sale', 'id_student'],
      raw: true,
    });

    if (!mainProductSaleItem) {
      return res.status(404).send({ message: 'sale_item not found' });
    }

    const charge = await Charges.findOne({
      raw: true,
      attributes: ['id_status'],
      order: [['id', 'desc']],
      where: {
        id_sale: mainProductSaleItem.id_sale,
        id_student: mainProductSaleItem.id_student,
        payment_method: 'pix',
      },
    });

    const status = resolveStatus(charge.id_status);

    if (status === 'confirmed') {
      const ecommerceRecordedKey = `pix_ecommerce_recorded_${mainProductSaleItem.id_sale}`;
      const alreadyRecorded = await Cache.get(ecommerceRecordedKey);
      if (!alreadyRecorded) {
        await Cache.set(ecommerceRecordedKey, '1', 86400);
        const saleItems = await Sales_items.findAll({
          where: { id_sale: mainProductSaleItem.id_sale },
          attributes: ['id_offer'],
          raw: true,
        });
        for (const item of saleItems) {
          if (item.id_offer) {
            await recordEcommerceSaleIfApplicable(item.id_offer);
          }
        }
      }
    }

    return res.status(status === 'error' ? 400 : 200).send({
      status,
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

const saleBilletStatusController = async (req, res, next) => {
  const { sale_id } = req.body;
  try {
    const mainProductSaleItem = await Sales_items.findOne({
      where: { uuid: sale_id },
      attributes: ['id_status', 'id', 'id_sale', 'id_student'],
      raw: true,
    });

    if (!mainProductSaleItem) {
      return res.status(404).send({ message: 'sale_item not found' });
    }

    const charge = await Charges.findOne({
      raw: true,
      attributes: ['id_status'],
      order: [['id', 'desc']],
      where: {
        id_sale: mainProductSaleItem.id_sale,
        id_student: mainProductSaleItem.id_student,
        payment_method: 'billet',
      },
    });

    if (!charge) {
      return res.status(404).send({ message: 'charge not found' });
    }

    const status = resolveStatus(charge.id_status);

    if (status === 'confirmed') {
      const ecommerceRecordedKey = `billet_ecommerce_recorded_${mainProductSaleItem.id_sale}`;
      const alreadyRecorded = await Cache.get(ecommerceRecordedKey);
      if (!alreadyRecorded) {
        await Cache.set(ecommerceRecordedKey, '1', 86400);
        const saleItems = await Sales_items.findAll({
          where: { id_sale: mainProductSaleItem.id_sale },
          attributes: ['id_offer'],
          raw: true,
        });
        for (const item of saleItems) {
          if (item.id_offer) {
            await recordEcommerceSaleIfApplicable(item.id_offer);
          }
        }
      }
    }

    return res.status(status === 'error' ? 400 : 200).send({
      status,
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

const createSaleBilletController = async (req, res, next) => {
  const {
    body: {
      offer_id,
      order_bumps,
      coupon,
      b4f,
      full_name,
      email,
      whatsapp,
      document_number,
      address = {},
      integration_shipping_price,
      integration_shipping_company,
      params,
    },
    cookies,
    ip,
  } = req;
  let {
    session: { personal_data = {} },
  } = req;
  if (Object.keys(personal_data).length === 0) {
    personal_data = {
      full_name,
      email,
      whatsapp: formatWhatsapp(whatsapp),
      document_number,
      address,
      params,
    };
  }
  // forçando address da requisicao
  personal_data.address = address;
  const dbTransaction = await models.sequelize.transaction();
  try {
    const paymentData = await new BilletSale(
      {
        offer_id,
        order_bumps,
        cookie: cookies.sixid,
        coupon,
        b4f,
        integration_shipping_price,
        integration_shipping_company,
      },
      personal_data,
      dbTransaction,
      ip,
    ).execute();
    await dbTransaction.commit();
    return res.status(200).send(paymentData);
  } catch (error) {
    // console.log(error);
    await dbTransaction.rollback();
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

const createSubscriptionController = async (req, res, next) => {
  const {
    body: {
      cards = [],
      offer_id,
      plan_id,
      payment_method,
      order_bumps,
      coupon,
      full_name,
      email,
      document_number,
      whatsapp,
      address = {},
      params,
      integration_shipping_price,
      integration_shipping_company,
      b4f,
      visitorId = null,
      visitor_id = null,
    },
    cookies,
    ip,
  } = req;

  const card = cards?.[0] || null;

  let {
    session: { personal_data = {} },
  } = req;

  if (Object.keys(personal_data).length === 0) {
    personal_data = {
      full_name,
      email,
      whatsapp: formatWhatsapp(whatsapp),
      document_number,
      address,
      params,
    };
  }

  personal_data.address = address;

  try {
    const agent = req.headers['user-agent'];

    const paymentData = await new SubscriptionSale(
      {
        offer_id,
        plan_id,
        card,
        cookie: cookies.sixid,
        payment_method,
        ip,
        agent,
        order_bumps,
        coupon,
        integration_shipping_price,
        integration_shipping_company,
        b4f,
        visitor_id: visitorId || visitor_id,
      },
      { ...personal_data, document_number },
    ).execute();

    return res.status(200).send(paymentData);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }

    if (error?.response?.status === 400) {
      return res.status(error.response.status).send(error.response.data);
    }

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

/**
 * Controller for processing upsell sales
 * Handles additional product purchases after main sale completion
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.offer_id - UUID of the upsell offer
 * @param {string} req.body.sale_item_id - UUID of the main sale item
 * @param {number} [req.body.installments] - Number of installments for card payment
 * @param {string} req.body.payment_method - Payment method ('card', 'pix', etc.)
 * @param {Object} [req.body.card] - Card object if payment method is card
 * @param {string} [req.body.plan_id] - Plan UUID if upsell is a subscription
 * @param {string} req.ip - Client IP address
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends upsell sale data response or error
 */
const createUpsellController = async (req, res) => {
  // Set CORS headers for all responses from this controller
  const { origin } = req.headers;
  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  const {
    body: {
      offer_id,
      sale_item_id,
      installments,
      payment_method,
      card,
      plan_id,
    },
    ip,
  } = req;

  const dbTransaction = await models.sequelize.transaction();

  try {
    const response = await new UpsellSale(
      {
        offer_id,
        sale_item_id,
        installments,
        payment_method,
        card,
        plan_id,
        query: req.query,
        ip,
      },
      dbTransaction,
    ).execute();
    await dbTransaction.commit();
    return res.status(200).send(response);
  } catch (error) {
    await dbTransaction.rollback();
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    if (error.response && error.response.status === 400) {
      return res.status(error.response.status).send(error.response.data);
    }
    // eslint-disable-next-line
    // eslint-disable-next-line no-console
    console.log('error upsell -> ', error);
    return res.status(500).send({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const renewSubscriptionController = async (req, res, next) => {
  const {
    body: { payment_method, card, subscription_id },
    ip,
  } = req;
  try {
    const response = await new RenewSubscription({
      payment_method,
      card,
      subscription_id,
      ip,
    }).execute();
    return res.status(200).send(response);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    if (error && error.response && error.response.status === 400) {
      return res.status(error.response.status).send(error.response.data);
    }
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

const serializePixels = (pixels, sessionPixelsEventId) =>
  pixelsTypes.reduce(
    (a, v) => ({
      ...a,
      sessionPixelsEventId,
      [v.type]: pixels
        .filter((p) => p.id_type === v.id)
        .map(({ uuid: uid, settings }) => {
          const { api_token, domain, ...rest } = settings;
          return {
            uuid: uid,
            settings: {
              domain: domain ? `pixel.${domain}` : `${process.env.PIXEL_URL}`,
              api_token: !!api_token,
              ...rest,
            },
          };
        }),
    }),
    {},
  );

const salePixInfoController = async (req, res, next) => {
  const {
    params: { saleItemUuid },
  } = req;
  try {
    const saleItem = await findSaleItemInfo({
      uuid: saleItemUuid,
      payment_method: 'pix',
    });
    if (!saleItem) throw ApiError.badRequest('Venda não encontrada');
    const { student, sale, offer, charges } = saleItem;
    let pixels = [];
    if (saleItem.id_affiliate) {
      [pixels] = await models.sequelize.query(
        `select * from pixels where id_product = ${saleItem.id_product} and id_user = (select id_user from affiliates where id = ${saleItem.id_affiliate} )`,
      );
    } else {
      [pixels] = await models.sequelize.query(
        `select * from pixels where id_role = 1 and id_product = ${saleItem.id_product}`,
      );
    }
    const [charge] = charges;
    return res.status(200).send({
      qrcode: charge.qrcode_url,
      pix_code: charge.pix_code,
      status: findStatus(saleItem.id_status),
      upsell_url: resolveUpsellURL(saleItem.upsell_url, saleItemUuid),
      price: charge.price,
      student: {
        ...student,
        ...sale,
      },
      offer,
      pixels: serializePixels(pixels, '123qwe'),
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    if (error && error.response && error.response.status === 400) {
      return res.status(error.response.status).send(error.response.data);
    }
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
  createSaleCardController,
  createSalePixController,
  createSaleBilletController,
  createSubscriptionController,
  createUpsellController,
  salePixStatusController,
  saleBilletStatusController,
  renewSubscriptionController,
  salePixInfoController,
  shopifyNotificationController,
};
