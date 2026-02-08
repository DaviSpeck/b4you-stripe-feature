const { Op } = require('sequelize');
const ApiError = require('../error/ApiError');
const ApprovedProduct = require('../services/email/market/ApprovedProduct');
const ReprovedProduct = require('../services/email/market/RepovedProduct');
const Products = require('../database/models/Products');
const Market_images = require('../database/models/Market_images');
const Product_images = require('../database/models/Product_images');
const {
  findVerifyMarketPaginated,
  findMarketDetails,
  updateVerifyMarket,
} = require('../database/controllers/verify_market');
const {
  findProductMarketVerifyStatus,
  findProductMarketVerifyStatusByKey,
} = require('../status/productMarketVerifyStatus');
const {
  findProductMarketStatusByKey,
} = require('../status/productMarketStatus');
const {
  createLogBackoffice,
} = require('../database/controllers/logs_backoffice');
const { findRoleTypeByKey } = require('../types/userEvents');
const { updateProduct } = require('../database/controllers/products');
const dateHelper = require('../utils/helpers/date');
const models = require('../database/models/index');
const S3Manager = require('../services/S3Manager');
const { findBannerType } = require('../types/bannerImages');
const Verify_market = require('../database/models/Verify_market');
const { findImageTypeByKey } = require('../types/imageTypes');
const { rawAttributes } = require('../database/models/Users');
const {
  rawAttributes: backofficeUserAttributes,
} = require('../database/models/Users_backoffice');
const Users_backoffice = require('../database/models/Users_backoffice');

const userFields = Object.keys(rawAttributes).filter(
  (field) => field !== 'id_user',
);

const backofficeUserFields = Object.keys(backofficeUserAttributes).filter(
  (field) => field !== 'id_user',
);

