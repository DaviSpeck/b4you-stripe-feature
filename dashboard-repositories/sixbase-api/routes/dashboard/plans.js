const express = require('express');
const validateDTO = require('../../middlewares/validate-dto');
const validateCreatePlanDTO = require('../../dto/plans/createPlan');
const {
  createPlanController,
  findProductPlansController,
  deletePlanController,
  findFrequenciesController,
  findPlansThatOfferDoesntHaveController,
} = require('../../controllers/dashboard/plans');

const router = express.Router();

router.post('/', validateDTO(validateCreatePlanDTO), createPlanController);

router.get('/', findProductPlansController);

router.get('/frequencies', findFrequenciesController);

router.delete('/:plan_id', deletePlanController);

router.get('/:offer_id', findPlansThatOfferDoesntHaveController);

module.exports = router;
