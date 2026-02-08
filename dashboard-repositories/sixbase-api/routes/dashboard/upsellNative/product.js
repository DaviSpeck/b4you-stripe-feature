const express = require('express');
const multer = require('multer');
const multerImagesConfig = require('../../../config/multer/configs/images');
const {
  UpsellNativeProductController,
} = require('../../../controllers/dashboard/upsell_native_product');

const router = express.Router();

router.get('/:product_id', UpsellNativeProductController.get);

router.post('/:product_id/create', UpsellNativeProductController.create);

router.patch('/:product_id', UpsellNativeProductController.update);

router.patch('/:product_id/embed', UpsellNativeProductController.updateEmbed);

router.put(
  '/:product_id/title-image',
  multer(multerImagesConfig).single('title_image'),
  UpsellNativeProductController.updateTitleImage,
);

router.put(
  '/:product_id/image-background-image-desktop',
  multer(multerImagesConfig).single('background_image_desktop'),
  UpsellNativeProductController.updateBackgroundImageDesktop,
);

router.put(
  '/:product_id/image-background-image-mobile',
  multer(multerImagesConfig).single('background_image_mobile'),
  UpsellNativeProductController.updateBackgroundImageMobile,
);

router.put(
  '/:product_id/image',
  multer(multerImagesConfig).single('media_url'),
  UpsellNativeProductController.updateImage,
);

router.delete('/:product_id/inactive', UpsellNativeProductController.remove);

router.delete('/:product_id/image', UpsellNativeProductController.removeImage);

router.delete(
  '/:product_id/title-image',
  UpsellNativeProductController.removeTitleImage,
);

router.delete(
  '/:product_id/image-background-image-desktop',
  UpsellNativeProductController.removeBackgroundImageDesktop,
);

router.delete(
  '/:product_id/image-background-image-mobile',
  UpsellNativeProductController.removeBackgroundImageMobile,
);

module.exports = router;
