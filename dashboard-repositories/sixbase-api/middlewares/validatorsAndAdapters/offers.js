const ApiError = require('../../error/ApiError');
const dateHelper = require('../../utils/helpers/date');
const {
  findOfferWithPlans,
} = require('../../database/controllers/product_offer');
const { validateBody, resolveKeys } = require('./common');
const { FRONTEND_DATE, DATABASE_DATE } = require('../../types/dateTypes');
const {
  findClassrooms,
  findOneClassroom,
} = require('../../database/controllers/classrooms');
const {
  VIDEOTYPE,
  SINGLE,
  SUBSCRIPTION,
  PHYSICAL_TYPE,
} = require('../../types/productTypes');
const Users = require('../../database/models/Users');

const validateCreateOffer = async (req, res, next) => {
  const {
    product,
    body: {
      start_offer,
      end_offer,
      classroom_id,
      price,
      discount_pix,
      discount_billet,
      discount_card,
      installments,
      payment_methods,
      student_pays_interest,
      sale_page_url,
      shipping_type,
      shipping_price,
      counter,
      affiliate_visible,
      free_sample,
      counter_three_steps,
    },
  } = req;
  const offer = req.body;
  if (product.payment_type === SINGLE && !price && !free_sample)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'O preço é obrigatório quando o tipo de pagamento é único',
      }),
    );
  if (product.id_type === VIDEOTYPE && classroom_id) {
    const classrooms = await findClassrooms({ id_product: product.id });
    const selectedClassroom = classrooms.find(
      ({ uuid }) => uuid === classroom_id,
    );
    if (!selectedClassroom)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Sala de aula não encontrada',
        }),
      );
    offer.id_classroom = selectedClassroom.id;
  }

  if (start_offer) {
    offer.start_offer = dateHelper(start_offer, FRONTEND_DATE).format(
      DATABASE_DATE,
    );
  }
  if (end_offer) {
    offer.end_offer = dateHelper(end_offer, FRONTEND_DATE).format(
      DATABASE_DATE,
    );
  }

  if (product.payment_type === SINGLE && !free_sample) {
    try {
      if (discount_pix) {
        const priceAfterDiscount = price * (1 - discount_pix / 100);
        if (priceAfterDiscount < process.env.MIN_PRICE)
          throw ApiError.badRequest(
            `O preço com desconto no pix não deve ser menor que nosso valor mínimo de R$ ${process.env.MIN_PRICE}`,
          );

        offer.discount_pix = discount_pix;
      }

      if (discount_billet) {
        const priceAfterDiscount = price * (1 - discount_billet / 100);
        if (priceAfterDiscount < process.env.MIN_PRICE)
          throw ApiError.badRequest(
            `O preço com desconto no boleto não deve ser menor que nosso valor mínimo de R$ ${process.env.MIN_PRICE}`,
          );

        offer.discount_billet = discount_billet;
      }

      if (discount_card) {
        const priceAfterDiscount = price * (1 - discount_card / 100);
        if (priceAfterDiscount < process.env.MIN_PRICE)
          throw ApiError.badRequest(
            `O preço com desconto no cartão não deve ser menor que nosso valor mínimo de R$ ${process.env.MIN_PRICE}`,
          );

        offer.discount_card = discount_card;
      }
    } catch (error) {
      return res.status(error.code).send(error);
    }
  }
  if (
    product.payment_type === SUBSCRIPTION &&
    payment_methods.includes('billet')
  )
    return next(
      ApiError.badRequest({
        code: 400,
        message: 'Boleto não é aceito em produtos assinatura',
      }),
    );
  offer.payment_methods = payment_methods;
  offer.installments = installments;
  offer.student_pays_interest = student_pays_interest;
  offer.id_product = product.id;
  offer.sale_page_url = sale_page_url;
  offer.affiliate_visible = affiliate_visible;
  if (product.id_type === PHYSICAL_TYPE) {
    offer.shipping_type = shipping_type;
    offer.shipping_price = shipping_price;
    if (shipping_type === 0) {
      offer.shipping_price = 0;
    }
  }
  if (Object.keys(counter).length > 0) {
    offer.counter = counter;
  }
  if (Object.keys(counter_three_steps).length > 0) {
    offer.counter_three_steps = counter_three_steps;
  }
  if (free_sample) {
    offer.price = 0;
  }
  req.offer = offer;
  return next();
};

