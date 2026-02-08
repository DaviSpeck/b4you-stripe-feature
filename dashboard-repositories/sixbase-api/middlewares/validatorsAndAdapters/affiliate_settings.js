const ApiError = require('../../error/ApiError');
const {
  findOneProductAffiliateSettings,
} = require('../../database/controllers/product_affiliate_settings');
const { findOneAffiliate } = require('../../database/controllers/affiliates');
const {
  findAffiliateStatus,
  findAffiliateStatusByKey,
} = require('../../status/affiliateStatus');
const { findCoproductionStatus } = require('../../status/coproductionsStatus');
const { capitalizeName } = require('../../utils/formatters');
const Affiliates = require('../../database/models/Affiliates');

const Suppliers = require('../../database/models/Suppliers');

const findProductAffiliateSettingsAdapter = async (req, _res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const settings = await findOneProductAffiliateSettings({
      id_product,
    });
    if (!settings) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Product settings not found',
        }),
      );
    }
    req.product.affiliateSettings = settings;
    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const productAfilliate = async (req, _res, next) => {
  const {
    user: { id: id_user },
    product: {
      id: id_product,
      producer: { id: id_producer },
      coproductions,
    },
  } = req;
  try {
    if (id_producer === id_user) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Um produtor não pode se afiliar ao seu próprio produto ',
        }),
      );
    }
    const activeOrPendingCoproductions = coproductions.filter(
      (c) =>
        c.status === findCoproductionStatus('Pendente').id ||
        c.status === findCoproductionStatus('Ativo').id,
    );

    const coproducer = activeOrPendingCoproductions.find(
      (c) => c.id_user === id_user,
    );
    if (coproducer) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Um coprodutor não pode se afiliar ao seu próprio produto ',
        }),
      );
    }
    const affiliate = await Affiliates.findOne({
      raw: true,
      attributes: ['id'],
      paranoid: true,
      where: {
        id_user,
        id_product,
        status: [
          findAffiliateStatusByKey('pending').id,
          findAffiliateStatusByKey('active').id,
          findAffiliateStatusByKey('blocked').id,
        ],
      },
    });
    if (affiliate) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Este usuário já possui afiliação com este produto',
        }),
      );
    }
    const isSupplier = await Suppliers.findOne({
      raw: true,
      attributes: ['id'],
      where: { id_user, id_product, id_status: [1, 2] },
    });
    if (isSupplier) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Usuário é fornecedor neste produto',
        }),
      );
    }

    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const affiliateActiveInvite = async (req, res, next) => {
  const {
    params: { id_affiliate: uuid },
    user: { id: id_user },
  } = req;
  try {
    const affiliate = await findOneAffiliate({
      uuid,
    });
    if (!affiliate) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Afiliado não encontrado',
        }),
      );
    }
    if (affiliate.product.id_user !== id_user) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Você não possui permissão para fazer esta ação',
        }),
      );
    }
    if (affiliate.status === findAffiliateStatus('Ativo').id) {
      return res
        .status(200)
        .send({ message: 'Esta afiliação já está ativa para este produto' });
    }
    req.affiliate = affiliate;
    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const affiliateBlockInvite = async (req, res, next) => {
  const {
    params: { id_affiliate: uuid },
    user: { id: id_user },
  } = req;
  try {
    const affiliate = await findOneAffiliate({
      uuid,
    });
    if (!affiliate) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Afiliado não encontrado',
        }),
      );
    }
    if (affiliate.product.id_user !== id_user) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Você não possui permissão para fazer esta ação',
        }),
      );
    }
    if (affiliate.status === findAffiliateStatus('Bloqueado').id) {
      return res.status(200).send({
        message: 'Esta afiliação já está bloqueada para este produto',
      });
    }
    req.affiliate = affiliate;
    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const affiliateRejectInvite = async (req, res, next) => {
  const {
    params: { id_affiliate: uuid },
    user: { id: id_user },
  } = req;
  try {
    const affiliate = await findOneAffiliate({
      uuid,
    });
    if (!affiliate) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Afiliado não encontrado',
        }),
      );
    }
    if (affiliate.product.id_user !== id_user) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Você não possui permissão para fazer esta ação',
        }),
      );
    }
    if (affiliate.status === findAffiliateStatus('Recusado').id) {
      return res
        .status(200)
        .send({ message: 'Esta afiliação já foi rejeitada para este produto' });
    }
    req.affiliate = affiliate;
    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const affiliateAllowAccess = async (req, _res, next) => {
  const {
    params: { id_affiliate: uuid },
    user: { id: id_user },
  } = req;
  try {
    const affiliate = await findOneAffiliate({
      uuid,
    });
    if (!affiliate) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Afiliado não encontrado',
        }),
      );
    }
    if (affiliate.product.id_user !== id_user) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Você não possui permissão para fazer esta ação',
        }),
      );
    }
    req.affiliate = affiliate;
    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const affiliateSetCommission = async (req, _res, next) => {
  const {
    params: { id_affiliate: uuid },
    user: { id: id_user },
  } = req;
  try {
    const affiliate = await findOneAffiliate({
      uuid,
    });
    if (!affiliate) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Afiliado não encontrado',
        }),
      );
    }
    if (affiliate.product.id_user !== id_user) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Você não possui permissão para fazer esta ação',
        }),
      );
    }
    if (affiliate.status === findAffiliateStatus('Ativo').id) {
      req.affiliate = affiliate;
      return next();
    }
    return next(
      ApiError.badRequest({
        success: false,
        message: 'This relation with affiliate is not active',
      }),
    );
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const getAffiliateInfo = async (req, res, next) => {
  const {
    params: { affiliate_uuid: uuid },
    user: { id: id_user },
  } = req;
  try {
    const affiliate = await findOneAffiliate({ uuid });
    if (!affiliate || affiliate.product.id_user !== id_user) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Você não possui permissão para fazer esta ação',
        }),
      );
    }

    const { email, whatsapp, instagram, tiktok, first_name, last_name } =
      affiliate.user;

    const normalizedInstagram = (() => {
      if (!instagram) return { username: null, link: null };
      const raw = String(instagram).trim();
      const cleaned = raw
        .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
        .replace(/\/.*/, '')
        .replace(/^@/, '')
        .trim();
      if (!cleaned) return { username: null, link: null };
      return {
        username: `@${cleaned}`,
        link: `https://instagram.com/${cleaned}`,
      };
    })();

    const normalizedTikTok = (() => {
      if (!tiktok) return { username: null, link: null };
      const raw = String(tiktok).trim();
      const cleaned = raw
        .replace(/^https?:\/\/(www\.)?tiktok\.com\//i, '')
        .replace(/^@/, '')
        .replace(/\/.*$/, '')
        .trim();
      if (!cleaned) return { username: null, link: null };
      return {
        username: `@${cleaned}`,
        link: `https://www.tiktok.com/@${cleaned}`,
      };
    })();

    return res.status(200).send({
      full_name: capitalizeName(`${first_name} ${last_name}`),
      email,
      whatsapp,
      instagram: normalizedInstagram.username,
      instagram_link: normalizedInstagram.link,
      tiktok: normalizedTikTok.username,
      tiktok_link: normalizedTikTok.link,
    });
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

module.exports = {
  affiliateAllowAccess,
  affiliateActiveInvite,
  affiliateBlockInvite,
  affiliateRejectInvite,
  affiliateSetCommission,
  findProductAffiliateSettingsAdapter,
  productAfilliate,
  getAffiliateInfo,
};
