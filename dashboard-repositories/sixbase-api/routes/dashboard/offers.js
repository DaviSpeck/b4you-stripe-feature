const express = require('express');
const multer = require('multer');
const validateDTO = require('../../middlewares/validate-dto');
const validateCreateOfferDTO = require('../../dto/offers/createOffer');
const validateUpdateOfferDTO = require('../../dto/offers/updateOffer');
const validateOfferVideoDTO = require('../../dto/offers/updateVideo');
const validateUpdateOrderBumpDTO = require('../../dto/order_bumps/updateOrderBump');
const validateAllowAffiliateDTO = require('../../dto/offers/allowAffiliate');
const validateCreateOrderBumpDTO = require('../../dto/order_bumps/createOrderBump');
const linkAndUnlinkPlanDTO = require('../../dto/plans/linkPlan');
const multerImagesConfig = require('../../config/multer/configs/images');
const {
  validateFile,
} = require('../../middlewares/validatorsAndAdapters/common');

const router = express.Router();
const {
  validateCreateOffer,
  isThereAnOffer,
  validateUpdateOffer,
  validateClassroom,
  allowAffiliateDataToUpdate,
} = require('../../middlewares/validatorsAndAdapters/offers');
const {
  createOfferController,
  duplicateOfferController,
  updateOfferController,
  updateOfferImageController,
  findOffersController,
  findOffersPaginatedController,
  findOfferClassroomsController,
  deleteOfferController,
  getOfferInstallmentsController,
  findProductsThatArentOrderBumpsController,
  findProductOffersController,
  updateOfferImageMobileController,
  updateOfferImageMobileSecondaryController,
  updateOfferImageSidebarController,
  deleteOfferImageController,
  updateOfferImageSecondaryController,
  updateOfferVideoController,
  deleteOfferVideoController,
  findOffersBackRedirectController,
  updateOffersBackRedirectController,
  updateOfferImage3StepsController,
  updateOfferImageOfferImageController,
  findOfferByUuidController,
} = require('../../controllers/dashboard/offers');
const {
  updateOrderBumpPriceController,
  deleteOrderBumpController,
  createOrderBumpController,
  updateOrderBumpImageController,
  deleteOrderBumpImageController,
} = require('../../controllers/dashboard/order_bump');
const {
  linkPlanController,
  unlinkPlanController,
} = require('../../controllers/dashboard/plans');
const {
  isThereAnOrderBump,
  validateUpdateOrderBump,
} = require('../../middlewares/validatorsAndAdapters/order_bump');
const {
  validateLinkPlan,
  validateUnlinkPlan,
} = require('../../middlewares/validatorsAndAdapters/plans');

router.get('/', findOffersController);

router.get('/:offer_uuid/by-uuid', findOfferByUuidController);

router.get('/paginated', findOffersPaginatedController);

router.get('/delivery-url', async (_req, res) =>
  res
    .status(200)
    .send({ url: `${process.env.URL_SIXBASE_CHECKOUT}/compra-realizada` }),
);

router.use(
  '/:offer_id/suppliers',
  async (req, _res, next) => {
    req.offer_id = req.params.offer_id;
    return next();
  },
  require('./suppliers'),
);

router.get('/classrooms', findOfferClassroomsController);

router.post(
  '/',
  validateDTO(validateCreateOfferDTO),
  validateCreateOffer,
  createOfferController,
);

router.post('/duplicate/:offer_id', duplicateOfferController);

router.put(
  `/:offer_id/video`,
  validateDTO(validateOfferVideoDTO),
  isThereAnOffer,
  updateOfferVideoController,
);

router.delete(`/:offer_id/video`, isThereAnOffer, deleteOfferVideoController);

router.put(
  '/:offer_id',
  validateDTO(validateUpdateOfferDTO),
  isThereAnOffer,
  validateUpdateOffer,
  validateClassroom,
  updateOfferController,
);

router.put(
  '/:offer_id/banner',
  multer(multerImagesConfig).single('banner'),
  validateFile,
  isThereAnOffer,
  updateOfferImageController,
);

router.put(
  '/:offer_id/banner-secondary',
  multer(multerImagesConfig).single('banner_secondary'),
  validateFile,
  isThereAnOffer,
  updateOfferImageSecondaryController,
);

router.put(
  '/:offer_id/banner-mobile',
  multer(multerImagesConfig).single('banner_mobile'),
  validateFile,
  isThereAnOffer,
  updateOfferImageMobileController,
);

router.put(
  '/:offer_id/banner-mobile-secondary',
  multer(multerImagesConfig).single('banner_mobile_secondary'),
  validateFile,
  isThereAnOffer,
  updateOfferImageMobileSecondaryController,
);

router.put(
  '/:offer_id/offer_image_alternative',
  multer(multerImagesConfig).single('offer_image'),
  validateFile,
  isThereAnOffer,
  updateOfferImageOfferImageController,
);

router.put(
  '/:offer_id/sidebar',
  multer(multerImagesConfig).single('sidebar'),
  validateFile,
  isThereAnOffer,
  updateOfferImageSidebarController,
);

router.put(
  '/:offer_id/offer_image',
  multer(multerImagesConfig).single('offer_image'),
  validateFile,
  isThereAnOffer,
  updateOfferImage3StepsController,
);

router.delete('/:offer_id/:field', isThereAnOffer, deleteOfferImageController);

router.post(
  '/:offer_id',
  validateDTO(validateCreateOrderBumpDTO),
  isThereAnOffer,
  createOrderBumpController,
);

router.put(
  '/:offer_id/:order_bump_id/cover',
  multer(multerImagesConfig).single('cover'),
  validateFile,
  isThereAnOffer,
  isThereAnOrderBump,
  updateOrderBumpImageController,
);

router.delete(
  '/:offer_id/:order_bump_id/cover',
  isThereAnOffer,
  isThereAnOrderBump,
  deleteOrderBumpImageController,
);

router.put(
  '/:offer_id/:order_bump_id',
  isThereAnOffer,
  validateDTO(validateUpdateOrderBumpDTO),
  isThereAnOrderBump,
  validateUpdateOrderBump,
  updateOrderBumpPriceController,
);

router.get('/:offer_id/order-bumps', findProductsThatArentOrderBumpsController);

router.get('/:offer_id/select-offers', findProductOffersController);

router.get('/:offer_id/back-redirect', findOffersBackRedirectController);

router.put('/:offer_id/back/redirect', updateOffersBackRedirectController);

router.delete(
  '/:offer_id/:order_bump_id/ob',
  isThereAnOffer,
  isThereAnOrderBump,
  deleteOrderBumpController,
);

router.put(
  '/:offer_id/affiliate/:allow',
  isThereAnOffer,
  validateDTO(validateAllowAffiliateDTO, 'params'),
  allowAffiliateDataToUpdate,
  updateOfferController,
);

router.delete('/:offer_id', isThereAnOffer, deleteOfferController);

router.post(
  '/:offer_id/plan/link/:plan_id',
  isThereAnOffer,
  validateDTO(linkAndUnlinkPlanDTO, 'params'),
  validateLinkPlan,
  linkPlanController,
);

router.delete(
  '/:offer_id/plan/unlink/:plan_id',
  isThereAnOffer,
  validateDTO(linkAndUnlinkPlanDTO, 'params'),
  validateUnlinkPlan,
  unlinkPlanController,
);

router.get(
  '/:offer_id/installments',
  isThereAnOffer,
  getOfferInstallmentsController,
);

module.exports = router;
