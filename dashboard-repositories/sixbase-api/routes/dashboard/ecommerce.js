const router = require('express').Router();
const multer = require('multer');
const multerImagesConfig = require('../../config/multer/configs/images');
const {
  validateFile,
} = require('../../middlewares/validatorsAndAdapters/common');
const ecommerceController = require('../../controllers/dashboard/ecommerce');

// Shop integrations CRUD
router.get('/shops', ecommerceController.listShops);
router.get('/shops/:uuid', ecommerceController.getShop);
router.post('/shops', ecommerceController.createShop);
router.put('/shops/:uuid', ecommerceController.updateShop);
router.delete('/shops/:uuid', ecommerceController.deleteShop);

// Shopify catalog (incremental from cart data) and reports
router.get('/shops/:uuid/catalog', ecommerceController.listCatalog);
router.get(
  '/shops/:uuid/catalog/reports',
  ecommerceController.getCatalogReports,
);

// Order Bumps (Product-level, applies to all offers)
router.get('/shops/:uuid/bumps', ecommerceController.listBumps);
router.post('/shops/:uuid/bumps', ecommerceController.createBump);
router.put('/shops/:uuid/bumps/:bumpId', ecommerceController.updateBump);
router.delete('/shops/:uuid/bumps/:bumpId', ecommerceController.deleteBump);
router.put(
  '/shops/:uuid/bumps/:bumpId/cover',
  multer(multerImagesConfig).single('cover'),
  validateFile,
  ecommerceController.uploadBumpCover,
);
router.delete(
  '/shops/:uuid/bumps/:bumpId/cover',
  ecommerceController.deleteBumpCover,
);

module.exports = router;
