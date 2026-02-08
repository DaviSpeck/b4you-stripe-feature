const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const { AxiosError } = require('axios');
const ApiError = require('../../error/ApiError');
const ApprovedUserAffiliateEmail = require('../../services/email/ApprovedUserAffiliate');
const PendingInviteAffiliateProducerEmail = require('../../services/email/producer/affiliates/PendingInvite');
const BlockedUserAffiliateEmail = require('../../services/email/BlockUserAffiliate');
const ChangeCommissionUserAffiliateEmail = require('../../services/email/ChangeCommissionUserAffiliate');
const CreateNotificationUseCase = require('../../useCases/dashboard/notifications/createNotification');
const PendingUserAffiliateEmail = require('../../services/email/PendingUserAffiliate');
const ProducerAffiliateEmail = require('../../services/email/ProducerAffiliate');
const RejectUserAffiliateEmail = require('../../services/email/RejectUserAffiliate');
const SerializeAffiliate = require('../../presentation/dashboard/affiliates');
const SerializeProductAffiliateMarket = require('../../presentation/dashboard/productMarketAffiliate');
const SerializeProductMarket = require('../../presentation/dashboard/productMarket');
const SerializeAffiliateFilter = require('../../presentation/dashboard/affiliatesFilters');
const InviteUsersUseCase = require('../../useCases/dashboard/affiliates/InviteUsers');
const ProductsRepository = require('../../repositories/sequelize/ProductsRepository');
const ProductAffiliateSettingsRepository = require('../../repositories/sequelize/ProductsAffiliateSettingsRepository');
const { findProductsMarket } = require('../../database/controllers/products');
const {
  createAffiliate,
  updateAffiliate,
  findFilteredAffiliates,
  findOneAffiliate,
  findAllAffiliate,
  findAffiliatesWithSales,
  findAllProductsWithAffiliates,
  findBestSallersAffiliates,
} = require('../../database/controllers/affiliates');
const {
  affiliateStatus,
  findAffiliateStatus,
  findAffiliateStatusByKey,
} = require('../../status/affiliateStatus');
const { capitalizeName } = require('../../utils/formatters');
const { findNotificationType } = require('../../types/notificationsTypes');
const MailService = require('../../services/MailService');
const { findProducts } = require('../../database/controllers/products');
const ProductPages = require('../../database/models/ProductPages');
const Affiliates = require('../../database/models/Affiliates');
const Product_affiliations = require('../../database/models/Product_affiliations');
const Product_affiliate_settings = require('../../database/models/Product_affiliate_settings');
const Managers = require('../../database/models/Managers');
const { findRulesTypesByKey } = require('../../types/integrationRulesTypes');
const SQS = require('../../queues/aws');
const Products = require('../../database/models/Products');

const { URL_SIXBASE_DASHBOARD } = process.env;

const makeMailService = () => {
  const mailServiceInstance = new MailService(
    process.env.MAILJET_PASSWORD,
    process.env.MAILJET_USERNAME,
  );

  return mailServiceInstance;
};

const formatQuery = ({ product_uuid, status, page = 0, size = 10, input }) => {
  const where = { page, size };
  if (product_uuid && product_uuid !== 'all') where.product_uuid = product_uuid;
  if (input) where.input = input;
  if (status && status !== 'all') {
    try {
      where.id_status = status
        .split(',')
        .filter((element) => element !== 'pending')
        .map((element) => findAffiliateStatusByKey(element).id);
    } catch (e) {
      throw ApiError.badRequest(
        'Status inválido, por favor informe um status válido.',
      );
    }
  } else {
    where.id_status = {
      [Op.ne]: findAffiliateStatusByKey('pending').id,
    };
  }
  return where;
};

