const express = require('express');
const validateDTO = require('../../middlewares/validate-dto');
const createGalleryDTO = require('../../dto/gallery/createGallery');
const createSingleVideoGalleryDTO = require('../../dto/gallery/createSingleGallery');
const {
  deleteVideoFromGalleryController,
  findProductGalleryController,
  removeVideoFromGalleryController,
  updateVideoFromGalleryController,
  uploadSingleVideoOnGalleryController,
  uploadVideosOnGalleryController,
  confirmVideoUploadController,
} = require('../../controllers/dashboard/product_gallery');

const {
  findProductLessonsController,
} = require('../../controllers/dashboard/lessons');

const router = express.Router();

router.get('/', findProductGalleryController);

router.get('/pending', findProductGalleryController);

router.get('/lessons', findProductLessonsController);

router.post(
  '/',
  validateDTO(createGalleryDTO),
  uploadVideosOnGalleryController,
);

router.post(
  '/single',
  validateDTO(createSingleVideoGalleryDTO),
  uploadSingleVideoOnGalleryController,
);

router.put('/confirm', confirmVideoUploadController);

router.delete('/:video_id', deleteVideoFromGalleryController);

router.put('/:video_id', updateVideoFromGalleryController);

router.delete('/:video_id/reset', removeVideoFromGalleryController);

module.exports = router;
