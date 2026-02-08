const { Op } = require('sequelize');
const ApiError = require('../../error/ApiError');
const Cache = require('../../config/Cache');
const dateHelper = require('../../utils/helpers/date');
const {
  VIDEOTYPE,
  EBOOKTYPE,
  SUBSCRIPTION,
} = require('../../types/productTypes');
const {
  findOneProductMarket,
  findSingleProductWithProducer,
  findProducerProduct,
  findSingleProductAffiliateOrCoproducer,
} = require('../../database/controllers/products');
const {
  findOneStudentProgress,
} = require('../../database/controllers/student_progress');
const {
  findProductOffer,
} = require('../../database/controllers/product_offer');
const {
  findStudentProduct,
} = require('../../database/controllers/student_products');
const {
  findCoproductionStatusByKey,
} = require('../../status/coproductionsStatus');
const { findAffiliateStatusByKey } = require('../../status/affiliateStatus');
const { findRoleTypeByKey } = require('../../types/roles');
const rawData = require('../../database/rawData');
const {
  findLessonAttachmentByUUID,
} = require('../../database/controllers/lessons_attachments');
const { findImageTypeByKey } = require('../../types/imageTypes');
const Affiliates = require('../../database/models/Affiliates');
const Plugins = require('../../database/models/Plugins');
const Shop_integrations = require('../../database/models/Shop_integrations');
const { findIntegrationTypeByKey } = require('../../types/integrationTypes');

const isSubscriptionProduct = async (req, res, next) => {
  const {
    product: { payment_type },
  } = req;
  if (payment_type !== SUBSCRIPTION)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'O produto selecionado não possui plano por assinatura',
      }),
    );

  return next();
};

const getUserRole = (product, id_user) => {
  if (product.id_user === id_user) return findRoleTypeByKey('producer').id;
  if (product.affiliates.find((aff) => aff.id_user === id_user))
    return findRoleTypeByKey('affiliate').id;

  return findRoleTypeByKey('coproducer').id;
};

