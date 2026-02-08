const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const SerializeOffer = require('../../presentation/checkout/offers');
const FindOffer = require('../../useCases/checkout/offers/FindOffer');
const SerializeOfferInfo = require('../../presentation/checkout/offerInfo');
const {
  findSaleItemWithStudent,
} = require('../../database/controllers/sales_items');
const FindAffiliate = require('../../useCases/checkout/affiliates/FindAffiliate');
const { findAllPixel } = require('../../database/controllers/pixels');
const { findOneCoupon } = require('../../database/controllers/coupons');
const { findRoleTypeByKey } = require('../../types/roles');
const SalesSettingsRepository = require('../../repositories/sequelize/SalesSettingsRepository');
const dateHelper = require('../../utils/helpers/date');
const {
  validateCouponOffers,
} = require('../../useCases/checkout/sales/validateCouponOffers');

const findOfferController = async (req, res, next) => {
  const {
    params: { offer_id },
    session: { personal_data },
    cookies: { sixid },
  } = req;
  try {
    const offer = await new FindOffer(offer_id).execute();

    const hasActiveCoupon = await findOneCoupon(
      {
        active: true,
        id_product: offer.id_product,
        [Op.or]: [{ restrict_offers: false }, { '$offers.id$': offer.id }],
      },
      {
        include: [
          {
            association: 'offers',
            attributes: ['id'],
            through: { attributes: [] },
            required: false,
          },
        ],
      },
    );

    const settings = await SalesSettingsRepository.find(
      offer.offer_product.producer.id,
    );

    let eventId = null;
    if (req.session.pixels) {
      eventId = req.session.pixels.eventId;
    } else {
      eventId = req.session.id;
      req.session.pixels = {
        eventId,
      };
    }

    const affiliate = await new FindAffiliate({
      sixid,
      id_offer: offer.id,
      affiliate_settings: offer.offer_product.affiliate_settings,
    }).execute();

    if (affiliate) {
      const pixels = await findAllPixel({
        id_user: affiliate.id_user,
        id_role: findRoleTypeByKey('affiliate').id,
      });
      offer.offer_product.pixels = [...offer.offer_product.pixels, ...pixels];
    }

    return res.status(200).send({
      ...new SerializeOffer({
        ...offer,
        sessionPixelsEventId: eventId,
        settings,
        hasActiveCoupon,
      }).adapt(),
      personal_data,
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

const getOfferInfoController = async (req, res, next) => {
  const {
    query: { offer_id, sale_item_id, plan_id = null },
  } = req;
  try {
    if (!offer_id) throw ApiError.badRequest('offer_id é obrigatório');
    if (!sale_item_id) throw ApiError.badRequest('sale_item_id é obrigatório');
    const offer = await new FindOffer(offer_id).execute();
    if (!offer) throw ApiError.badRequest('Oferta não encontrada');
    const saleItem = await findSaleItemWithStudent({ uuid: sale_item_id });
    if (!saleItem) throw ApiError.badRequest('Venda não encontrada');
    const settings = await SalesSettingsRepository.find(
      offer.offer_product.id_user,
    );
    return res.status(200).send(
      new SerializeOfferInfo({
        ...offer,
        settings,
        saleItem,
        plan_id,
      }).adapt(),
    );
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

const validateCouponController = async (req, res, next) => {
  const {
    params: { offer_id, coupon },
  } = req;
  try {
    const offer = await new FindOffer(offer_id).execute();
    const couponData = await findOneCoupon(
      {
        coupon,
        active: true,
        id_product: offer.id_product,
        expires_at: { [Op.gte]: dateHelper().now() },
        [Op.or]: [{ restrict_offers: false }, { '$offers.id$': offer.id }],
      },
      {
        include: [
          {
            association: 'offers',
            attributes: ['id'],
            through: { attributes: [] },
            required: false,
          },
        ],
      },
    );
    if (!couponData) return res.status(200).send(false);

    const { isAllowed } = validateCouponOffers(couponData, [
      { id_offer: offer.id },
    ]);

    if (!isAllowed) {
      return res.status(200).send(false);
    }

    return res.status(200).send(couponData);
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
  findOfferController,
  getOfferInfoController,
  validateCouponController,
};
