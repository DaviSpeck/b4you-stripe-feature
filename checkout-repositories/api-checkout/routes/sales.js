const express = require('express');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const corsConfig = require('../config/cors');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();
const validateDTO = require('../middlewares/validate-dto');
const validateSalesCardDTO = require('../dto/sales/createSaleCreditCard');
const validateSalesPixDTO = require('../dto/sales/createSalePix');
const validateSalesSubscriptionDTO = require('../dto/sales/createSubscriptions');
const validateUpsellDTO = require('../dto/sales/upsell');
const renewDTO = require('../dto/sales/renew');
const eventMiddleware = require('../middlewares/event-session-id');
const antifraud = require('../middlewares/antifraud');
const blacklist = require('../middlewares/blacklist');

const {
  createSaleCardController,
  createSalePixController,
  createSaleBilletController,
  createSubscriptionController,
  createUpsellController,
  salePixStatusController,
  saleBilletStatusController,
  renewSubscriptionController,
  salePixInfoController,
  shopifyNotificationController,
} = require('../controllers/checkout/sales');
const { getRequestDomain } = require('../utils/getRequestDomain');

router.post(
  '/process-upsell',
  validateDTO(validateUpsellDTO),
  createUpsellController,
);

router.use(corsConfig);

router.post('/shopifyNotifications', shopifyNotificationController);

router.use(eventMiddleware);

router.post('/renew', validateDTO(renewDTO), renewSubscriptionController);

router.post('/pix/status', salePixStatusController);

router.get('/pix/info/:saleItemUuid', salePixInfoController);

router.use(async (req, res, next) => {
  try {
    if (process.env.ENVIRONMENT === 'PRODUCTION') {
      const { token } = req.body;

      if (!token) {
        return res.status(400).send({
          message: 'Captcha token ausente',
        });
      }

      const requestDomain = getRequestDomain(req);

      const turnstileKey2Domains = [
        'pay.b4you.com.br',
        'seguro.lummibrazil.com.br',
        'seguro.lipomonster.com.br',
        'checkout.avenaplus.com.br',
        'seguro.usebearry.com.br',
        'seguro.nutriccionforlife.com.br',
        'seguro.nandaintimus.com.br',
        'seguro.sejaziva.com.br',
        'pagamento.sejaziva.com.br',
      ];

      const isTurnstileKey2Domain = turnstileKey2Domains.some((domain) =>
        requestDomain.includes(domain),
      );

      const secret = isTurnstileKey2Domain
        ? process.env.TURNSTILE_SECRET_KEY_2
        : process.env.TURNSTILE_SECRET_KEY;

      const response = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          secret,
          response: token,
          remoteip: req.ip,
        },
      );

      const { data } = response;

      if (data.success) {
        return next();
      }

      return res.status(400).send({
        message: 'Navegador não validado no captcha',
        errorCodes: data['error-codes'],
      });
    }

    return next();
  } catch (error) {
    return res.status(400).send({
      message: 'Erro ao validar captcha',
    });
  }
});

router.post(
  '/subscriptions',
  limiter,
  validateDTO(validateSalesSubscriptionDTO),
  createSubscriptionController,
);

router.post(
  '/card',
  limiter,
  validateDTO(validateSalesCardDTO),
  antifraud,
  blacklist,
  createSaleCardController,
);

router.post('/pix', validateDTO(validateSalesPixDTO), createSalePixController);

router.post(
  '/billet',
  validateDTO(validateSalesPixDTO),
  createSaleBilletController,
);

router.post('/billet/status', saleBilletStatusController);

module.exports = router;