const validateProductCoproductor = async (req, res, next) => {
  const { product_id } = req.params;
  try {
    const product = await findSingleProductWithProducer({ uuid: product_id });
    if (!product) return next(ApiError.badRequest('product not found'));
    req.product = product;
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

const findProductOfferBodyAdapter = async (req, res, next) => {
  const { product_offer } = req.body;

  try {
    const productOffer = await findProductOffer({
      uuid: product_offer,
    });

    if (!productOffer)
      return next(ApiError.badRequest('product not found with the given id'));

    const now = dateHelper().now();

    if (productOffer.end_offer && now > productOffer.end_offer)
      return next(ApiError.badRequest('Oferta expirada'));

    req.productOffer = productOffer;

    return next();
  } catch (error) {
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

const findSingleProductAdapter = async (req, res, next) => {
  const { product_id } = req.params;
  const {
    user: { id: id_user },
  } = req;
  try {
    let product = await findSingleProductWithProducer({
      uuid: product_id,
      id_user,
    });
    const affiliateProduct = await Affiliates.findOne({
      nest: true,
      where: {
        id_user,
      },
      attributes: ['id_user', 'id_product', 'id'],
      include: [
        {
          association: 'product',
          where: { uuid: product_id },
        },
      ],
    });
    const blingIntegration = await Plugins.findOne({
      where: {
        id_user,
        id_plugin: [
          findIntegrationTypeByKey('blingshippingv3').id,
          findIntegrationTypeByKey('blingshipping').id,
        ],
      },
    });

    if (blingIntegration) {
      product.has_bling = true;
    }

    const tinyIntegration = await Plugins.findOne({
      where: {
        id_user,
        id_plugin: [findIntegrationTypeByKey('tiny').id],
      },
    });

    if (tinyIntegration) {
      product.has_tiny = true;
    }

    const shopIntegration = await Shop_integrations.findOne({
      where: {
        id_product: product.id,
      },
    });

    if (shopIntegration) {
      product.has_shop_integration = true;
    }

    if (affiliateProduct && affiliateProduct.product)
      product = affiliateProduct.product;
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    req.product = product;
    return next();
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${req.method.toUpperCase()}: ${req.originalUrl
        }`,
        error,
      ),
    );
  }
};

const findAffiliateOrCoproducerProduct = async (req, res, next) => {
  const { product_id } = req.params;
  const {
    user: { id: id_user },
  } = req;
  try {
    const product = await findSingleProductAffiliateOrCoproducer({
      uuid: product_id,
      [Op.or]: [
        {
          id_user,
        },
        {
          [Op.and]: [
            {
              '$coproductions.id_user$': id_user,
            },
            {
              '$coproductions.status$':
                findCoproductionStatusByKey('active').id,
            },
          ],
        },
        {
          [Op.and]: [
            {
              '$affiliates.id_user$': id_user,
            },
            {
              '$affiliates.status$': findAffiliateStatusByKey('active').id,
            },
          ],
        },
      ],
    });
    if (!product) throw ApiError.badRequest('Produto não encontrado');
    product.id_role = getUserRole(product, id_user);
    req.product = product;
    return next();
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${req.method.toUpperCase()}: ${req.originalUrl
        }`,
        error,
      ),
    );
  }
};

const findSingleProductMarketAdapter = async (req, res, next) => {
  const { product_id } = req.params;
  try {
    const product = await findOneProductMarket(product_id);
    if (!product)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Produto não encontrado',
        }),
      );
    product.affiliate_images = product.affiliate_images.filter(
      ({ id_type }) => id_type === findImageTypeByKey('market-content').id,
    );
    req.product = product;
    return next();
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${req.method.toUpperCase()}: ${req.originalUrl
        }`,
        error,
      ),
    );
  }
};

const findStudentProductByUUIDAdapter = async (req, _res, next) => {
  const {
    student: { id: id_student, producer_id = 0 },
    params: { product_id: uuid },
  } = req;

  try {
    if (producer_id && id_student === 0) {
      const product = await findProducerProduct({
        uuid,
        id_user: producer_id,
      });

      if (!product) {
        return next(
          ApiError.badRequest({
            success: false,
            message: 'Produto não encontrado',
          }),
        );
      }

      req.product = product.toJSON();
      req.studentProduct = null; // explícito: preview não tem studentProduct
      return next();
    }

    const cacheKey = `membership_product:${id_student}:${uuid}`;
    let studentProduct = await Cache.get(cacheKey);

    if (studentProduct) {
      studentProduct = JSON.parse(studentProduct);
      req.product = studentProduct.product;
      req.studentProduct = studentProduct;
      return next();
    }

    const studentProductAccess = await findStudentProduct(
      {
        id_student,
        '$product.uuid$': uuid,
      },
      id_student,
    );

    if (!studentProductAccess) {
      return next(
        ApiError.badRequest({
          success: false,
          message: 'Produto não encontrado',
        }),
      );
    }

    studentProduct = rawData(studentProductAccess);

    await Cache.set(
      cacheKey,
      JSON.stringify(studentProduct),
    );

    req.studentProduct = studentProduct;
    req.product = studentProduct.product;

    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error, ${Object.keys(req.route.methods)[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const findLessonAccessContextAdapter = async (req, _res, next) => {
  const {
    student: { id: id_student, producer_id },
    params: { product_id },
  } = req;

  const isPreview = producer_id && id_student === 0;

  try {
    if (isPreview) {
      const product = await findProducerProduct({
        uuid: product_id,
        id_user: producer_id,
      });

      if (!product) {
        return next(ApiError.badRequest('Produto não encontrado'));
      }

      req.product = product.toJSON();
      req.studentProduct = null;
      req.isPreview = true;

      return next();
    }

    const studentProductAccess = await findStudentProduct(
      {
        id_student,
        '$product.uuid$': product_id,
      },
      id_student,
    );

    if (!studentProductAccess) {
      return next(ApiError.badRequest('Produto não encontrado'));
    }

    const studentProduct = rawData(studentProductAccess);

    req.product = studentProduct.product;
    req.studentProduct = studentProduct;
    req.isPreview = false;

    return next();
  } catch (error) {
    return next(
      ApiError.internalServerError(
        `Internal Server Error: ${req.originalUrl}`,
        error,
      ),
    );
  }
};

const isEbookProduct = async (req, res, next) => {
  const { product } = req;
  if (product.id_type !== EBOOKTYPE)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'O produto não é um E-book',
      }),
    );
  return next();
};

const isVideoProduct = async (req, res, next) => {
  const { product } = req;
  if (product.id_type !== VIDEOTYPE)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'O produto não é um curso',
      }),
    );
  return next();
};

const isFinishedCourse = async (req, res, next) => {
  const {
    product: { id: id_product },
    student: { id: id_student },
  } = req;
  try {
    const studentProgress = await findOneStudentProgress(
      id_student,
      id_product,
    );
    if (!studentProgress || !studentProgress.finished_at)
      return next(
        ApiError.badRequest({
          success: false,
          message: 'O curso ainda não foi concluído',
        }),
      );
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

const findSelectedAttachment = async (req, res, next) => {
  const {
    product: { id_user },
  } = req;

  const { attachment_id } = req.params;

  const selectedAttachment = await findLessonAttachmentByUUID(
    attachment_id,
    id_user,
  );

  if (!selectedAttachment)
    return next(
      ApiError.badRequest({
        success: false,
        message: 'Anexo não encontrado',
      }),
    );

  req.attachment = selectedAttachment;
  return next();
};

const findEbook = async (req, res, next) => {
  const {
    product: { ebooks },
  } = req;
  const { ebook_id } = req.params;

  const ebook = ebooks.find(({ uuid }) => uuid === ebook_id);
  if (!ebook)
    return next(
      ApiError.badRequest({ success: false, message: 'Ebook não encontrado' }),
    );

  req.ebook = ebook;
  return next();
};

module.exports = {
  findAffiliateOrCoproducerProduct,
  findEbook,
  findProductOfferBodyAdapter,
  findSelectedAttachment,
  findSingleProductAdapter,
  findSingleProductMarketAdapter,
  findStudentProductByUUIDAdapter,
  findLessonAccessContextAdapter,
  isEbookProduct,
  isFinishedCourse,
  isSubscriptionProduct,
  isVideoProduct,
  validateProductCoproductor,
};
