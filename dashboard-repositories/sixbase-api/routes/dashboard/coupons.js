const express = require('express');
const validateDTO = require('../../middlewares/validate-dto');
const createDTO = require('../../dto/coupons/create');
const updateDTO = require('../../dto/coupons/update');
const CouponsController = require('../../controllers/dashboard/coupons');

const router = express.Router();

router.get('/', CouponsController.getProductCoupons);

router.get('/offers', CouponsController.getProductOffers);

router.get('/ranking', CouponsController.getRanking);

router.get('/ranking/export', CouponsController.getRankingExport);

router.post(
  '/',
  validateDTO(createDTO),
  CouponsController.createProductCoupons,
);

router.delete('/', CouponsController.deleteManyProductCoupons);

router.delete('/:uuid_coupon', CouponsController.deleteProductCoupons);

router.put(
  '/:uuid_coupon',
  validateDTO(updateDTO),
  CouponsController.updateProductCoupons,
);

router.get('/affiliate', CouponsController.getAffiliate);

module.exports = router;
