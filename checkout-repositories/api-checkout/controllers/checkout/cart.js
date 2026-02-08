const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const { formatName, formatWhatsapp } = require('../../utils/formatters');
const { findOnePixel } = require('../../database/controllers/pixels');
const ConversionApi = require('../../services/ConversionApi');
const {
  findSaleItemWithStudent,
} = require('../../database/controllers/sales_items');
const { findOneOffer } = require('../../database/controllers/product_offer');
const { createCart, deleteCart } = require('../../database/controllers/cart');

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
    },
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
        [Op.or]: {
          id_offer: offer.id,
          id_product: offer.id_product,
        },
      },
      true,
    );

    const newCart = await createCart({
      full_name: formatName(full_name),
      whatsapp: formatWhatsapp(whatsapp),
      document_number,
      email,
      id_offer: offer.id,
      id_product: offer.id_product,
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

const fbPixelController = async (req, res, next) => {
  let { personal_data } = req.session;
  const { _fbp } = req.cookies;
  const { custom_data, event_id, event_name, pixel_uuid, test_event_code } =
    req.body;

  if (!personal_data) {
    personal_data = {
      ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.get('User-Agent'),
    };
    if (event_name === 'Purchase') {
      const saleItem = await findSaleItemWithStudent({
        uuid: custom_data.order_id,
      });
      if (saleItem) {
        const { student } = saleItem;
        personal_data.email = student.email;
        personal_data.full_name = student.full_name;
        personal_data.whatsapp = student.whatsapp;
      }
    }
  }

  try {
    const pixel = await findOnePixel({ uuid: pixel_uuid });
    if (!pixel) throw ApiError.badRequest('Pixel não encontrado');
    const {
      settings: { pixel_id, api_token },
    } = pixel;

    await new ConversionApi(pixel_id, api_token).send({
      event_name,
      email: personal_data?.email?.toLowerCase(),
      phone: personal_data?.whatsapp,
      first_name: personal_data?.full_name?.split(' ')[0],
      last_name: personal_data?.full_name?.split(' ')[1],
      client_ip_address: personal_data?.ip_address,
      client_user_agent: personal_data?.user_agent,
      event_id,
      fbp: _fbp,
      custom_data,
      test_event_code,
    });

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
  fbPixelController,
};
