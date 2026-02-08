const express = require('express');
const validateDto = require('../../middlewares/validate-dto');
const {
  validateGoogleAnalytics,
} = require('../../middlewares/validatorsAndAdapters/pixels');
const {
  controllerCreatePixelFacebook,
  controllerCreatePixelGoogleAds,
  controllerCreatePixelGoogleAnalytics,
  controllerCreatePixelOutbrain,
  controllerCreatePixelTaboola,
  controllerCreatePixelTikTok,
  controllerDeletePixel,
  controllerFindPixelUserProduct,
  controllerUpdateFacebook,
  controllerUpdateGoogleAds,
  controllerUpdateGoogleAnalytics,
  controllerUpdateOutbrain,
  controllerUpdateTaboola,
  controllerUpdateTikTok,
  controllerCreatePixelKwai,
  controllerUpdateKwai,
  controllerUpdatePinterest,
  controllerCreatePixelPinterest,
} = require('../../controllers/dashboard/pixels');
const createFacebookDto = require('../../dto/pixels/createFacebook');
const createGoogleAds = require('../../dto/pixels/createGoogleAds');
const createGoogleAnalytic = require('../../dto/pixels/createGoogleAnalytics');
const createPinterest = require('../../dto/pixels/createPinterest');
const createOutbrain = require('../../dto/pixels/createOutbrain');
const createTaboola = require('../../dto/pixels/createTaboola');
const createTikTok = require('../../dto/pixels/createTikTok');
const createKwai = require('../../dto/pixels/createKwai');
const updateFacebookDto = require('../../dto/pixels/updateFacebook');
const updateGoogleAdsDto = require('../../dto/pixels/updateGoogleAds');
const updateGoogleAnalytcs = require('../../dto/pixels/updateGoogleAnalytics');
const updatePinterest = require('../../dto/pixels/updatePinterest');
const updateOutbrain = require('../../dto/pixels/updateOutbrain');
const updateTaboola = require('../../dto/pixels/updateTaboola');
const updateTikTok = require('../../dto/pixels/updateTikTok');
const updateKwai = require('../../dto/pixels/updateKwai');
const updateGoogleGTM = require('../../dto/pixels/updateGoogleGTM');

const router = express.Router();

router.get('/', controllerFindPixelUserProduct);

router.post(
  '/facebook',
  validateDto(createFacebookDto),
  controllerCreatePixelFacebook,
);

router.post(
  '/google-analytics',
  validateDto(createGoogleAnalytic),
  validateGoogleAnalytics,
  controllerCreatePixelGoogleAnalytics,
);

router.post(
  '/pinterest',
  validateDto(createPinterest),
  controllerCreatePixelPinterest,
);

router.post(
  '/google-tag-manager',
  validateDto(updateGoogleGTM),
  controllerCreatePixelGoogleAds,
);

router.post(
  '/google-ads',
  validateDto(createGoogleAds),
  controllerCreatePixelGoogleAds,
);

router.post(
  '/taboola',
  validateDto(createTaboola),
  controllerCreatePixelTaboola,
);

router.post(
  '/outbrain',
  validateDto(createOutbrain),
  controllerCreatePixelOutbrain,
);

router.post('/tiktok', validateDto(createTikTok), controllerCreatePixelTikTok);

router.delete('/:pixel_uuid', controllerDeletePixel);

router.put(
  '/facebook/:pixel_uuid',
  validateDto(updateFacebookDto),
  controllerUpdateFacebook,
);

router.put(
  '/google-analytics/:pixel_uuid',
  validateDto(updateGoogleAnalytcs),
  controllerUpdateGoogleAnalytics,
);

router.put(
  '/pinterest/:pixel_uuid',
  validateDto(updatePinterest),
  controllerUpdatePinterest,
);

router.put(
  '/google-ads/:pixel_uuid',
  validateDto(updateGoogleAdsDto),
  controllerUpdateGoogleAds,
);

router.put(
  '/google-tag-manager/:pixel_uuid',
  validateDto(updateGoogleGTM),
  controllerUpdateGoogleAds,
);

router.put(
  '/taboola/:pixel_uuid',
  validateDto(updateTaboola),
  controllerUpdateTaboola,
);

router.put(
  '/outbrain/:pixel_uuid',
  validateDto(updateOutbrain),
  controllerUpdateOutbrain,
);

router.put(
  '/tiktok/:pixel_uuid',
  validateDto(updateTikTok),
  controllerUpdateTikTok,
);

router.post('/kwai', validateDto(createKwai), controllerCreatePixelKwai);

router.put('/kwai/:pixel_uuid', validateDto(updateKwai), controllerUpdateKwai);

module.exports = router;
