/** @typedef {import('express').Request} Request */
/** @typedef {import('express').Response} Response */
/** @typedef {import('express').NextFunction} NextFunction */

const Users = require('../../../database/models/Users');
const ApiError = require('../../../error/ApiError');
const CreateUserUseCase = require('../../../useCases/dashboard/CreateUser');
const { rawDocument, capitalizeName } = require('../../../utils/formatters');
const encrypter = require('../../../utils/helpers/encrypter');
const UserSerializer = require('../../../presentation/users');
const token = require('../../../utils/helpers/token');
const { findUserBalanceController } = require('../../common/balance');
const { createWithdrawalController } = require('../../common/withdrawals');
const Products = require('../../../database/models/Products');
const Product_affiliate_settings = require('../../../database/models/Product_affiliate_settings');
const Coproductions = require('../../../database/models/Coproductions');
const Affiliates = require('../../../database/models/Affiliates');
const { findAffiliateStatusByKey } = require('../../../status/affiliateStatus');
const Suppliers = require('../../../database/models/Suppliers');
const ProductPages = require('../../../database/models/ProductPages');
const Product_offer = require('../../../database/models/Product_offer');
const { findProductPageTypeByID } = require('../../../types/productPagesTypes');

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
module.exports.createUser = async (req, res, next) => {
  const { email, full_name, password, document_number, whatsapp } = req.body;
  try {
    const isThereAnUserWithEmail = await Users.findOne({
      attributes: ['id'],
      where: {
        email,
      },
    });
    if (isThereAnUserWithEmail)
      throw ApiError.badRequest({
        success: false,
        message: 'email already in use',
      });
    const rawDocumentNumber = rawDocument(document_number);
    const isThereAnUserWithCPF = await Users.findOne({
      attributes: ['id'],
      where: {
        document_number: rawDocumentNumber,
      },
    });
    if (isThereAnUserWithCPF)
      throw ApiError.badRequest({
        success: false,
        message: 'document already in use',
      });
    const [first_name, ...last_name] = full_name.split(' ');
    const createdUser = await new CreateUserUseCase(
      {
        document_number: rawDocumentNumber,
        email,
        first_name: first_name.trim().toLowerCase(),
        last_name: last_name.join(' ').trim(),
        password,
        whatsapp,
        b4youReferral: null,
      },
      false,
    ).create();
    return res.status(201).send(new UserSerializer(createdUser).adapt());
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.code)
        .json({ code: error.code, message: error.message.message });
    }
    return next(ApiError.internalServerError('Internal Server Error', error));
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({
      raw: true,
      where: {
        email,
      },
    });
    if (!user) {
      throw ApiError.badRequest('user not found');
    }
    const validPassword = await encrypter.compare(password, user.password);
    if (!validPassword) {
      throw ApiError.badRequest('invalid password');
    }
    const jwt = token.generateToken({ id_user: user.id }, '7d');
    return res
      .status(200)
      .json({ ...new UserSerializer(user).adapt(), token: jwt });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).json(error);
    }
    return next(ApiError.internalServerError('Internal Server Error', error));
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
module.exports.getBalance = async (req, res, next) => {
  const { id_user } = req;
  try {
    req.user = { id: id_user };
    return findUserBalanceController(req, res, next);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).json(error);
    }
    return next(ApiError.internalServerError('Internal Server Error', error));
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
module.exports.createWithdrawal = async (req, res, next) => {
  const { id_user } = req;
  try {
    req.user = { id: id_user };
    return createWithdrawalController(req, res, next);
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).json(error);
    }
    return next(ApiError.internalServerError('Internal Server Error', error));
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
module.exports.validateAffiliate = async (req, res, next) => {
  const {
    params: { product_id },
    id_user,
  } = req;
  try {
    const product = await Products.findOne({
      raw: true,
      nest: true,
      where: {
        uuid: product_id,
        allow_affiliate: true,
      },
      attributes: ['id', 'id_user', 'name'],
      include: [
        {
          association: 'producer',
          attributes: ['id', 'email', 'full_name'],
        },
      ],
    });
    if (!product) {
      throw ApiError.badRequest('product not found');
    }
    req.product = product;
    if (id_user === product.id_user) {
      throw ApiError.badRequest(
        'producer cannot be affiliate on his own product',
      );
    }
    const affiliateSettings = await Product_affiliate_settings.findOne({
      raw: true,
      where: { id_product: product.id },
    });
    if (!affiliateSettings) {
      throw ApiError.badRequest('affiliate settings not found');
    }
    req.product.affiliateSettings = affiliateSettings;
    const coproducer = await Coproductions.findOne({
      raw: true,
      attributes: ['id'],
      where: {
        id_user,
        id_product: product.id,
        status: [1, 2],
      },
    });
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
      attributes: ['id', 'uuid'],
      paranoid: true,
      where: {
        id_user,
        id_product: product.id,
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
          uuid: affiliate.uuid,
        }),
      );
    }
    const isSupplier = await Suppliers.findOne({
      raw: true,
      attributes: ['id'],
      where: { id_user, id_product: product.id, id_status: [1, 2] },
    });
    if (isSupplier) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Usuário é fornecedor neste produto',
        }),
      );
    }

    const user = await Users.findOne({
      raw: true,
      where: {
        id: id_user,
      },
      attributes: ['id', 'full_name', 'email'],
    });
    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).json(error);
    }
    return next(ApiError.internalServerError('Internal Server Error', error));
  }
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
module.exports.validateUser = async (req, res, next) => {
  const {
    query: { email },
  } = req;
  try {
    const user = await Users.findOne({
      raw: true,
      where: {
        email,
      },
      attributes: ['id'],
    });
    return res.status(200).json({
      email_already_registered: !!user,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).json(error);
    }
    return next(ApiError.internalServerError('Internal Server Error', error));
  }
};

