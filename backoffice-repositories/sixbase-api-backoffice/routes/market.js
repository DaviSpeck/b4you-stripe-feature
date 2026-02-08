const express = require('express');

const router = express.Router();

const marketController = require('../controllers/market');

router.get('/', marketController.get);

router.get('/all', marketController.getAll);

router.get('/recommended', marketController.getRecommended);
router.put('/recommended/reorder', marketController.reorderRecommended);

router.get('/:id_product', marketController.details);

router.post('/approve/:id', marketController.approve);

router.post('/reprove/:id', marketController.reprove);

router.get('/banners/:filename', marketController.getUrlLinkBanner);

router.get('/images/banner', marketController.getBanners);

router.post('/banners', marketController.postBanner);

router.put('/banners/order', marketController.updateBannerOrder);

router.put('/banners/:uuid', marketController.updateBanner);

router.delete('/banners/:uuid', marketController.deleteBanner);

module.exports = router;
