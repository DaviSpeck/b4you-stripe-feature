const express = require('express');
const multer = require('multer');
const validateDTO = require('../../middlewares/validate-dto');
const validateFileAndBody = require('../../middlewares/validateFileAndBody');
const createModuleDTO = require('../../dto/modules/createModules');
const reorderDTO = require('../../dto/modules/reorderModules');
const updateModuleDTO = require('../../dto/modules/updateModule');
const validateImageUpload = require('../../middlewares/files/imageUpload');
const multerImagesConfig = require('../../config/multer/configs/images');
const {
  createModuleController,
  findModulesController,
  reorderModulesController,
  updateModuleController,
  deleteModuleController,
  uploadModuleCoverController,
  deleteModuleCoverController,
} = require('../../controllers/dashboard/modules');
const {
  validateCreateModule,
  findAndOrderProductModules,
  verifyModules,
  validateModule,
  validateBodyAndPrepareData,
} = require('../../middlewares/validatorsAndAdapters/modules');
const {
  isVideoProduct,
} = require('../../middlewares/validatorsAndAdapters/products');
const {
  validateFile,
} = require('../../middlewares/validatorsAndAdapters/common');

const router = express.Router();

router.post(
  '/',
  validateImageUpload,
  multer(multerImagesConfig).single('cover'),
  validateFileAndBody,
  validateDTO(createModuleDTO),
  isVideoProduct,
  validateCreateModule,
  createModuleController,
);

router.get('/', isVideoProduct, findModulesController);

router.put(
  '/reorder',
  validateDTO(reorderDTO),
  isVideoProduct,
  findAndOrderProductModules,
  verifyModules,
  reorderModulesController,
);

router.put(
  '/:module_id',
  validateDTO(updateModuleDTO),
  isVideoProduct,
  findAndOrderProductModules,
  validateModule,
  validateBodyAndPrepareData,
  updateModuleController,
);

router.delete(
  '/:module_id',
  isVideoProduct,
  findAndOrderProductModules,
  validateModule,
  deleteModuleController,
);

router.put(
  '/:module_id/cover',
  validateImageUpload,
  multer(multerImagesConfig).single('cover'),
  validateFile,
  findAndOrderProductModules,
  validateModule,
  uploadModuleCoverController,
);

router.delete(
  '/:module_id/cover',
  isVideoProduct,
  findAndOrderProductModules,
  validateModule,
  deleteModuleCoverController,
);

module.exports = router;