const isThereAnOffer = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;

  const { offer_id } = req.params;
  const offer = await findOfferWithPlans({ id_product, uuid: offer_id });
  if (!offer)
    return next(
      ApiError.badRequest({ success: false, message: 'Oferta não encontrada' }),
    );
  req.offer = offer;
  return next();
};

const validateUpdateOffer = async (req, res, next) => {
  const {
    product,
    user: { id: id_user },
    body: {
      start_offer,
      end_offer,
      price,
      discount_billet,
      discount_card,
      discount_pix,
      payment_methods,
      sales_page_url,
      shipping_type,
      shipping_price,
      free_sample,
      dimensions,
      enable_two_cards_payment,
    },
  } = req;

  const keys = await validateBody(req.body, next);
  req.data = resolveKeys(req.body, keys);
  req.data.sales_page_url = sales_page_url;
  req.data.dimensions = dimensions;

  delete req.data.enable_two_cards_payment;

  if (enable_two_cards_payment !== undefined) {
    const userFromDb = await Users.findByPk(id_user, {
      attributes: ['features'],
      raw: true,
    });

    const userFeatures = userFromDb?.features || [];
    const hasTwoCardsFeature =
      Array.isArray(userFeatures) && userFeatures.includes('two_cards');

    if (hasTwoCardsFeature && product.payment_type !== SUBSCRIPTION) {
      req.data.enable_two_cards_payment = enable_two_cards_payment;
    }
  }
  if (start_offer) {
    req.data.start_offer = dateHelper(start_offer, FRONTEND_DATE).format(
      DATABASE_DATE,
    );
  }
  if (end_offer) {
    req.data.end_offer = dateHelper(end_offer, FRONTEND_DATE).format(
      DATABASE_DATE,
    );
  }

  if (
    product.payment_type === SUBSCRIPTION &&
    payment_methods.includes('billet')
  )
    return next(
      ApiError.badRequest({
        code: 400,
        message: 'Boleto não é aceito em produtos assinatura',
      }),
    );
  req.data.shipping_type = shipping_type;
  req.data.shipping_price = shipping_price;

  if (product.id_type === PHYSICAL_TYPE && shipping_type === 0) {
    req.data.shipping_type = 0;
    req.data.shipping_price = 0;
  }

  if (product.payment_type === SINGLE && !free_sample) {
    try {
      if (discount_pix) {
        const priceAfterDiscount = price * (1 - discount_pix / 100);
        if (priceAfterDiscount < process.env.MIN_PRICE)
          throw ApiError.badRequest(
            `O preço com desconto no pix não deve ser menor que nosso valor mínimo de R$ ${process.env.MIN_PRICE}`,
          );

        req.data.discount_pix = discount_pix;
      }

      if (discount_billet) {
        const priceAfterDiscount = price * (1 - discount_billet / 100);
        if (priceAfterDiscount < process.env.MIN_PRICE)
          throw ApiError.badRequest(
            `O preço com desconto no boleto não deve ser menor que nosso valor mínimo de R$ ${process.env.MIN_PRICE}`,
          );

        req.data.discount_billet = discount_billet;
      }

      if (discount_card) {
        const priceAfterDiscount = price * (1 - discount_card / 100);
        if (priceAfterDiscount < process.env.MIN_PRICE)
          throw ApiError.badRequest(
            `O preço com desconto no cartão não deve ser menor que nosso valor mínimo de R$ ${process.env.MIN_PRICE}`,
          );

        req.data.discount_card = discount_card;
      }
    } catch (error) {
      return res.status(error.code).send(error);
    }
  }
  if (free_sample) {
    req.data.price = 0;
  }

  return next();
};

const validateClassroom = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  const { classroom_id } = req.body;

  if (classroom_id) {
    const selectedClassroom = await findOneClassroom({
      uuid: classroom_id,
      id_product,
    });
    if (!selectedClassroom)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Sala de aula não encontrada',
        }),
      );
    req.data.id_classroom = selectedClassroom.id;
  }

  return next();
};

const allowAffiliateDataToUpdate = async (req, res, next) => {
  const { allow } = req.params;
  req.data = { allow_affiliate: allow };
  return next();
};

module.exports = {
  validateCreateOffer,
  isThereAnOffer,
  validateUpdateOffer,
  validateClassroom,
  allowAffiliateDataToUpdate,
};