const getAffiliateMarketController = async (req, res, next) => {
  const { page = 0, size = 10 } = req.query;
  try {
    const { count, rows } = await findProductsMarket(page, size);
    return res
      .status(200)
      .send({ count, rows: new SerializeProductMarket(rows).adapt() });
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

const getAffiliateMarketGlobalProductsController = async (req, res, next) => {
  const {
    params: { id_product },
  } = req;
  try {
    const products = await Product_affiliations.findAll({
      nest: true,
      where: { id_product },
      include: [
        {
          association: 'product_affiliation',
          attributes: ['id', 'name'],
        },
      ],
    });
    return res.status(200).send({
      products: products.map(({ product_affiliation: p }) => ({
        name: capitalizeName(p.name),
      })),
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

const getProductAffiliateMarketController = async (req, res, next) => {
  const {
    product,
    user: { id: id_user },
  } = req;

  try {
    if (product.product_offer.length === 0) {
      throw ApiError.badRequest('Produto sem ofertas');
    }
    const affiliate = await findOneAffiliate({
      id_user,
      id_product: product.id,
      status: [1, 2, 3],
    });
    product.affiliate = affiliate;
    const pages = await ProductPages.findAll({
      raw: true,
      where: {
        id_product: product.id,
      },
    });
    product.pages = pages;
    const serialized = await new SerializeProductAffiliateMarket(
      product,
      id_user,
      product.producer?.created_at,
    ).adapt();
    return res.status(200).send(serialized);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).send(error);
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

const createProductAffiliateController = async (req, res, next) => {
  const {
    user: { id: id_user, email: affiliate_email, full_name: affiliate_name },
    product: {
      id: id_product,
      producer: { email, full_name, id: id_producer },
      affiliateSettings: {
        manual_approve,
        commission,
        support_email,
        subscription_fee,
        subscription_fee_commission,
        commission_all_charges,
        subscription_fee_only,
        email_notification,
      },
      name: product_name,
    },
    cookies,
  } = req;

  try {
    const { b4youManager } = cookies;
    let id_manager = null;

    if (b4youManager) {
      const manager = await Managers.findOne({
        raw: true,
        where: { uuid: b4youManager, id_product },
      });

      if (manager) {
        id_manager = manager.id_user !== id_user ? manager.id : null;
      }
    } else {
      const manager = await Managers.findOne({
        raw: true,
        where: { id_status: 2, type: 'all', id_product },
      });

      if (manager) {
        id_manager = manager.id_user !== id_user ? manager.id : null;
      }
    }

    const status = manual_approve
      ? findAffiliateStatus('Pendente')
      : findAffiliateStatus('Ativo');

    const affiliateObj = {
      id_manager,
      subscription_fee,
      subscription_fee_commission,
      subscription_fee_only,
      commission_all_charges,
      id_product,
      id_user,
      commission,
      status: manual_approve
        ? findAffiliateStatus('Pendente').id
        : findAffiliateStatus('Ativo').id,
    };

    const { uuid, id } = await createAffiliate(affiliateObj);

    const mailToAffiliate = {
      affiliate_name: capitalizeName(affiliate_name),
      email: affiliate_email,
      commission,
      support_email: support_email || email,
      product_name,
    };

    if (manual_approve) {
      await new PendingUserAffiliateEmail(mailToAffiliate).send();
      if (email_notification) {
        await new PendingInviteAffiliateProducerEmail({
          email,
          full_name,
          product_name,
          affiliate_name,
          affiliate_email,
          commission,
        }).send();
      }
      await new CreateNotificationUseCase({
        id_user: id_producer,
        type: findNotificationType('Afiliados').id,
        title: 'Nova solicitação de afiliado',
        content: 'Você tem uma solicitação pendente de afiliado',
        key: 'products-affiliates',
        variant: 'light',
        params: { affiliate_uuid: uuid },
      }).execute();
    } else {
      await new ApprovedUserAffiliateEmail(mailToAffiliate).send();
      if (email_notification) {
        await new ProducerAffiliateEmail({
          email,
          full_name,
          product_name,
          affiliate_name,
          affiliate_email,
          commission,
        }).send();
      }
      await new CreateNotificationUseCase({
        id_user: id_producer,
        type: findNotificationType('Afiliados').id,
        title: 'Novo afiliado',
        content: 'Você recebeu um novo afiliado ao seu produto',
        key: 'products-afilliates',
        variant: 'success',
        params: { affiliate_uuid: uuid },
      }).execute();
      await new CreateNotificationUseCase({
        id_user,
        type: findNotificationType('Afiliados').id,
        title: 'Afiliação',
        content: 'Sua afiliação no produto foi aceita',
        key: 'produtos/afiliacoes',
        variant: 'success',
        params: { affiliate_uuid: uuid },
      }).execute();
      const otherProducts = await Product_affiliations.findAll({
        raw: true,
        where: {
          id_product,
        },
      });

      for await (const p of otherProducts) {
        const hasAffiliation = await Affiliates.findOne({
          raw: true,
          where: {
            id_user,
            status: [1, 2, 3],
            id_product: p.id_product_affiliation,
          },
        });
        if (hasAffiliation) {
          // eslint-disable-next-line
          continue;
        }
        const affSettings = await Product_affiliate_settings.findOne({
          raw: true,
          where: { id_product: p.id_product_affiliation },
        });
        const affObj = {
          subscription_fee: affSettings.subscription_fee,
          subscription_fee_commission: affSettings.subscription_fee_commission,
          subscription_fee_only: affSettings.subscription_fee_only,
          commission_all_charges: affSettings.commission_all_charges,
          id_product: p.id_product_affiliation,
          id_user,
          commission: affSettings.commission,
          status: findAffiliateStatus('Ativo').id,
        };
        await createAffiliate(affObj);
      }
    }

    await SQS.add('webhookEvent', {
      id_product,
      id_sale_item: null,
      id_event: findRulesTypesByKey('affiliate-request').id,
      id_cart: null,
      id_user: id_producer,
      id_affiliate: id,
    });

    return res.status(200).send({
      success: true,
      message: 'Affiliate was successfully requested',
      uuid,
      status,
      sent_mail_producer: true,
      sent_mail_affiliate: true,
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

const getAffiliatesController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;
  try {
    const where = formatQuery(query);
    where.id_user = id_user;
    const affiliates = await findFilteredAffiliates(where);
    return res.status(200).send({
      count: affiliates.count,
      rows: new SerializeAffiliate(affiliates.rows).adapt(),
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const getAffiliateRankingController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;

  try {
    const affiliates = await findAffiliatesWithSales({
      id_user,
      page: Math.max(0, query.page - 1),
      size: query.size,
      start: query.start,
      end: query.end,
      products: query.products,
    });

    return res.status(200).send(affiliates);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);

    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const getAffiliateProductsController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;

  const { id_affiliate } = req.params;

  try {
    const affiliates = await findAllProductsWithAffiliates({
      id_user,
      id_affiliate,
    });

    return res.status(200).send(affiliates);
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);

    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const getPendingAffiliatesController = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { input, product_uuid, size = 10, page = 0 },
  } = req;

  const limit = parseInt(size, 10);
  const offset = parseInt(page, 10) * limit;

  try {
    const where = {
      status: findAffiliateStatusByKey('pending').id,
    };

    if (input) {
      where[Op.or] = [
        { '$user.email$': { [Op.like]: `%${input}%` } },
        { '$user.full_name$': { [Op.like]: `%${input}%` } },
      ];
    }

    if (product_uuid && product_uuid !== 'all') {
      where['$product.uuid$'] = product_uuid;
    }
    const affiliates = await Affiliates.findAndCountAll({
      raw: true,
      nest: true,
      where,
      offset,
      limit,
      include: [
        {
          association: 'product',
          attributes: ['name', 'uuid'],
          where: { id_user },
        },
      {
        association: 'user',
        attributes: ['full_name', 'email', 'whatsapp', 'instagram', 'tiktok'],
      },
    ],
  });
    return res.status(200).json({
      count: affiliates.count,
      rows: new SerializeAffiliate(affiliates.rows).adapt(),
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

const setAffiliateActiveController = async (req, res, next) => {
  const {
    affiliate: {
      id: id_aff_webhook,
      uuid,
      commission,
      product: {
        id: id_product,
        id_user,
        name: product_name,
        affiliate_settings: { support_email },
      },
      user: { id: id_affiliate, first_name, last_name, email },
    },
  } = req;
  try {
    await updateAffiliate(
      { uuid },
      { status: findAffiliateStatus('Ativo').id },
    );

    await new ApprovedUserAffiliateEmail({
      affiliate_name: capitalizeName(`${first_name} ${last_name}`),
      email,
      commission,
      support_email,
      url_action: URL_SIXBASE_DASHBOARD,
      product_name,
    }).send();

    await new CreateNotificationUseCase({
      id_user: id_affiliate,
      type: findNotificationType('Afiliados').id,
      title: 'Afiliação',
      content: 'Sua afiliação no produto foi aceita',
      key: 'products-affiliates',
      variant: 'success',
      params: { affiliate_uuid: uuid },
    }).execute();

    const otherProducts = await Product_affiliations.findAll({
      raw: true,
      where: {
        id_product,
      },
    });

    for await (const p of otherProducts) {
      const hasAffiliation = await Affiliates.findOne({
        raw: true,
        where: {
          id_user: id_affiliate,
          status: [1, 2, 3],
          id_product: p.id_product_affiliation,
        },
      });
      if (hasAffiliation) {
        // eslint-disable-next-line
        continue;
      }
      const affSettings = await Product_affiliate_settings.findOne({
        raw: true,
        where: { id_product: p.id_product_affiliation },
      });
      const affObj = {
        subscription_fee: affSettings.subscription_fee,
        subscription_fee_commission: affSettings.subscription_fee_commission,
        subscription_fee_only: affSettings.subscription_fee_only,
        commission_all_charges: affSettings.commission_all_charges,
        id_product: p.id_product_affiliation,
        id_user: id_affiliate,
        commission: affSettings.commission,
        status: findAffiliateStatus('Ativo').id,
      };
      await createAffiliate(affObj);
    }

    await SQS.add('webhookEvent', {
      id_product,
      id_sale_item: null,
      id_event: findRulesTypesByKey('approved-affiliate').id,
      id_cart: null,
      id_user,
      id_affiliate: id_aff_webhook,
    });

    return res.status(200).send({
      success: true,
      message: 'Affiliate updated',
      status: findAffiliateStatus('Ativo').name,
      sent_mail_affiliate: true,
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

const setAffiliateBlockController = async (req, res, next) => {
  const {
    affiliate: {
      uuid,
      product: {
        name: product_name,
        affiliate_settings: { support_email },
        producer: { email: producer_email },
      },
      user: { id: id_affiliate, first_name, last_name, email },
    },
  } = req;
  try {
    await updateAffiliate(
      { uuid },
      { status: findAffiliateStatus('Bloqueado').id },
    );
    await new BlockedUserAffiliateEmail({
      affiliate_name: `${first_name} ${last_name}`,
      email,
      support_email: support_email || producer_email,
      product_name,
    }).send();
    await new CreateNotificationUseCase({
      id_user: id_affiliate,
      type: findNotificationType('Afiliados').id,
      title: 'Afiliação',
      content: 'Sua afiliação no produto foi bloqueada',
      key: 'products-affiliates',
      variant: 'danger',
      params: { affiliate_uuid: uuid },
    }).execute();
    return res.status(200).send({
      success: true,
      message: 'Affiliate updated',
      status: findAffiliateStatus('Bloqueado').name,
      sent_mail_affiliate: true,
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

const setAffiliateRejectController = async (req, res, next) => {
  const {
    affiliate: {
      id: id_aff_webhook,
      uuid,
      product: {
        id: id_product,
        id_user,
        name: product_name,
        affiliate_settings: { support_email },
      },
      user: { id: id_affiliate, first_name, last_name, email },
    },
  } = req;
  try {
    await updateAffiliate(
      { uuid },
      { status: findAffiliateStatus('Recusado').id },
    );
    await new RejectUserAffiliateEmail({
      affiliate_name: capitalizeName(`${first_name} ${last_name}`),
      email,
      support_email,
      product_name,
    }).send();

    await new CreateNotificationUseCase({
      id_user: id_affiliate,
      type: findNotificationType('Afiliados').id,
      title: 'Afiliação',
      content: 'Sua afiliação no produto foi rejeitada',
      key: 'products-affiliates',
      variant: 'danger',
      params: { affiliate_uuid: uuid },
    }).execute();

    await SQS.add('webhookEvent', {
      id_product,
      id_sale_item: null,
      id_event: findRulesTypesByKey('refused-affiliate').id,
      id_cart: null,
      id_user,
      id_affiliate: id_aff_webhook,
    });

    return res.status(200).send({
      success: true,
      message: 'Affiliate updated',
      status: findAffiliateStatus('Recusado').name,
      sent_mail_affiliate: true,
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

const setAffiliateCommissionController = async (req, res, next) => {
  const {
    affiliate: {
      uuid,
      id_user,
      commission: old_commission,
      product: { name: product_name },
      user: { first_name, last_name, email },
    },
    body: { commission, subscription_fee_commission, subscription_fee_only },
  } = req;
  let data = {
    commission,
  };

  if (subscription_fee_commission) {
    data = { ...data, subscription_fee_commission };
  }

  if (subscription_fee_only !== null) {
    data = { ...data, subscription_fee_only };
  }

  try {
    await updateAffiliate({ uuid }, data);
    if (old_commission !== commission) {
      await new ChangeCommissionUserAffiliateEmail(
        {
          email,
          affiliate_name: `${first_name} ${last_name}`,
          old_commission,
          new_commission: commission,
          product_name,
        },
        makeMailService(),
      ).send();
      await new CreateNotificationUseCase({
        id_user,
        type: findNotificationType('Afiliados').id,
        title: 'Afiliação',
        content: 'Sua comissão de afiliado foi atualizada',
        key: 'products-affiliates',
        variant: 'light',
        params: { affiliate_uuid: uuid },
      }).execute();
    }

    return res.status(200).send({
      success: true,
      message: 'Commission Affiliate updated',
      old_commission,
      new_commission: commission,
      sent_mail_affiliate: true,
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

const setAffiliateAllowAccessController = async (req, res, next) => {
  const {
    affiliate: { id },
    body: { allow_access },
  } = req;

  try {
    await updateAffiliate({ id }, { allow_access });
    return res.status(200).send({
      success: true,
      message: 'Commission Affiliate updated',
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const getFiltersController = async (req, res, next) => {
  const {
    user: { id: id_user },
  } = req;
  try {
    const products = await findProducts({ id_user });
    return res
      .status(200)
      .send(
        new SerializeAffiliateFilter({ products, affiliateStatus }).adapt(),
      );
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const findAllAffiliatesByProductController = async (req, res, next) => {
  const {
    product: { id: id_product },
  } = req;
  try {
    const affiliates = await findAllAffiliate({ id_product, status: 2 });
    return res.status(200).send(new SerializeAffiliate(affiliates).adapt());
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

const inviteUserToAffiliateController = async (req, res, next) => {
  const {
    product: { id: id_product },
    body: { emails },
  } = req;
  try {
    await new InviteUsersUseCase({
      id_product,
      ProductsRepository,
      ProductAffiliateSettingsRepository,
    }).execute(emails);
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

// eslint-disable-next-line
const exportAffiliates = async (req, res, next) => {
  const {
    user: { id: id_user },
    query,
  } = req;
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader('Content-Disposition', 'attachment; filename=afiliados.xlsx');
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
    useStyles: true,
    useSharedStrings: true,
    filename: 'afiliados.xlsx',
    stream: res,
  });
  const worksheet = workbook.addWorksheet();
  try {
    worksheet.columns = [
      {
        header: 'Nome',
        key: 'full_name',
        width: 30,
      },
      {
        header: 'Email',
        width: 30,
        key: 'email',
      },
      {
        header: 'Whatsapp',
        width: 16,
        key: 'whatsapp',
      },
      {
        header: 'Produto',
        width: 30,
        key: 'product_name',
      },
      {
        header: 'Comissão',
        width: 10,
        key: 'commission',
      },
      {
        header: 'Aceito em',
        width: 20,
        key: 'accepted_at',
      },
    ];
    const { product_uuid, id_status, input } = formatQuery(query);
    let where = {};
    if (product_uuid) where = { ...where, '$product.uuid$': product_uuid };
    if (id_status) {
      where.status = id_status;
    }
    if (input) {
      let orObject = {
        '$user.first_name$': { [Op.like]: `%${input}%` },
        '$user.last_name$': { [Op.like]: `%${input}%` },
        '$user.email$': { [Op.like]: `%${input}%` },
      };
      const sanitizedInput = input.replace(/[^\d]/g, '');
      if (sanitizedInput.length > 0) {
        orObject = {
          ...orObject,
          '$user.document_number$': {
            [Op.like]: `%${sanitizedInput}%`,
          },
        };
      }
      where = {
        ...where,
        [Op.or]: orObject,
      };
    }

    let offset = 0;
    let total = 500;
    while (total !== 0) {
      // eslint-disable-next-line
      const affiliates = await Affiliates.findAll({
        where,
        attributes: ['id', 'commission', 'status', 'updated_at'],
        limit: 500,
        offset,
        nest: true,
        distinct: true,
        subQuery: false,
        paranoid: true,
        order: [['created_at', 'DESC']],
        group: ['id'],
        include: [
          {
            association: 'product',
            attributes: ['name', 'uuid'],
            where: { id_user },
          },
          {
            association: 'user',
            attributes: ['full_name', 'email', 'whatsapp', 'instagram', 'tiktok'],
          },
        ],
      });
      offset += 500;
      total = affiliates.length;
      if (total < 500) {
        total = 0;
      }

      for (const {
        commission,
        updated_at,
        product: { name: product_name },
        user: { full_name, email, whatsapp },
      } of affiliates) {
        worksheet
          .addRow({
            full_name: capitalizeName(full_name),
            email,
            whatsapp,
            product_name,
            commission,
            accepted_at: new Date(updated_at).toLocaleDateString('pt-BR'),
          })
          .commit();
      }
    }
    worksheet.commit();
    await workbook.commit();
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

const getExportAffiliateRanking = async (req, res) => {
  const {
    user: { id: id_user, email, first_name },
    query,
  } = req;

  const { start, end, products } = query;

  try {
    await SQS.add('exportAffiliateRanking', {
      start,
      end,
      products,
      first_name,
      email,
      id_user,
    });
    return res.status(200).json({ message: 'Arquivo enviado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao gerar o arquivo Excel' });
  }
};

const getBestSallersAffiliateRanking = async (req, res) => {
  const {
    user: { id: id_user },
    query,
  } = req;

  const { start, end, products } = query;

  const resTeste = await findBestSallersAffiliates({
    id_user,
    start,
    end,
    products,
  });

  const data = resTeste.map((affiliate) => ({
    ...affiliate,
    affiliate_name: capitalizeName(affiliate.affiliate_name),
  }));

  return res.status(200).json(data);
};

const getPendingCount = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { input, product_uuid },
  } = req;

  try {
    const where = {
      status: findAffiliateStatusByKey('pending').id,
      '$product.id_user$': id_user,
    };

    if (input) {
      where[Op.or] = [{ '$user.email$': { [Op.like]: `%${input}%` } }];
    }

    if (product_uuid && product_uuid !== 'all') {
      where['$product.uuid$'] = product_uuid;
    }

    const count = await Affiliates.count({
      where,
      include: [
        {
          association: 'product',
          attributes: ['id', 'id_user', 'uuid'],
        },
      ],
    });
    return res.status(200).json({ count });
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

const updatePendingStatus = async (req, res, next) => {
  const {
    user: { id: id_user },
    query: { input, product_uuid },
    params: { status },
  } = req;

  try {
    if (!status) {
      return res.status(400).json({
        message: 'missing status',
      });
    }

    const statusNumber = parseInt(status, 10);

    if (![2, 4].includes(statusNumber)) {
      return res.status(400).json({
        message: 'invalid status',
      });
    }

    const where = {
      status: findAffiliateStatusByKey('pending').id,
    };

    if (input) {
      const affiliateInvite = await Affiliates.findOne({
        raw: true,
        attributes: ['id'],
        where: {
          [Op.or]: {
            '$user.email$': {
              [Op.like]: `%${input}%`,
            },
            '$user.full_name$': {
              [Op.like]: `%${input}%`,
            },
          },
        },
        include: [
          {
            association: 'product',
            attributes: ['name', 'uuid'],
            where: { id_user },
          },
          {
            association: 'user',
            attributes: ['full_name', 'email', 'whatsapp', 'instagram', 'tiktok'],
          },
        ],
      });
      if (affiliateInvite) {
        where.id = affiliateInvite.id;
      }
    }

    if (product_uuid && product_uuid !== 'all') {
      const product = await Products.findOne({
        raw: true,
        attributes: ['id'],
        where: {
          id_user,
          uuid: product_uuid,
        },
      });
      if (product) {
        where.id_product = product.id;
      }
    } else {
      const products = await Products.findAll({
        raw: true,
        where: {
          id_user,
        },
        attributes: ['id'],
      });
      where.id_product = products.map((p) => p.id);
    }

    await Affiliates.update(
      {
        status: statusNumber,
      },
      {
        where,
      },
    );
    return res.sendStatus(200);
  } catch (error) {
    // eslint-disable-next-line
    console.log(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
      ),
    );
  }
};

const exportAffiliatesPeading = async (req, res, next) => {
  const {
    user: { id: id_user, email, first_name },
    query: { input, product_uuid },
  } = req;

  try {
    await SQS.add('exportPendingAffiliate', {
      input,
      product_uuid,
      first_name,
      email,
      id_user,
    });

    return res.status(200).json({ message: 'Arquivo enviado com sucesso!' });
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

const exportAffiliatesEmailController = async (req, res, next) => {
  const {
    user: { id: id_user, first_name, email: userEmail },
    body: { email, params },
  } = req;

  try {
    const formattedQuery = formatQuery(params || {});
    await SQS.add('exportAffiliates', {
      query: formattedQuery,
      first_name,
      email: email || userEmail,
      id_user,
    });
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof AxiosError) {
      return res.status(400).send({ message: 'Faltou rodar o lambda' });
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

module.exports = {
  updatePendingStatus,
  getPendingCount,
  exportAffiliates,
  createProductAffiliateController,
  getAffiliateMarketController,
  getAffiliatesController,
  getFiltersController,
  getPendingAffiliatesController,
  getProductAffiliateMarketController,
  setAffiliateActiveController,
  setAffiliateAllowAccessController,
  setAffiliateBlockController,
  setAffiliateCommissionController,
  setAffiliateRejectController,
  findAllAffiliatesByProductController,
  inviteUserToAffiliateController,
  getAffiliateMarketGlobalProductsController,
  getAffiliateRankingController,
  getAffiliateProductsController,
  getExportAffiliateRanking,
  getBestSallersAffiliateRanking,
  exportAffiliatesPeading,
  exportAffiliatesEmailController,
};
