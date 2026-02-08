const express = require('express');
const dns = require('dns');
const https = require('https');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const auth = require('../../middlewares/auth');

const router = express.Router();
const validateDto = require('../../middlewares/validate-dto');
const createProductDto = require('../../dto/products/createProduct');
const updateGeneralDTO = require('../../dto/products/updateProductGeneral');
const updateCheckoutDTO = require('../../dto/products/updateProductCheckout');
const updateVideoDTO = require('../../dto/offers/updateVideo');
const updateTracking = require('../../dto/products/updateTracking');
const multerImagesConfig = require('../../config/multer/configs/images');
const {
  validateFile,
} = require('../../middlewares/validatorsAndAdapters/common');
const {
  findSingleProductAdapter,
  isEbookProduct,
  isSubscriptionProduct,
} = require('../../middlewares/validatorsAndAdapters/products');
const {
  createNewProductController,
  deleteCoverController,
  deleteEbookCoverController,
  deleteLogoController,
  deleteProductController,
  findProductsNameController,
  findSingleProductController,
  getProductCategoriesController,
  updateEbookCoverController,
  updateProductController,
  updateProductCoverController,
  updateProductLogoController,
  uploadCertificateController,
  findCoproductionsLinksController,
  findProductsIntegrationsController,
  updateProductVideoController,
  deleteProductVideoController,
  updateProductMembershipColorController,
  cancelAffiliation,
  findProductsAffiliateController,
  findProductsPaginatedController,
  findShopifyProductPaginatedController,
  findEcommercePaginatedController,
  findCoproductionsController,
  findProductsRankingController,
  exportProductsRankingController,
  removeEmailTemplateController,
  sendTemplateController,
  findProductsWithOffersController,
} = require('../../controllers/dashboard/products');
const {
  updateOfferByProductController,
  getCheckoutCustomizationsByProductUuidController,
  updateOfferByUuidController,
  findOffersByProductUuidController,
} = require('../../controllers/dashboard/offers');
const {
  getRecommendedProducts,
  updateRecommendedProducts,
  getProducerProducts,
} = require('../../controllers/dashboard/recommendedProducts');
const logger = require('../../utils/logger');
const Products = require('../../database/models/Products');
const ApiError = require('../../error/ApiError');
const Coproductions = require('../../database/models/Coproductions');
const { findRoleTypeByKey } = require('../../types/roles');
const Affiliates = require('../../database/models/Affiliates');
// const {
//   upsellNativeProductGet,
//   upsellNativeProductImage,
//   upsellNativeProductActive,
//   upsellNativeProductInactive,
//   upsellNativeProductUpdate,
//   upsellNativeProductUpdateEmbed,
//   upsellNativeProductImageRemove,
//   upsellNativeProductEmbedRemove,
// } = require('../../controllers/dashboard/upsell_native_product');
// const {
//   upsellNativeProductActiveInactiveDto,
//   upsellNativeDto,
// } = require('../../dto/products/upsellNativeProduct');
// const {
//   upsellNativeOfferUpdateEmbed,
//   upsellNativeOfferImage,
//   upsellNativeOfferImageRemove,
//   removeNativeOffer,
//   getUpsellNativeOffer,
//   activeUpsellNativeOffer,
//   updateNativeUpsellOffer,
//   getUpsellNativeOfferCheck,
// } = require('../../controllers/dashboard/upsell_native_offer');
// const {
//   UpsellNativeOfferUseCase,
// } = require('../../useCases/dashboard/upsellNative/upsellOffer.useCase');
// const {
//   UpsellNativeProductUseCase,
// } = require('../../useCases/dashboard/upsellNative/upsellProduct.useCase');
const {
  OffersUpsellList,
} = require('../../useCases/dashboard/upsellNative/offersUpsellList.useCase');

