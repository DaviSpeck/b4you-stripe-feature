const express = require('express');
const {
  rejectInviteController,
  acceptInviteController,
  getCoproductionsInvitesController,
  cancelActiveCoproductionController,
} = require('../../controllers/dashboard/coproductions');
const {
  validateProductCoproductor,
} = require('../../middlewares/validatorsAndAdapters/products');
const {
  validateProductInvite,
  validateProductInviteActive,
} = require('../../middlewares/validatorsAndAdapters/coproductions');

const router = express.Router();

router.post(
  '/:product_id/reject',
  validateProductCoproductor,
  validateProductInvite,
  rejectInviteController,
);

router.post(
  '/:product_id/accept',
  validateProductCoproductor,
  validateProductInvite,
  acceptInviteController,
);

router.post(
  '/:product_id/cancel',
  validateProductCoproductor,
  validateProductInviteActive,
  cancelActiveCoproductionController,
);

router.get('/', getCoproductionsInvitesController);

module.exports = router;
