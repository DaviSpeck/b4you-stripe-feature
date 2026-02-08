const router = require('express').Router();
const woocommerceController = require('../../../controllers/dashboard/integrations/Woocommerce');

router.get('/', woocommerceController.list);

router.post('/', woocommerceController.create);

router.delete('/', woocommerceController.delete);

module.exports = router;
