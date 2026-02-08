const express = require('express');
const jwtAuth = require('../middlewares/jwt');
const { metricsProm } = require('../middlewares/prom');

const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/blocks', require('./blocks'));
router.use('/konduto', require('./konduto'));

router.use(jwtAuth);
router.use(metricsProm);

router.use('/kyc', require('./kyc'));
router.use('/metrics', require('./metrics'));
router.use('/products', require('./products'));
router.use('/students', require('./students'));
router.use('/users', require('./users'));
router.use('/sales', require('./sales'));
router.use('/reports', require('./reports'));
router.use('/onboarding', require('./onboarding'));
router.use('/logs', require('./logs'));
router.use('/market', require('./market'));
router.use('/withdrawals', require('./withdrawals'));
router.use('/blacklist', require('./blacklist'));
router.use('/notifications', require('./notifications'));
router.use('/checkout', require('./checkout'));
router.use('/award-shipments', require('./awardShipments'));
router.use('/client-wallet', require('./client-wallet'));
router.use('/creators', require('./creators'));
router.use('/backoffice', require('./backoffice'));
router.use('/notes', require('./notes'));
router.use('/cloudwatch', require('./cloudwatch'));

module.exports = router;
