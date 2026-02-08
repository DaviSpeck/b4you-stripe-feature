const express = require('express');

const router = express.Router();

router.use('/payments', require('./payments'));
router.use('/withdrawals', require('./withdrawals'));
router.use('/refunds', require('./refunds'));
// router.use('/card-verification', require('./card_verification'));
router.use('/chargeback', require('./card_verification'));
router.use('/pagarme', require('./pagarme'));
router.use('/tracking', require('./tracking'));

module.exports = router;
