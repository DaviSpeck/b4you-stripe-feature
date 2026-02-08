const express = require('express');
const multer = require('multer');
const multerImagesConfig = require('../../config/multer/configs/images');
const validateImageUpload = require('../../middlewares/files/imageUpload');
const {
  deleteBannerController,
  deleteBannerMobileController,
  deleteFaviconController,
  deleteHeaderDesktopImageController,
  deleteHeaderMobileImageController,
  deleteSidebarDesktopImageController,
  updateBannerImageController,
  updateBannerMobileImageController,
  updateFaviconController,
  updateHeaderDesktopImageController,
  updateHeaderMobileImageController,
  updateSidebarDesktopImageController,
  updateSecondHeaderMobileController,
  deleteSecondHeaderMobileController,
  updateHeaderSecondaryDesktopImageController,
  deleteHeaderSecondaryDesktopImageController,
  createGeneralImageController,
  deleteGeneralImageController,
  getGeneralImageController,
  createCoverMarketImageController,
  getMarktCoverImageController,
  updateCoverCustomImageController,
  deleteCoverCustomImageController,
} = require('../../controllers/dashboard/images');

const router = express.Router();

router.put(
  '/:product_id/header-desktop',
  multer(multerImagesConfig).single('header-desktop'),
  updateHeaderDesktopImageController,
);

router.put(
  '/:product_id/header-desktop-secondary',
  multer(multerImagesConfig).single('header-desktop-secondary'),
  updateHeaderSecondaryDesktopImageController,
);

router.put(
  '/:product_id/banner',
  multer(multerImagesConfig).single('banner'),
  updateBannerImageController,
);

router.put(
  '/:product_id/banner-mobile',
  multer(multerImagesConfig).single('banner_mobile'),
  updateBannerMobileImageController,
);

router.put(
  '/:product_id/second-header-mobile',
  multer(multerImagesConfig).single('second-header-mobile'),
  updateSecondHeaderMobileController,
);

router.put(
  '/:product_id/sidebar-desktop',
  multer(multerImagesConfig).single('sidebar-desktop'),
  updateSidebarDesktopImageController,
);

router.put(
  '/:product_id/header-mobile',
  multer(multerImagesConfig).single('header-mobile'),
  updateHeaderMobileImageController,
);

router.put(
  '/:product_id/favicon',
  validateImageUpload,
  multer(multerImagesConfig).single('favicon'),
  updateFaviconController,
);

router.delete(
  '/:product_id/header-desktop',
  deleteHeaderDesktopImageController,
);

router.delete(
  '/:product_id/header-desktop-secondary',
  deleteHeaderSecondaryDesktopImageController,
);

router.delete(
  '/:product_id/sidebar-desktop',
  deleteSidebarDesktopImageController,
);

router.delete('/:product_id/header-mobile', deleteHeaderMobileImageController);

router.delete('/:product_id/favicon', deleteFaviconController);

router.delete('/:product_id/banner', deleteBannerController);

router.delete('/:product_id/banner-mobile', deleteBannerMobileController);

router.delete(
  '/:product_id/second-header-mobile',
  deleteSecondHeaderMobileController,
);

router.put(
  '/:product_id/general',
  multer(multerImagesConfig).single('general'),
  createGeneralImageController,
);

router.put(
  '/:product_id/market-cover',
  multer(multerImagesConfig).single('general'),
  createCoverMarketImageController,
);

router.delete('/:product_id/general/:uuid', deleteGeneralImageController);

router.get('/:product_id/general', getGeneralImageController);

router.get('/:product_id/market-cover', getMarktCoverImageController);

router.put(
  '/:product_id/cover-custom',
  multer(multerImagesConfig).single('cover_custom'),
  updateCoverCustomImageController,
);

router.delete(
  '/:product_id/cover-custom',
  deleteCoverCustomImageController,
);

module.exports = router;
