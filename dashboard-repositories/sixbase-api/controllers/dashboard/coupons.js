const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const ApiError = require('../../error/ApiError');
const {
  findCouponsPaginated,
  createCoupon,
  findCouponsRaking,
  exportCouponsRanking,
} = require('../../database/controllers/coupons');
const Affiliates = require('../../database/models/Affiliates');
const Coupons = require('../../database/models/Coupons');
const ProductOffer = require('../../database/models/Product_offer');
const Cache = require('../../config/Cache');
const { formatFullName } = require('../../utils/formatters');
const logger = require('../../utils/logger');

const affiliateInclude = {
  association: 'affiliate',
  attributes: ['id'],
  include: [
    {
      association: 'user',
      attributes: ['email', 'full_name'],
    },
  ],
};

const offersInclude = {
  association: 'offers',
  attributes: ['id', 'name'],
  through: {
    attributes: [],
  },
};

const sanitizeOffersIds = (offersIds) => {
  if (!Array.isArray(offersIds)) return [];

  return [
    ...new Set(
      offersIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ];
};

module.exports.getProductCoupons = async (req, res, next) => {
  const {
    query: { page = 0, size = 10, coupon: couponName },
    product: { id: id_product },
  } = req;

  try {
    const where = { id_product };

    if (couponName) {
      where.coupon = { [Op.like]: `%${couponName}%` };
    }

    const coupons = await findCouponsPaginated(where, page, size);

    return res.status(200).send(coupons);
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

module.exports.getProductOffers = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;

  try {
    const offers = await ProductOffer.findAll({
      attributes: ['id', 'name', 'price', 'active'],
      where: { id_product },
      order: [['name', 'ASC']],
    });

    return res.status(200).send(offers);
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

module.exports.createProductCoupons = async (req, res, next) => {
  const {
    product: { id: id_product },
    body,
  } = req;
  try {
    const {
      offers_ids,
      restrict_offers: restrict_offers_input,
      ...couponPayload
    } = body;

    if (couponPayload.discount_type === 'fixo') {
      couponPayload.amount = couponPayload.percentage;
      couponPayload.percentage = 0;
    }

    const restrict_offers = Boolean(restrict_offers_input);
    const offersIds = sanitizeOffersIds(offers_ids);

    if (!restrict_offers && offersIds.length > 0) {
      throw ApiError.badRequest(
        'Para aplicar o cupom em todas as ofertas, não selecione ofertas específicas',
      );
    }

    if (restrict_offers && offersIds.length === 0) {
      throw ApiError.badRequest(
        'Selecione ao menos uma oferta para restringir o cupom',
      );
    }

    const hasCoupon = await Coupons.findOne({
      raw: true,
      attributes: ['id'],
      where: {
        id_product,
        coupon: couponPayload.coupon,
      },
    });

    if (hasCoupon) {
      throw ApiError.badRequest(`Cupom ${couponPayload.coupon} já existente`);
    }

    if (couponPayload.expires_at) {
      const now = new Date();
      const expiresAt = new Date(couponPayload.expires_at);

      if (expiresAt < now) {
        throw ApiError.badRequest('A data de expiração deve ser futura');
      }
    }

    if (couponPayload.id_affiliate) {
      const affiliate = await Affiliates.findOne({
        raw: true,
        attributes: ['id'],
        where: {
          id_product,
          status: 2,
        },
      });
      if (!affiliate) {
        couponPayload.id_affiliate = null;
      }
    }

    const transaction = await Coupons.sequelize.transaction();

    try {
      let offers = [];

      if (restrict_offers) {
        offers = await ProductOffer.findAll({
          where: {
            id: offersIds,
            id_product,
          },
          attributes: ['id'],
          transaction,
        });

        if (offers.length !== offersIds.length) {
          throw ApiError.badRequest(
            'Algumas ofertas selecionadas são inválidas para este produto',
          );
        }
      }

      const coupon = await createCoupon(
        {
          ...couponPayload,
          id_product,
          restrict_offers,
        },
        { transaction },
      );

      if (restrict_offers) {
        await coupon.setOffers(offers, { transaction });
      }

      await transaction.commit();

      await coupon.reload({
        include: [affiliateInclude, offersInclude],
      });

      return res.status(200).send(coupon);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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

module.exports.deleteProductCoupons = async (req, res, next) => {
  const {
    params: { uuid_coupon },
    product: { id: id_product },
    user,
  } = req;
  try {
    const coupon = await Coupons.findOne({
      where: { uuid: uuid_coupon, id_product },
    });
    if (!coupon) {
      throw ApiError.badRequest('Cupom não encontrado');
    }
    await coupon.destroy();
    const key = `coupon_${coupon.coupon}_${id_product}`;
    const cachedCoupon = await Cache.get(key);
    if (cachedCoupon) {
      await Cache.del(key);
    }
    logger.info('[coupons] delete single', {
      product: id_product,
      coupon: coupon.coupon,
      user: user?.id ?? null,
      mode: 'single',
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

module.exports.deleteManyProductCoupons = async (req, res, next) => {
  const {
    product: { id: id_product, id_user: id_product_owner },
    body: { uuids },
    user,
  } = req;

  try {
    if (!user?.id || user.id !== id_product_owner) {
      throw ApiError.forbidden();
    }

    const where = { id_product };
    const isSelecting = Array.isArray(uuids) && uuids.length > 0;
    if (isSelecting) {
      where.uuid = uuids;
    }

    const coupons = await Coupons.findAll({
      attributes: ['id', 'coupon'],
      where,
    });

    if (!coupons.length) {
      return res.status(200).send({ count: 0 });
    }

    const transaction = await Coupons.sequelize.transaction();

    try {
      await Coupons.destroy({
        where: { id: coupons.map((c) => c.id) },
        transaction,
      });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    for (const coupon of coupons) {
      const key = `coupon_${coupon.coupon}_${id_product}`;
      try {
        // eslint-disable-next-line
        const cachedCoupon = await Cache.get(key);
        if (cachedCoupon) {
          // eslint-disable-next-line
          await Cache.del(key);
        }
      } catch (err) {
        logger.error('[coupons] bulk cache clear error', {
          product: id_product,
          coupon: coupon.coupon,
          error: err.message,
        });
      }
    }

    logger.info('[coupons] bulk delete', {
      product: id_product,
      mode: isSelecting ? 'selected' : 'all',
      count: coupons.length,
      user: user?.id ?? null,
    });

    return res.status(200).send({ count: coupons.length });
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

module.exports.updateProductCoupons = async (req, res, next) => {
  const {
    params: { uuid_coupon },
    product: { id: id_product },
    body,
  } = req;
  const transaction = await Coupons.sequelize.transaction();
  try {
    const couponInstance = await Coupons.findOne({
      where: { uuid: uuid_coupon, id_product },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!couponInstance) {
      throw ApiError.badRequest('Cupom não encontrado');
    }

    if (body.expires_at) {
      const now = new Date();
      const expiresAt = new Date(body.expires_at);

      if (expiresAt < now) {
        throw ApiError.badRequest('A data de expiração deve ser futura');
      }
    }

    const {
      offers_ids,
      restrict_offers: restrict_offers_input,
      ...updatePayload
    } = body;

    if (updatePayload.discount_type === 'fixo') {
      updatePayload.amount = updatePayload.percentage;
      updatePayload.percentage = 0;
    } else {
      updatePayload.amount = 0;
    }

    if (updatePayload.id_affiliate) {
      const affiliate = await Affiliates.findOne({
        raw: true,
        attributes: ['id'],
        where: {
          id_product,
          status: 2,
        },
      });
      if (!affiliate) {
        updatePayload.id_affiliate = null;
      }
    }

    const offersIds = sanitizeOffersIds(offers_ids);
    const restrictProvided = typeof restrict_offers_input === 'boolean';
    const isEnablingRestriction =
      restrictProvided && restrict_offers_input === true;
    const isDisablingRestriction =
      restrictProvided && restrict_offers_input === false;
    const isUpdatingOffersList = offersIds.length > 0;

    if (isDisablingRestriction && isUpdatingOffersList) {
      throw ApiError.badRequest(
        'Não é possível selecionar ofertas ao desabilitar a restrição do cupom',
      );
    }

    if (
      isEnablingRestriction &&
      !isUpdatingOffersList &&
      !couponInstance.restrict_offers
    ) {
      throw ApiError.badRequest(
        'Selecione ao menos uma oferta para restringir o cupom',
      );
    }

    if (
      !restrictProvided &&
      isUpdatingOffersList &&
      !couponInstance.restrict_offers
    ) {
      throw ApiError.badRequest(
        'Ative a restrição de ofertas para vincular o cupom a ofertas específicas',
      );
    }

    let offers = null;
    if (isUpdatingOffersList) {
      offers = await ProductOffer.findAll({
        where: {
          id: offersIds,
          id_product,
        },
        attributes: ['id'],
        transaction,
      });

      if (offers.length !== offersIds.length) {
        throw ApiError.badRequest(
          'Algumas ofertas selecionadas são inválidas para este produto',
        );
      }
    }

    if (restrictProvided) {
      updatePayload.restrict_offers = restrict_offers_input;
    }

    const previousCouponCode = couponInstance.coupon;

    await couponInstance.update(updatePayload, { transaction });

    if (isDisablingRestriction) {
      await couponInstance.setOffers([], { transaction });
    } else if (isUpdatingOffersList) {
      await couponInstance.setOffers(offers, { transaction });
    }

    await transaction.commit();

    const key = `coupon_${previousCouponCode}_${id_product}`;
    const cachedCoupon = await Cache.get(key);
    if (cachedCoupon) {
      await Cache.del(key);
    }

    const updatedKey = `coupon_${couponInstance.coupon}_${id_product}`;
    if (updatedKey !== key) {
      const cachedUpdatedCoupon = await Cache.get(updatedKey);
      if (cachedUpdatedCoupon) {
        await Cache.del(updatedKey);
      }
    }
    return res.sendStatus(200);
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
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

module.exports.getAffiliate = async (req, res, next) => {
  const {
    product: { id: id_product },
    query: { email },
  } = req;

  try {
    if (!email) {
      throw ApiError.badRequest('Email inválido');
    }
    const affiliate = await Affiliates.findOne({
      attributes: ['id', 'id_user'],
      nest: true,
      where: {
        id_product,
        status: 2,
        '$user.email$': email,
      },
      include: [
        {
          association: 'user',
          attributes: ['full_name'],
        },
      ],
    });
    if (!affiliate) {
      throw ApiError.badRequest('Afiliado não encontrado');
    }
    return res.status(200).send({
      id: affiliate.id,
      full_name: affiliate.user.full_name,
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

module.exports.getRanking = async (req, res, next) => {
  const { query, user } = req;

  try {
    const coupons = await findCouponsRaking({
      page: Math.max(0, query.page - 1),
      size: query.size,
      start: query.start,
      end: query.end,
      role: query.role,
      id_product: query.product,
      id_user: user.id,
    });

    return res.status(200).send(coupons);
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

module.exports.getRankingExport = async (req, res, next) => {
  const { query, user } = req;

  try {
    const coupons = await exportCouponsRanking({
      start: query.start,
      end: query.end,
      role: query.role,
      id_product: query.product,
      id_user: user.id,
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=desempenho-cupons.xlsx`,
    );

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      useStyles: true,
      useSharedStrings: true,
      filename: `desempenho-cupons.xlsx`,
      stream: res,
    });

    const worksheet = workbook.addWorksheet();

    worksheet.columns = [
      {
        header: 'Posição',
        key: 'position',
        width: 10,
      },
      {
        header: 'Nome',
        key: 'coupon',
        width: 30,
      },
      {
        header: 'Faturamento',
        key: 'total_sales',
        width: 30,
      },
      {
        header: 'Nº de usos',
        key: 'total_sold',
        width: 16,
      },
      {
        header: 'Desconto concedido',
        key: 'total_discount',
        width: 30,
      },
      {
        header: 'Último uso',
        key: 'used_at',
        width: 30,
      },
      {
        header: 'Creator',
        key: 'affiliate_name',
        width: 30,
      },
    ];

    for (const {
      position,
      coupon,
      total_sales,
      total_sold,
      total_discount,
      used_at,
      affiliate_name,
    } of coupons) {
      worksheet
        .addRow({
          position,
          coupon,
          total_sales: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(total_sales),
          total_sold,
          total_discount: new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(total_discount),
          used_at: used_at
            ? new Date(used_at).toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
              })
            : '-',
          affiliate_name: formatFullName(affiliate_name),
        })
        .commit();
    }

    worksheet.commit();
    await workbook.commit();

    return true;
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
