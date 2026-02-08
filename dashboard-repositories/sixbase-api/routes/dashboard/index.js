const express = require('express');

const router = express.Router();
const auth = require('../../middlewares/auth');
const collaborationPermission = require('../../middlewares/permissions');
const collaboratorsActivity = require('../../middlewares/collaboratorsActivity');

router.use(
  '/callcenter',
  auth,
  collaborationPermission('sales'),
  require('./callcenter'),
);

router.use(
  '/affiliates',
  auth,
  collaborationPermission('affiliates'),
  collaboratorsActivity,
  require('./affiliates'),
);

router.use('/auth', require('./auth'));

router.use(
  '/balance',
  auth,
  collaborationPermission('balance'),
  collaboratorsActivity,
  require('./balance'),
);

router.use('/collaborators', auth, require('./collaborators'));

router.use(
  '/coproduction',
  auth,
  collaborationPermission('coproduction'),
  collaboratorsActivity,
  require('./coproductions'),
);

router.use(
  '/integrations',
  auth,
  collaborationPermission('integrations'),
  collaboratorsActivity,
  require('./integrations'),
);

router.use(
  '/market',
  auth,
  collaborationPermission('market'),
  collaboratorsActivity,
  require('./market'),
);

router.use(
  '/metrics',
  auth,
  collaborationPermission('metrics'),
  collaboratorsActivity,
  require('./metrics'),
);

router.use('/notifications', auth, require('./notifications'));

router.use('/integration-notifications', auth, require('./integrationNotifications'));

router.use('/pixels_types', auth, require('./pixels_types'));

router.use(
  '/products',
  auth,
  collaborationPermission(['products', 'affiliates']),
  collaboratorsActivity,
  require('./products'),
);

router.use(
  '/sales',
  auth,
  collaborationPermission('sales'),
  collaboratorsActivity,
  require('./sales'),
);

router.use(
  '/subscriptions',
  auth,
  collaborationPermission('subscriptions'),
  collaboratorsActivity,
  require('./subscriptions'),
);
router.use('/users', require('./users'));

router.use(
  '/withdrawals',
  auth,
  collaborationPermission('withdrawals'),
  collaboratorsActivity,
  require('./withdrawals'),
);

router.use('/questions', auth, require('./questions'));

router.use(
  '/invoices',
  auth,
  collaborationPermission('invoices'),
  collaboratorsActivity,
  require('./invoices'),
);

router.use('/cart', auth, require('./cart'));

router.use('/files', auth, require('./files'));

router.use('/banks', auth, require('./banks'));

router.use('/community', auth, require('./circles'));

router.use('/referral', auth, require('./referral'));

router.use('/suppliers', auth, require('./suppliersMain'));

router.use('/managers', auth, require('./managersMain'));

router.use('/checkout', auth, require('./checkout'));

router.use('/coupons', auth, require('./coupons'));

router.use('/onesignal', auth, require('./onesignal'));

router.use('/offers', auth, require('./offers'));

router.use('/upsell-native-product', auth, require('./upsellNative/product'));

router.use('/upsell-native-offer', auth, require('./upsellNative/offer'));
router.use(
  "/short_links",
  auth,
  collaborationPermission("market"),
  collaboratorsActivity,
  require("./short_links")
);

router.use('/onboarding', auth, require('../onboarding'));

module.exports = router;
