const router = require('express').Router();
const shopifyController = require('../../../controllers/dashboard/integrations/Shopify');

router.get('/', shopifyController.list);

router.post('/', shopifyController.create);

router.delete('/', shopifyController.delete);

module.exports = router;
