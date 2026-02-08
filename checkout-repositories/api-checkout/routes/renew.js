const { Router } = require('express');

const router = Router();

const renewControllers = require('../controllers/checkout/renew');

router.get('/:subscription_id', renewControllers.getSubscription);

module.exports = router;