const oneMinute = 60 * 1000;
const limiter = rateLimit({
  windowMs: oneMinute,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

router.use(
  '/anchors/:product_id',
  findSingleProductAdapter,
  require('./anchors'),
);

router.use(
  '/managers/:product_id',
  findSingleProductAdapter,
  require('./managers'),
);

router.use(
  '/plans/:product_id',
  findSingleProductAdapter,
  isSubscriptionProduct,
  require('./plans'),
);

router.use('/pages/:product_id', findSingleProductAdapter, require('./pages'));

router.use(
  '/students/:product_id',
  findSingleProductAdapter,
  require('./students'),
);

router.use(
  '/pixels/:product_id',
  async (req, res, next) => {
    const {
      params: { product_id },
      user: { id: id_user },
    } = req;
    try {
      const product = await Products.findOne({
        raw: true,
        where: { uuid: product_id },
      });

      if (!product) {
        throw ApiError.badRequest('product not found');
      }

      req.product = product;
      if (id_user === product.id_user) {
        req.product.id_role = findRoleTypeByKey('producer').id;
        return next();
      }
      const coproduction = await Coproductions.findOne({
        raw: true,
        attributes: ['id'],
        where: {
          id_user,
          id_product: product.id,
        },
      });
      if (coproduction) {
        req.product.id_role = findRoleTypeByKey('coproducer').id;
        return next();
      }

      const affiliate = await Affiliates.findOne({
        raw: true,
        attributes: ['id'],
        where: {
          id_user,
          id_product: product.id,
        },
      });
      if (!affiliate) {
        throw ApiError.badRequest('product not found');
      }
      req.product.id_role = findRoleTypeByKey('affiliate').id;
      return next();
    } catch (error) {
      if (error instanceof ApiError) {
        return res.status(error.code).send(error);
      }
      // eslint-disable-next-line
      console.log(error);
      return res.sendStatus(500);
    }
  },
  require('./pixels'),
);

router.use(
  '/ebooks/:product_id',
  findSingleProductAdapter,
  isEbookProduct,
  require('./ebooks'),
);

router.use(
  '/gallery/:product_id',
  findSingleProductAdapter,
  require('./product_gallery'),
);

router.use(
  '/classrooms/:product_id',
  findSingleProductAdapter,
  require('./classrooms'),
);

router.use(
  '/modules/:product_id',
  findSingleProductAdapter,
  require('./modules'),
);

router.use(
  '/lessons/:product_id',
  findSingleProductAdapter,
  require('./lessons'),
);

router.use(
  '/offers/:product_id',
  findSingleProductAdapter,
  require('./offers'),
);

router.use(
  '/:product_id/suppliers',
  findSingleProductAdapter,
  require('./suppliers'),
);

router.use(
  '/coupons/:product_id',
  findSingleProductAdapter,
  require('./coupons'),
);

router.use(
  '/coproduction/:product_id',
  findSingleProductAdapter,
  require('./products_coproductions'),
);

router.use(
  '/integration/:product_id',
  findSingleProductAdapter,
  require('./integrations'),
);

router.use(
  '/affiliate/:product_id',
  findSingleProductAdapter,
  require('./affiliate_settings'),
);

router.get('/', findProductsPaginatedController);

router.get('/with-offers', findProductsWithOffersController);

router.get('/ranking', findProductsRankingController);

router.get('/ranking/export', exportProductsRankingController);

router.get('/ecommerce', findEcommercePaginatedController);

router.get('/shopify', findShopifyProductPaginatedController);

router.get('/integrations', findProductsIntegrationsController);

router.get('/coproductions', findCoproductionsController);

router.get(
  '/coproductions/links/:product_uuid',
  findCoproductionsLinksController,
);

router.get('/affiliates', findProductsAffiliateController);

router.put('/affiliates/:product_uuid', cancelAffiliation);

// Recommended products routes (must be before generic :product_id routes)
router.get('/:uuidProduct/recommended-products', auth, getRecommendedProducts);
router.put(
  '/:uuidProduct/recommended-products',
  auth,
  updateRecommendedProducts,
);
router.get(
  '/:uuidProduct/recommended-products/available',
  auth,
  getProducerProducts,
);

router.get(
  '/:product_id/names',
  findSingleProductAdapter,
  findProductsNameController,
);

router.get(
  '/product/:product_id',
  findSingleProductAdapter,
  findSingleProductController,
);

router.get('/categories', getProductCategoriesController);

router.post('/', validateDto(createProductDto), createNewProductController);

router.put(
  '/:product_id/general',
  validateDto(updateGeneralDTO),
  updateProductController,
);

router.put(
  '/:product_id/general/email-template',
  removeEmailTemplateController,
);

router.post(
  '/:product_id/general/email-template/send',
  limiter,
  sendTemplateController,
);

router.put(
  '/:product_id/tracking',
  validateDto(updateTracking),
  updateProductController,
);

router.put(
  '/:product_id/checkout',
  validateDto(updateCheckoutDTO),
  updateProductController,
);

router.put(
  '/:product_uuid/checkout/customizations',
  updateOfferByProductController,
);

router.get(
  '/:product_uuid/checkout/customizations',
  getCheckoutCustomizationsByProductUuidController,
);

router.get(
  '/:product_uuid/offers',
  findOffersByProductUuidController,
);

router.put(
  '/:product_uuid/offers/:offer_uuid',
  updateOfferByUuidController,
);

router.post('/:product_id/checkout/cname', (req, res) => {
  let { domain } = req.body;

  domain = `pixel.${domain}`;

  dns.lookup(domain, 'CNAME', (err, data) => {
    logger.info(`[cname] [error] -> `, err);
    if (err)
      return res.status(200).send({ valid: false, message: 'CNAME inválido' });

    if (data !== process.env.PIXEL_SERVER_IP)
      return res.status(200).send({ valid: false });

    const options = {
      host: domain,
      method: 'get',
      path: '/',
    };

    // tap to generate new cert
    const request = https.request(options);
    request.on('error', () => {});
    request.end();

    setTimeout(() => {
      const request2 = https.request(options, (r) => {
        if (r.socket.authorized)
          return res
            .status(200)
            .send({ valid: true, message: 'Domínio válido' });
        return res
          .status(200)
          .send({ valid: false, message: 'Certificado inválido' });
      });
      request2.on('error', () => {
        res.status(200).send({ valid: false, message: 'Certificado inválido' });
      });
      request2.end();
    }, 15000);

    return true;
  });
});

router.delete('/:product_id', deleteProductController);

router.put(
  '/logo/:product_id',
  multer(multerImagesConfig).single('logo'),
  validateFile,
  findSingleProductAdapter,
  updateProductLogoController,
);

router.put(
  '/video/:product_id',
  validateDto(updateVideoDTO),
  findSingleProductAdapter,
  updateProductVideoController,
);

router.delete(
  '/video/:product_id',
  findSingleProductAdapter,
  deleteProductVideoController,
);

router.delete('/logo/:product_id', deleteLogoController);

router.put(
  '/cover/:product_id',
  multer(multerImagesConfig).single('cover'),
  validateFile,
  findSingleProductAdapter,
  updateProductCoverController,
);

router.delete('/cover/:product_id', deleteCoverController);

router.put(
  '/ebook-cover/:product_id',
  multer(multerImagesConfig).single('ebook_cover'),
  validateFile,
  findSingleProductAdapter,
  updateEbookCoverController,
);

router.delete('/ebook-cover/:product_id', deleteEbookCoverController);

router.put(
  '/certificate/:product_id',
  multer(multerImagesConfig).single('certificate'),
  validateFile,
  findSingleProductAdapter,
  uploadCertificateController,
);

router.use('/images', require('./images'));

router.put(
  '/:product_id/membership-color',
  findSingleProductAdapter,
  updateProductMembershipColorController,
);

router.use(
  '/:product_id/membership-plugins',
  findSingleProductAdapter,
  require('./membershipPlugins'),
);

router.get('/:product_id/upsell-native-offer-list', OffersUpsellList.get);

router.get('/:product_id/upsell-native-offer-list', OffersUpsellList.get);
router.use(
  '/:product_id/membership-comments',
  findSingleProductAdapter,
  require('./membershipComments'),
);

router.use(require('./membershipPageLayout'));

module.exports = router;
