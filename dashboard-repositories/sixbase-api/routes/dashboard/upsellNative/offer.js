const express = require('express');
const multer = require('multer');
const multerImagesConfig = require('../../../config/multer/configs/images');
const {
  UpsellNativeOfferController,
} = require('../../../controllers/dashboard/upsell_native_offer');

const router = express.Router();

router.get('/:offer_id', UpsellNativeOfferController.get);

router.get('/:offer_id/check', UpsellNativeOfferController.getCheck);

router.post('/:offer_id/create', UpsellNativeOfferController.create);

router.patch('/:offer_id', UpsellNativeOfferController.update);

router.patch('/:offer_id/embed', UpsellNativeOfferController.updateEmbed);

router.put(
  '/:offer_id/title-image',
  multer(multerImagesConfig).single('title_image'),
  UpsellNativeOfferController.updateTitleImage,
);

router.put(
  '/:offer_id/image-background-image-desktop',
  multer(multerImagesConfig).single('background_image_desktop'),
  UpsellNativeOfferController.updateBackgroundImageDesktop,
);

router.put(
  '/:offer_id/image-background-image-mobile',
  multer(multerImagesConfig).single('background_image_mobile'),
  UpsellNativeOfferController.updateBackgroundImageMobile,
);

router.put(
  '/:offer_id/image',
  multer(multerImagesConfig).single('media_url'),
  UpsellNativeOfferController.updateImage,
);

router.delete('/:offer_id/inactive', UpsellNativeOfferController.remove);

router.delete('/:offer_id/image', UpsellNativeOfferController.removeImage);

router.delete('/:offer_id/embed', UpsellNativeOfferController.removeEmbed);

router.delete(
  '/:offer_id/title-image',
  UpsellNativeOfferController.removeTitleImage,
);

router.delete(
  '/:offer_id/image-background-image-desktop',
  UpsellNativeOfferController.removeBackgroundImageDesktop,
);

router.delete(
  '/:offer_id/image-background-image-mobile',
  UpsellNativeOfferController.removeBackgroundImageMobile,
);

module.exports = router;
