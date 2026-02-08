const express = require('express');
const { Op } = require('sequelize');
const {
  findSingleProductMarketAdapter,
} = require('../../middlewares/validatorsAndAdapters/products');
const {
  findProductAffiliateSettingsAdapter,
  productAfilliate,
} = require('../../middlewares/validatorsAndAdapters/affiliate_settings');
const {
  createProductAffiliateController,
  getAffiliateMarketController,
  getProductAffiliateMarketController,
  getAffiliateMarketGlobalProductsController,
} = require('../../controllers/dashboard/affiliates');
const {
  findOneVerifyMarket,
} = require('../../database/controllers/verify_market');
const MarketController = require('../../controllers/dashboard/market');
const Products = require('../../database/models/Products');
const Coupons = require('../../database/models/Coupons');
const ApiError = require('../../error/ApiError');
const Affiliates = require('../../database/models/Affiliates');
const validateDto = require('../../middlewares/validate-dto');
const couponsScheme = require('../../dto/coupons/createAffiliate');

const router = express.Router();

router.get('/', getAffiliateMarketController);

router.get('/recents', MarketController.getRecents);

router.get('/recommended', MarketController.getRecommended);

router.get('/top', MarketController.getTop);

router.get('/banners', MarketController.getBanners);

router.get('/verify_market/:product_id', async (req, res) => {
  const { product_id } = req.params;
  const where = { id_product: product_id };

  try {
    const result = await findOneVerifyMarket({ where });
    if (!result) {
      return res.status(404).json({ message: 'Registro não encontrado' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  return 'ok';
});

router.get(
  '/:product_id',
  findSingleProductMarketAdapter,
  findProductAffiliateSettingsAdapter,
  getProductAffiliateMarketController,
);

router.get('/coupons/:product_id', async (req, res, next) => {
  const {
    user: { id: id_user },
    params: { product_id },
  } = req;
  try {
    const product = await Products.findOne({
      raw: true,
      where: { uuid: product_id },
      attributes: ['id'],
    });
    if (!product) {
      throw ApiError.badRequest('Produto não encontrado');
    }
    const coupons_rules = await Coupons.findAll({
      raw: true,
      where: {
        id_product: product.id,
        enable_for_affiliates: true,
      },
    });
    if (coupons_rules.length === 0) {
      return res.status(200).send({
        allow_coupons: false,
        coupons: [],
        coupons_rules: [],
      });
    }
    const affiliate = await Affiliates.findOne({
      raw: true,
      attributes: ['id'],
      where: {
        id_product: product.id,
        id_user,
        status: 2,
      },
    });
    if (!affiliate) {
      return res.status(200).send({
        coupons: [],
        coupons_rules: [],
        allow_coupons: false,
      });
    }
    const coupons = await Coupons.findAll({
      raw: true,
      where: {
        [Op.and]: {
          id_product: product.id,
          id_user_created: id_user,
          id_affiliate: affiliate.id,
        },
      },
    });
    return res.status(200).send({
      coupons,
      coupons_rules,
      allow_coupons: true,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
    }
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
});

router.post(
  '/coupon/:product_id',
  validateDto(couponsScheme),
  async (req, res, next) => {
    const {
      user: { id: id_user },
      body: { coupon, id_rule },
      params: { product_id },
    } = req;
    try {
      const product = await Products.findOne({
        raw: true,
        where: { uuid: product_id },
        attributes: ['id'],
      });
      if (!product) {
        throw ApiError.badRequest('Produto não existente');
      }
      const alreadyExistsCoupon = await Coupons.findOne({
        raw: true,
        where: { id_product: product.id, coupon },
        attributes: ['id'],
      });
      if (alreadyExistsCoupon) {
        return res.status(400).send({ message: 'Cupom já existente' });
      }
      const rule = await Coupons.findOne({
        raw: true,
        where: {
          id: id_rule,
          id_product: product.id,
        },
        attributes: {
          exclude: ['id'],
        },
      });
      if (!rule) {
        throw ApiError.badRequest('Erro ao buscar regra');
      }
      let offersIds = [];
      if (rule.restrict_offers) {
        const ruleWithOffers = await Coupons.findOne({
          where: {
            id: id_rule,
          },
          include: [
            {
              association: 'offers',
              attributes: ['id'],
              through: {
                attributes: [],
              },
            },
          ],
        });

        if (ruleWithOffers?.offers?.length) {
          offersIds = [
            ...new Set(ruleWithOffers.offers.map((offer) => offer.id)),
          ];
        }
      }

      const affiliate = await Affiliates.findOne({
        raw: true,
        where: {
          id_user,
          id_product: product.id,
          status: 2,
        },
      });
      if (!affiliate) {
        throw ApiError.badRequest('Afiliado não encontrado');
      }
      const transaction = await Coupons.sequelize.transaction();
      try {
        const affiliateCoupon = await Coupons.create(
          {
            ...rule,
            coupon,
            id_user_created: id_user,
            id_affiliate: affiliate.id,
            enable_for_affiliates: 0,
          },
          { transaction },
        );

        if (offersIds.length) {
          await affiliateCoupon.setOffers(offersIds, { transaction });
        }

        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
      return res.sendStatus(200);
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).send(error);
      }
      return next(
        ApiError.internalServerError(
          `Internal Server Error, ${Object.keys(
            req.route.methods,
          )[0].toUpperCase()}: ${req.originalUrl}`,
        ),
      );
    }
  },
);

router.get('/:id_product/global', getAffiliateMarketGlobalProductsController);

router.post(
  '/affiliate/:product_id/',
  findSingleProductMarketAdapter,
  findProductAffiliateSettingsAdapter,
  productAfilliate,
  createProductAffiliateController,
);

module.exports = router;
