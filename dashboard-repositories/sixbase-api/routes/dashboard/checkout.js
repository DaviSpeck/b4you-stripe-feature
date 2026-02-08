const { Router } = require('express');
const validateDto = require('../../middlewares/validate-dto');
const abandonedDTO = require('../../dto/checkout/abandoned');
const {
  listCheckoutAbandonedController,
  exportCheckoutAbondoned,
  getTotalOffersCheckoutAbandonedController,
} = require('../../controllers/dashboard/checkout');

const router = Router();

router.get(
  '/abandoned',
  validateDto(abandonedDTO, 'query'),
  listCheckoutAbandonedController,
);

router.get(
  '/abandoned/total',
  validateDto(abandonedDTO, 'query'),
  getTotalOffersCheckoutAbandonedController,
);

router.get('/abandoned/export', exportCheckoutAbondoned);

module.exports = router;
