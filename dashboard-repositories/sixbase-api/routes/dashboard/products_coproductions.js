const express = require('express');
const {
  validateData,
  validateUser,
} = require('../../middlewares/validatorsAndAdapters/coproductions');
const {
  cancelCoproductionController,
  getCoproductorController,
  getCoproductionsControllers,
  createCoproducerInviteController,
  allowAccessCoproductionController,
  updateCoproductionController,
} = require('../../controllers/dashboard/coproductions');
const validateDTO = require('../../middlewares/validate-dto');
const createCoproducerDTO = require('../../dto/coproductions/createCoproduction');
const allowAccessDTO = require('../../dto/affiliates/allow_access');
const updateCoproducerCommissionDTO = require('../../dto/coproductions/updateCommission');

const router = express.Router();

router.get(
  '/productor/:data',
  validateData,
  validateUser,
  getCoproductorController,
);

router.post(
  '/invite',
  validateDTO(createCoproducerDTO),
  createCoproducerInviteController,
);

router.post('/cancel/:coproduction_uuid', cancelCoproductionController);

router.get('/', getCoproductionsControllers);

router.put(
  '/:coproducer_uuid',
  validateDTO(updateCoproducerCommissionDTO),
  updateCoproductionController,
);

router.put(
  '/allow/:id_coproductor',
  validateDTO(allowAccessDTO),
  allowAccessCoproductionController,
);

module.exports = router;