const resolveCommissionPrice = (plans) => {
  const orderedPlans = plans.sort((a, b) => b.price - a.price);
  return orderedPlans[0].price;
};

/**
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
module.exports.getAffiliateLinks = async (req, res, next) => {
  const {
    params: { uuid: affiliateUuid },
  } = req;
  try {
    const affiliate = await Affiliates.findOne({
      raw: true,
      attributes: ['id', 'id_product', 'commission'],
      where: { uuid: affiliateUuid, status: 2 },
    });
    if (!affiliate) {
      throw ApiError.badRequest('affiliate not found');
    }
    const [pages, offers] = await Promise.all([
      ProductPages.findAll({
        raw: true,
        where: {
          id_product: affiliate.id_product,
        },
      }),
      Product_offer.findAll({
        raw: true,
        where: {
          active: true,
          id_product: affiliate.id_product,
          allow_affiliate: true,
          affiliate_visible: true,
        },
      }),
    ]);
    return res.status(200).json({
      offers: offers.map(
        ({
          uuid,
          name,
          price,
          plans,
          toggle_commission,
          affiliate_commission,
          shipping_type,
          shipping_price,
        }) => {
          let price_commission = price;
          if (shipping_type === 1) {
            price_commission += shipping_price;
          }
          if (plans?.length > 0) {
            price_commission = resolveCommissionPrice(plans);
          }
          const url = `${process.env.URL_SIXBASE_CHECKOUT}/${uuid}?b4f=${affiliateUuid}`;
          const url_3_steps = `${process.env.URL_SIXBASE_CHECKOUT}/${uuid}/3steps?b4f=${affiliateUuid}`;

          const comm = toggle_commission
            ? affiliate_commission
            : affiliate.commission;

          let commission_amount = affiliate
            ? price_commission * (comm / 100)
            : price_commission;

          if (
            commission_amount >
            price_commission - 2 - price_commission * 0.069
          ) {
            commission_amount -= 2;
            commission_amount -= commission_amount * 0.069;
          }

          return {
            url,
            url_3_steps,
            label: capitalizeName(name),
            price: price_commission,
            commission_percentage: affiliate ? comm : 0,
            commission_amount: commission_amount - 0.01,
          };
        },
      ),
      pages: pages.map(({ uuid, label, id_type }) => ({
        uuid,
        label: capitalizeName(label),
        type: findProductPageTypeByID(id_type).label,
        url: `${process.env.SIXBASE_URL_PRODUCT}/pages/${uuid}/${affiliateUuid}`,
      })),
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.code).json(error);
    }
    return next(ApiError.internalServerError('Internal Server Error', error));
  }
};
