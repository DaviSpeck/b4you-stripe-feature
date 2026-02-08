const express = require('express');
const {
  getAllEventsController,
  getAllIntegrationsController,
  getSellfluxEventsController,
  getAstronmembersEventsController,
} = require('../../controllers/dashboard/integrations');

const router = express.Router();

router.get('/apps', getAllIntegrationsController);
router.get('/events', getAllEventsController);
router.get('/events/sellflux', getSellfluxEventsController);
router.get('/events/astronmembers', getAstronmembersEventsController);

router.use('/activecampaign', require('./active_campaign'));

router.use('/bling', require('./integrations/bling'));
router.use('/bling-shipping', require('./integrations/bling_shipping'));
router.use('/cademi', require('./integrations/cademi'));
router.use('/enotas', require('./enotas'));
router.use('/invision', require('./integrations/invision'));
router.use('/hotzapp', require('./hotzapp'));
router.use('/hsds', require('./integrations/hsds'));
router.use('/leadlovers', require('./leadlovers'));
router.use('/mailchimp', require('./mailchimp'));
router.use('/memberkit', require('./integrations/memberkit'));
router.use('/notazz', require('./integrations/notazz'));
router.use('/omie', require('./integrations/omie'));
router.use('/sellflux', require('./integrations/sellflux'));
router.use('/voxuy', require('./voxuy'));
router.use('/webhooks', require('./webhooks'));
router.use('/astronmembers', require('./integrations/astronmembers'));
router.use('/utmify', require('./integrations/utmify'));
router.use('/arco', require('./integrations/arco'));
router.use('/frenet', require('./integrations/frenet'));
router.use('/tiny', require('./integrations/tiny'));
router.use('/zoppy', require('./zoppy'));
router.use('/Shopify', require('./integrations/Shopify'));
router.use('/Woocommerce', require('./integrations/Woocommerce'));

router.use('/ecommerce', require('./ecommerce'));

// bling b3
router.use('/bling-shipping-v3', require('./integrations/bling_shipping_v3'));

module.exports = router;
