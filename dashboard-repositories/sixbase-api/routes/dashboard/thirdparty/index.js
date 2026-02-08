const router = require('express').Router();
const ThirdParty = require('../../../controllers/dashboard/thirdparty');
const login = require('../../../dto/auth/login');
const createUser = require('../../../dto/users/createUser');
const createWithdrawal = require('../../../dto/withdrawals/createWithdrawal');
const validateDto = require('../../../middlewares/validate-dto');
const { validateAuth } = require('../../../middlewares/thirdparty');
const checkIfUserExists = require('../../../dto/thirdparty/checkIfUserExists');
const MarketController = require('../../../controllers/dashboard/market');
const {
  findSingleProductMarketAdapter,
} = require('../../../middlewares/validatorsAndAdapters/products');
const {
  findProductAffiliateSettingsAdapter,
} = require('../../../middlewares/validatorsAndAdapters/affiliate_settings');
const {
  createProductAffiliateController,
  getProductAffiliateMarketController,
} = require('../../../controllers/dashboard/affiliates');

router.post('/create', validateDto(createUser), ThirdParty.createUser);

router.post('/login', validateDto(login), ThirdParty.login);

router.get('/balance', validateAuth, ThirdParty.getBalance);

router.post(
  '/withdrawal',
  validateAuth,
  validateDto(createWithdrawal),
  ThirdParty.createWithdrawal,
);

router.post(
  '/affiliate/:product_id',
  validateAuth,
  ThirdParty.validateAffiliate,
  createProductAffiliateController,
);

router.get(
  '/check',
  validateDto(checkIfUserExists, 'query'),
  ThirdParty.validateUser,
);

router.get('/links/:uuid', ThirdParty.getAffiliateLinks);

router.get('/market/recents', MarketController.getRecents);

router.get('/market/top', MarketController.getTop);

router.get('/market/recommended', MarketController.getRecommended);

router.get('/market/banners', MarketController.getBanners);

router.get(
  '/market/:product_id',
  validateAuth,
  findSingleProductMarketAdapter,
  findProductAffiliateSettingsAdapter,
  getProductAffiliateMarketController,
);

module.exports = router;
