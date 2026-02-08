const { Op } = require('sequelize');
const ApiError = require('../error/ApiError');
const { formatName, formatWhatsapp } = require('../utils/formatters');
const { findOnePixel } = require('../database/controllers/pixels');
const ConversionApi = require('../services/ConversionApi');
const { findOneOffer } = require('../database/controllers/product_offer');
const { createCart, deleteCart } = require('../database/controllers/cart');
const SalesItems = require('../database/models/Sales_items');
const Sales = require('../database/models/Sales');
const FindAffiliate = require('../useCases/checkout/affiliates/FindAffiliate');
const FindCart = require('../useCases/checkout/cart/FindCart');
const SerializeCart = require('../presentation/checkout/cart');

const initiateCartController = async (req, res, next) => {
  const {
    session,
    body: {
      full_name,
      document_number,
      email,
      whatsapp,
      params,
      offer_uuid,
      address,
      coupon,
    },
    cookies: { sixid },
  } = req;

  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.get('User-Agent');

  const personal_data = {
    full_name: formatName(full_name),
    whatsapp: formatWhatsapp(whatsapp),
    document_number,
    email,
    ip_address,
    user_agent,
    params,
    address,
  };
  try {
    const offer = await findOneOffer({ uuid: offer_uuid });
    if (!offer) throw ApiError.badRequest('Oferta não encontrada');

    await deleteCart(
      {
        email,
        abandoned: 0,
        [Op.or]: {
          id_offer: offer.id,
          id_product: offer.id_product,
        },
      },
      true,
    );

    const affiliate = await new FindAffiliate({
      sixid,
      id_offer: offer.id,
      id_product: offer.id_product,
      affiliate_settings: offer.offer_product.affiliate_settings,
    }).execute();

    const hasAddress =
      typeof address === 'object' ? Object.keys(address).length > 0 : false;

    const newCart = await createCart({
      full_name: formatName(full_name),
      whatsapp: formatWhatsapp(whatsapp),
      document_number,
      email,
      id_offer: offer.id,
      id_product: offer.id_product,
      id_affiliate: affiliate?.id_user,
      coupon,
      address: hasAddress ? address : null,
    });

    personal_data.id_cart = newCart.id;
    personal_data.id_offer = offer.id;
    session.personal_data = personal_data;
    return res.status(200).send('OK');
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

const findCardController = async (req, res, next) => {
  const {
    params: { card_id },
  } = req;

  try {
    const card = await new FindCart(card_id).execute();

    return res.status(200).send(new SerializeCart(card).adapt());
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

const fbPixelController = async (req, res, next) => {
  let { personal_data } = req.session;
  const { _fbp } = req.cookies;
  const {
    custom_data,
    event_id,
    event_name,
    pixel_uuid,
    method = 'card',
  } = req.body;

  if (!personal_data) {
    personal_data = {
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.get('User-Agent'),
    };
  }

  try {
    const pixel = await findOnePixel({ uuid: pixel_uuid });
    if (!pixel) throw ApiError.badRequest('Pixel não encontrado');
    const {
      settings: { pixel_id, token },
    } = pixel;
    if (event_name === 'InitiateCheckout') {
      await new ConversionApi(
        pixel_id,
        token,
        pixel.user.email || null,
      ).initiateCheckout({
        client_ip_address: personal_data.ip_address,
        client_user_agent: personal_data.user_agent,
        fbp: _fbp,
        event_id,
        personal_data,
      });
    } else if (event_name === 'Purchase') {
      if (method !== 'pix') {
        await new ConversionApi(
          pixel_id,
          token,
          pixel.user.email || null,
        ).purchase({
          personal_data,
          fbp: _fbp,
          event_id,
          client_ip_address: personal_data.ip_address,
          client_user_agent: personal_data.user_agent,
          custom_data,
        });
      }
      if (custom_data.sale_id) {
        const saleItem = await SalesItems.findOne({
          nest: true,
          raw: true,
          where: {
            uuid: custom_data.sale_id,
          },
          attributes: ['id_sale'],
        });
        if (saleItem) {
          await Sales.update(
            {
              fb_pixel_info: {
                pixel_id,
                token,
                personal_data,
                fbp: _fbp,
                event_id,
                client_ip_address: personal_data.ip_address,
                client_user_agent: personal_data.user_agent,
                custom_data,
              },
            },
            { where: { id: saleItem.id_sale } },
          );
        }
      }
    } else if (event_name === 'AddPaymentInfo') {
      await new ConversionApi(
        pixel_id,
        token,
        pixel.user.email || null,
      ).addPaymentInfo({
        personal_data,
        fbp: _fbp,
        event_id,
        client_ip_address: personal_data.ip_address,
        client_user_agent: personal_data.user_agent,
        custom_data,
      });
    } else if (event_name === 'Boleto') {
      await new ConversionApi(pixel_id, token, pixel.user.email || null).boleto(
        {
          personal_data,
          fbp: _fbp,
          event_id,
          client_ip_address: personal_data.ip_address,
          client_user_agent: personal_data.user_agent,
          custom_data,
        },
      );
      const saleItem = await SalesItems.findOne({
        nest: true,
        raw: true,
        where: {
          uuid: custom_data.sale_id,
        },
        attributes: ['id_sale'],
      });
      await Sales.update(
        {
          fb_pixel_info: {
            pixel_id,
            token,
            personal_data,
            fbp: _fbp,
            event_id,
            client_ip_address: personal_data.ip_address,
            client_user_agent: personal_data.user_agent,
            custom_data,
          },
        },
        { where: { id: saleItem.id_sale } },
      );
    }

    return res.status(200).send('OK');
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

module.exports = {
  initiateCartController,
  findCardController,
  fbPixelController,
};