module.exports.get = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 10,
      input = null,
      start_date = null,
      end_date = null,
    },
  } = req;
  try {
    let where = {
      id_status: {
        [Op.in]: [
          findProductMarketVerifyStatusByKey('pending').id,
        ],
      },
    };

    if (input) {
      where[Op.or] = [
        { '$products.name$': { [Op.like]: `%${input}%` } },
        { '$users.full_name$': { [Op.like]: `%${input}%` } },
      ];
    }

    if (start_date || end_date) {
      where.requested_at = {};

      if (start_date) {
        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
          throw ApiError.badRequest('Data inicial inválida');
        }
        where.requested_at[Op.gte] = startDate;
      }

      if (end_date) {
        const endDate = new Date(end_date);
        if (isNaN(endDate.getTime())) {
          throw ApiError.badRequest('Data final inválida');
        }
        endDate.setHours(23, 59, 59, 999);
        where.requested_at[Op.lte] = endDate;
      }
    }

    const { count, rows } = await findVerifyMarketPaginated(
      where,
      page,
      size,
    );

    // Adicionar headers para evitar cache
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });

    return res.send({
      count,
      rows,
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


module.exports.getAll = async (req, res, next) => {
  const {
    query: {
      page = 0,
      size = 10,
      input = null,
      start_date = null,
      end_date = null,
      status = null
    },
  } = req;
  try {
    let where = {};
    if (input) {
      where[Op.or] = [
        { '$products.name$': { [Op.like]: `%${input}%` } },
        { '$users.full_name$': { [Op.like]: `%${input}%` } },
      ];
    }

    if (status) {
      const statusId = parseInt(status);
      where.id_status = statusId;
    }

    if (start_date || end_date) {
      where.requested_at = {};

      if (start_date) {
        const startDate = new Date(start_date);
        if (isNaN(startDate.getTime())) {
          throw ApiError.badRequest('Data inicial inválida');
        }
        where.requested_at[Op.gte] = startDate;
      }

      if (end_date) {
        const endDate = new Date(end_date);
        if (isNaN(endDate.getTime())) {
          throw ApiError.badRequest('Data final inválida');
        }
        endDate.setHours(23, 59, 59, 999);
        where.requested_at[Op.lte] = endDate;
      }
    }
    const offset = page * size;
    const limit = Number(size);
    const verifys = await Verify_market.findAndCountAll({
      where,
      raw: true,
      nest: true,
      order: [['id', 'desc']],
      include: [
        {
          association: 'users',
          attributes: ['id', 'uuid', 'full_name', 'email'],
        },
        {
          association: 'products',
          paranoid: false,
        },
      ],
      offset,
      limit,
    });

    return res.send({
      count: verifys.count,
      rows: verifys.rows.map(
        ({
          id,
          products,
          users,
          id_status,
          requested_at,
          accepted_at,
          rejected_at,
        }) => ({
          id,
          products,
          users,
          status: findProductMarketVerifyStatus(id_status),
          requested_at,
          accepted_at,
          rejected_at,
        }),
      ),
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

module.exports.details = async (req, res, next) => {
  const {
    params: { id_product },
  } = req;
  try {
    const details = await findMarketDetails({
      id_product,
    });
    const images = await Product_images.findAll({
      where: { id_product, id_type: findImageTypeByKey('market-content').id },
      raw: true,
      attributes: ['file'],
    });

    const coverImages = await Product_images.findAll({
      where: { id_product, id_type: findImageTypeByKey('market-cover').id },
      raw: true,
      attributes: ['file'],
    });
    const data = details.map(({ id_status, ...rest }) => ({
      ...rest,
      status: findProductMarketVerifyStatus(id_status),
    }));
    return res.status(200).send({ data, images, cover: coverImages });
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

module.exports.approve = async (req, res, next) => {
  const {
    params: { id: id_market },
    user: { id },
    body: {
      reason = '',
      internal_descriptions = '',
      id_producer,
      product_name,
      id_product,
      manager_link = '',
    },
  } = req;
  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    await models.sequelize.transaction(async (t) => {
      await updateVerifyMarket(
        { id: id_market },
        {
          id_status: findProductMarketVerifyStatusByKey('accepted').id,
          reason,
          internal_descriptions,
          accepted_at: dateHelper().now(),
          manager_link,
        },
        t,
      );
      await updateProduct(
        { id: id_product },
        { id_status_market: findProductMarketStatusByKey('active').id },
        t,
      );
      await createLogBackoffice(
        {
          id_user_backoffice: id,
          id_event: findRoleTypeByKey('approve-product-market').id,
          params: {
            user_agent,
            product_name,
          },
          ip_address,
          id_user: id_producer,
        },
        t,
      );
    });
    const product = await Products.findByPk(id_product, {
      attributes: ['uuid'],
      include: [
        {
          association: 'producer',
          attributes: ['email', 'full_name'],
        },
      ],
    });
    if (product) {
      await new ApprovedProduct({
        email: product.producer.email,
        producer_name: product.producer.full_name,
        product_name,
        uuid_product: product.uuid,
        manager_link,
      }).send();
    }
    return res.sendStatus(200);
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

module.exports.reprove = async (req, res, next) => {
  const {
    params: { id: id_market },
    user: { id },
    body: {
      reason = '',
      internal_descriptions = '',
      id_producer,
      product_name,
      id_product,
    },
  } = req;
  try {
    const ip_address =
      req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const user_agent = req.get('User-Agent');
    await models.sequelize.transaction(async (t) => {
      await updateVerifyMarket(
        { id: id_market },
        {
          id_status: findProductMarketVerifyStatusByKey('refused').id,
          reason,
          internal_descriptions,
          rejected_at: dateHelper().now(),
        },
        t,
      );
      await updateProduct(
        { id: id_product },
        { id_status_market: findProductMarketStatusByKey('refused').id },
        t,
      );
      await createLogBackoffice(
        {
          id_user_backoffice: id,
          id_event: findRoleTypeByKey('reprove-product-market').id,
          params: {
            user_agent,
            product_name,
          },
          ip_address,
          id_user: id_producer,
        },
        t,
      );
    });
    const product = await Products.findByPk(id_product, {
      attributes: ['uuid'],
      include: [
        {
          association: 'producer',
          attributes: ['email', 'full_name'],
        },
      ],
    });
    if (product) {
      await new ReprovedProduct({
        email: product.producer.email,
        producer_name: product.producer.full_name,
        product_name,
        reason,
      }).send();
    }
    return res.sendStatus(200);
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

module.exports.getBanners = async (req, res, next) => {
  try {
    const marketImages = await Market_images.findAll({
      raw: true,
      order: [
        ['order', 'ASC'],
        ['created_at', 'ASC'],
      ],
    });

    return res.status(200).send(
      marketImages.map(({ url, file, key, uuid, id_type, order, created_at }) => ({
        uuid,
        url,
        key,
        file,
        order: order || 0,
        type: findBannerType(id_type),
        created_at
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

module.exports.getUrlLinkBanner = async (req, res, next) => {
  const {
    params: { filename },
  } = req;
  try {
    const { url, key } = await new S3Manager(
      process.env.BUCKET_NAME,
    ).getSignedUrl(filename);
    return res.status(200).send({ url, key });
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

module.exports.getRecommended = async (req, res, next) => {
  const {
    query: { page = 0, size = 100 },
  } = req;
  try {
    const offset = page * size;
    const limit = Number(size);

    const where = {
      recommended_market: true,
      list_on_market: true,
      id_status_market: findProductMarketStatusByKey('active').id,
    };
    const attributes = ['id', 'uuid', 'name', 'recommend_market_position'];
    const include = [
      {
        association: 'producer',
        attributes: ['uuid'],
      },
    ];
    const order = [
      ['recommend_market_position', 'ASC'],
      ['id', 'ASC'],
    ];
    const all = await Products.findAll({
      raw: true,
      where,
      attributes,
      include,
      order,
    });
    let needsNormalize = false;
    all.forEach((r, idx) => {
      if ((r.recommend_market_position || idx + 1) !== idx + 1)
        needsNormalize = true;
    });
    if (needsNormalize) {
      await models.sequelize.transaction(async (t) => {
        for (let i = 0; i < all.length; i++) {
          const r = all[i];
          const desired = i + 1;
          if (r.recommend_market_position !== desired) {
            await Products.update(
              { recommend_market_position: desired },
              { where: { id: r.id }, transaction: t },
            );
            all[i].recommend_market_position = desired;
          }
        }
      });
    }
    const { count, rows } = await Products.findAndCountAll({
      raw: true,
      nest: true,
      offset,
      limit,
      where,
      attributes,
      include,
      order,
    });
    const productIds = rows.map((r) => r.id);
    let coversByProductId = {};
    if (productIds.length > 0) {
      const coverTypeId = findImageTypeByKey('market-cover').id;
      const coverImages = await Product_images.findAll({
        where: { id_product: { [Op.in]: productIds }, id_type: coverTypeId },
        raw: true,
        attributes: ['id_product', 'file'],
        order: [['id', 'ASC']],
      });
      for (const img of coverImages) {
        if (!coversByProductId[img.id_product]) {
          coversByProductId[img.id_product] = [{ file: img.file }];
        }
      }
    }
    return res.status(200).send({
      count,
      rows: rows.map(
        ({ id, uuid, name, recommend_market_position, producer }) => ({
          product: {
            id,
            uuid,
            name,
            cover: coversByProductId[id] || [],
            producer: producer ? { uuid: producer.uuid } : null,
          },
          position: recommend_market_position,
        }),
      ),
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

module.exports.reorderRecommended = async (req, res, next) => {
  try {
    const { uuids } = req.body || {};
    if (!Array.isArray(uuids) || uuids.length === 0) {
      throw ApiError.badRequest('Array de uuids é obrigatório.');
    }
    const recommended = await Products.findAll({
      where: {
        recommended_market: true,
        list_on_market: true,
        id_status_market: findProductMarketStatusByKey('active').id,
      },
      raw: true,
      attributes: ['id', 'uuid'],
      order: [
        ['recommend_market_position', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    const uuidToId = new Map(recommended.map((p) => [p.uuid, p.id]));
    const filteredPayload = uuids.filter((u) => uuidToId.has(u));
    const payloadSet = new Set(filteredPayload);
    const remaining = recommended
      .map((p) => p.uuid)
      .filter((u) => !payloadSet.has(u));
    const finalOrder = [...filteredPayload, ...remaining];
    await models.sequelize.transaction(async (t) => {
      for (let i = 0; i < finalOrder.length; i++) {
        const uuid = finalOrder[i];
        const id = uuidToId.get(uuid);
        await Products.update(
          { recommend_market_position: i + 1 },
          { where: { id }, transaction: t },
        );
      }
    });
    req.query.page = 0;
    req.query.size = String(finalOrder.length);
    return module.exports.getRecommended(req, res, next);
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

module.exports.postBanner = async (req, res, next) => {
  const {
    user,
    body: { key, url, id_type = 1, order = 0 },
  } = req;
  try {
    const parsedType = Number(id_type) || 1;
    const parsedOrder = Number(order) || 0;

    let id_user = null;
    if (user && user.id) {
      const backofficeUser = await Users_backoffice.findByPk(user.id, {
        attributes: ['id'],
      });
      if (backofficeUser) {
        id_user = backofficeUser.id;
      }
    }

    await Market_images.create({
      id_user,
      file: `https://arquivos-mango5.s3.sa-east-1.amazonaws.com/${key}`,
      key,
      url,
      active: true,
      id_type: parsedType,
      order: parsedOrder,
    });
    return res.sendStatus(200);
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

module.exports.deleteBanner = async (req, res, next) => {
  const {
    params: { uuid },
  } = req;
  try {
    const marketImage = await Market_images.findOne({
      where: {
        uuid,
      },
    });
    if (!marketImage)
      throw ApiError.badRequest('Um uuid de imagem deve ser fornecido.');
    await new S3Manager(process.env.BUCKET_NAME).deleteByKey(marketImage.key);
    await Market_images.destroy({ where: { uuid: marketImage.uuid } });
    return res.sendStatus(200);
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

module.exports.updateBanner = async (req, res, next) => {
  const {
    params: { uuid },
    body: { active = false },
  } = req;
  try {
    const marketImage = await Market_images.findOne({
      where: {
        uuid,
      },
    });
    if (!marketImage)
      throw ApiError.badRequest('Um uuid de imagem deve ser fornecido.');
    await Market_images.update({ active }, { where: { id: marketImage.id } });
    return res.sendStatus(200);
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

module.exports.updateBannerOrder = async (req, res, next) => {
  const {
    body: { banners },
  } = req;
  try {
    if (!Array.isArray(banners)) {
      throw ApiError.badRequest('Banners deve ser um array.');
    }

    if (banners.length === 0) {
      return res.status(200).send({ message: 'Nenhum banner para atualizar.' });
    }

    await models.sequelize.transaction(async (t) => {
      for (const banner of banners) {
        const { uuid, order } = banner;

        if (!uuid || typeof order !== 'number') {
          throw ApiError.badRequest(
            'Cada banner deve ter uuid e order válidos.',
          );
        }

        const [affectedRows] = await Market_images.update(
          { order },
          {
            where: { uuid },
            transaction: t,
          },
        );
      }
    });

    return res.sendStatus(200);
  } catch (error) {
    console.error('Erro em updateBannerOrder:', error);
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
