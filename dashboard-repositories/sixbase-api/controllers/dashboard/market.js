const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const VerifyMarket = require('../../database/models/Verify_market');
const Market_images = require('../../database/models/Market_images');
const {
  findProductMarketVerifyStatusByKey,
} = require('../../status/productMarketVerifyStatus');
const {
  findProductMarketStatusByKey,
} = require('../../status/productMarketStatus');
const Cache = require('../../config/Cache');
const { slugify } = require('../../utils/formatters');
const { findBannerType } = require('../../types/bannerImages');
const { findImageTypeByKey } = require('../../types/imageTypes');

module.exports.getRecents = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 8,
      searchTerm = null,
      product = null,
      commission = null,
    },
  } = req;

  try {
    const whereProduct = {
      list_on_market: true,
      id_status_market: findProductMarketStatusByKey('active').id,
    };

    if (searchTerm)
      whereProduct.name = {
        [Op.like]: `%${searchTerm}%`,
      };

    if (product && product !== 'all') {
      whereProduct.id_type = product === 'physical' ? 4 : { [Op.or]: [1, 2] };
    }

    let orderCriteria = [['accepted_at', 'DESC']];

    if (commission === '1') {
      orderCriteria = [
        ['products', 'affiliate_settings', 'commission', 'DESC'],
      ];
    } else if (commission === '2') {
      orderCriteria = [['products', 'affiliate_settings', 'commission', 'ASC']];
    }

    const offset = page * size;
    const limit = Number(size);
    const data = await VerifyMarket.findAndCountAll({
      offset,
      limit,
      distinct: true,
      nest: true,
      subQuery: false,
      where: {
        id_status: findProductMarketVerifyStatusByKey('accepted').id,
      },
      attributes: ['accepted_at', 'id_product', 'manager_link'],
      order: orderCriteria,
      include: [
        {
          association: 'products',
          attributes: ['name', 'uuid', 'cover', 'id'],
          where: whereProduct,
          include: [
            {
              association: 'product_offer',
              attributes: ['price', 'shipping_type', 'shipping_price'],
              required: true,
              paranoid: true,
              separate: true,
              order: [['price', 'DESC']],
              where: {
                allow_affiliate: true,
                affiliate_visible: true,
                active: 1,
              },
              include: [{ association: 'plans', required: false }],
            },
            {
              association: 'affiliate_settings',
              attributes: ['commission'],
              required: false,
            },
            {
              association: 'affiliate_images',
              where: { id_type: findImageTypeByKey('market-cover').id },
              attributes: ['file'],
              required: false,
              separate: true,
            },
            {
              association: 'product_pages',
              attributes: ['id', 'uuid', 'label', 'url'],
              required: false,
            },
          ],
        },
      ],
      group: ['id_product'],
    });

    const response = data.rows
      .map((r) => r.toJSON())
      .filter(({ products }) => {
        const plans = products.product_offer.map(({ plans: x }) => x).flat();
        return (
          (plans.length > 0 || products.product_offer.length > 0) &&
          products.product_pages.length > 0
        );
      })
      .map(
        ({
          manager_link,
          accepted_at,
          products: {
            id,
            name,
            uuid,
            id_type,
            product_offer,
            affiliate_settings,
            affiliate_images,
            product_pages,
          },
        }) => {
          let maxPrice = 0;
          const plans = product_offer.map(({ plans: x }) => x).flat();
          if (plans.length > 0) {
            const [maxPlanPrice] = plans.sort((a, b) => b.price - a.price);
            maxPrice = maxPlanPrice.price;
          } else {
            const [maxOffer] = product_offer.sort((a, b) => b.price - a.price);
            maxPrice =
              maxOffer.price +
              (maxOffer.shipping_type === 1 ? maxOffer.shipping_price : 0);
          }

          return {
            manager_link,
            accepted_at,
            product: {
              id,
              uuid,
              name,
              cover: affiliate_images,
              slug: slugify(name),
              id_type,
            },
            maxPrice,
            maxCommission: Number(
              ((maxPrice * affiliate_settings.commission) / 100).toFixed(2),
            ),
            percentage: affiliate_settings.commission,
            hasSalesPage: product_pages.length > 0,
          };
        },
      );

    const lastPage = Math.ceil(data.count.length / size);

    return res.status(200).send({
      count: response.length,
      rows: response,
      lastPage,
      isPrevPage: Number(page) + 1 > 1 && response && response.length > 0,
      isNextPage:
        Number(page) + 2 <= lastPage && response && response.length > 0,
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

module.exports.getRecommended = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 8,
      searchTerm = null,
      product = null,
      commission = null,
    },
  } = req;

  try {
    const whereProduct = {
      list_on_market: true,
      id_status_market: findProductMarketStatusByKey('active').id,
      recommended_market: true,
    };

    if (searchTerm)
      whereProduct.name = {
        [Op.like]: `%${searchTerm}%`,
      };

    if (product && product !== 'all') {
      whereProduct.id_type = product === 'physical' ? 4 : { [Op.or]: [1, 2] };
    }

    let orderCriteria = [
      ['products', 'recommend_market_position', 'ASC'],
      ['id_product', 'ASC'],
    ];

    if (commission === '1') {
      orderCriteria = [
        ['products', 'affiliate_settings', 'commission', 'DESC'],
      ];
    } else if (commission === '2') {
      orderCriteria = [['products', 'affiliate_settings', 'commission', 'ASC']];
    }

    const offset = page * size;

    const limit = Number(size);
    const data = await VerifyMarket.findAndCountAll({
      offset,
      limit,
      distinct: true,
      nest: true,
      subQuery: false,
      where: {
        id_status: findProductMarketVerifyStatusByKey('accepted').id,
      },
      attributes: ['accepted_at', 'id_product', 'manager_link'],
      order: orderCriteria,
      include: [
        {
          association: 'products',
          attributes: [
            'name',
            'uuid',
            'cover',
            'recommend_market_position',
            'id',
          ],
          where: whereProduct,
          include: [
            {
              association: 'product_offer',
              attributes: ['price', 'shipping_type', 'shipping_price'],
              required: true,
              separate: true,
              paranoid: true,
              where: { allow_affiliate: true, affiliate_visible: true },
              include: [{ association: 'plans', required: false }],
            },
            {
              association: 'affiliate_settings',
              attributes: ['commission'],
              required: false,
            },
            {
              association: 'affiliate_images',
              where: { id_type: findImageTypeByKey('market-cover').id },
              attributes: ['file'],
              required: false,
              separate: true,
            },
            {
              association: 'product_pages',
              attributes: ['id', 'uuid', 'label', 'url'],
              required: false,
            },
          ],
        },
      ],
      group: ['id_product'],
    });

    const response = data.rows
      .map((r) => r.toJSON())
      .filter(({ products }) => {
        const plans = products.product_offer.map(({ plans: x }) => x).flat();
        return (
          (plans.length > 0 || products.product_offer.length > 0) &&
          products.product_pages.length > 0
        );
      })
      .map(
        ({
          accepted_at,
          manager_link,
          products: {
            id,
            name,
            uuid,
            product_offer,
            affiliate_settings,
            affiliate_images,
            product_pages,
          },
        }) => {
          let maxPrice = 0;

          const plans = product_offer.map(({ plans: x }) => x).flat();

          if (plans.length > 0) {
            const [maxPlanPrice] = plans.sort((a, b) => b.price - a.price);
            maxPrice = maxPlanPrice.price;
          } else {
            const [maxOffer] = product_offer.sort((a, b) => b.price - a.price);
            maxPrice =
              maxOffer.price +
              (maxOffer.shipping_type === 1 ? maxOffer.shipping_price : 0);
          }

          return {
            accepted_at,
            manager_link,
            product: {
              id,
              uuid,
              name,
              cover: affiliate_images,
              slug: slugify(name),
            },
            maxPrice,
            maxCommission: Number(
              ((maxPrice * affiliate_settings.commission) / 100).toFixed(2),
            ),
            hasSalesPage: product_pages.length > 0,
          };
        },
      );

    const lastPage = Math.ceil(data.count.length / size);

    return res.status(200).send({
      count: response.length,
      rows: response,
      lastPage,
      isPrevPage: Number(page) + 1 > 1 && response && response.length > 0,
      isNextPage:
        Number(page) + 2 <= lastPage && response && response.length > 0,
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

module.exports.getTop = async (req, res, next) => {
  try {
    const data = await Cache.get(`${process.env.ENVIRONMENT}_market_affiliate`);
    if (!data) return res.status(200).send({ rows: [] });
    return res.status(200).send(JSON.parse(data));
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

module.exports.getBanners = async (req, res, next) => {
  try {
    const marketImages = await Market_images.findAll({
      raw: true,
      where: {
        active: true,
      },
      attributes: ['url', 'file', 'key', 'uuid', 'id_type', 'order'],
      order: [['order', 'ASC']],
    });
    const serializedImages = marketImages.map(
      ({ url, file, key, uuid, id_type, order }) => ({
        url,
        file,
        key,
        uuid,
        order,
        type: findBannerType(id_type),
      }),
    );
    return res.status(200).send(serializedImages);
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
