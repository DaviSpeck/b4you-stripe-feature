const express = require('express');

const router = express.Router();
const productsController = require('../controllers/products');

router.get('/all', productsController.findProducts);

router.use('/affiliates', require('./affiliates'));

router.get('/market', productsController.getProductMarket);

router.put('/:productUuid/market', productsController.updateProductMarket);

router.put('/:productUuid/position', productsController.positionProductMarket);

router.put('/:productUuid/secure-email', productsController.secureEmail);

router.put(
  '/:productUuid/market/remove',
  productsController.removeProductMarket,
);

router.put(
  '/:productUuid/checkout/hide',
  productsController.removeProductCheckout,
);

router.put(
  '/:productUuid/number/update',
  productsController.updateSupportNumber,
);

router.get('/', productsController.findAllUserProducts);

router.get('/:productUuid', productsController.findSingleProduct);

router.get('/:productUuid/coproductions', productsController.findCoproductions);

router.get('/:productUuid/suppliers', productsController.findSuppliers);

router.get('/:productUuid/membership', productsController.accessMembership);

router.get('/:productUuid/pages', productsController.getProductPages);

module.exports = router;
