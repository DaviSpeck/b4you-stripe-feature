const express = require('express');
const validateDTO = require('../middlewares/validate-dto');
const initiateCart = require('../dto/cart/initiateCart');
const {
  initiateCartController,
  findCardController,
  fbPixelController,
} = require('../controllers/cart');

const router = express.Router();

router.post('/initiate', validateDTO(initiateCart), initiateCartController);

router.get('/:card_id', findCardController);

router.post('/pixel', fbPixelController);

module.exports = router;
