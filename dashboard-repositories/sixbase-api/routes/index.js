const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const Cache = require('../config/Cache');
const session = require('../config/session');
const { metricsProm } = require('../middlewares/prom');
const { validateThirdPartyAuth } = require('../middlewares/thirdparty');

const router = express.Router();

router.use('/callbacks', require('./callbacks'));
router.use(
  '/thirdparty',
  validateThirdPartyAuth,
  require('./dashboard/thirdparty/index'),
);


router.use(session);
router.use(metricsProm);

router.use('/dashboard', require('./dashboard'));
router.use('/membership', require('./membership'));
router.use('/refunds', require('./refunds'));
router.use('/product', require('./product'));
router.use('/sales', require('./sales'));
router.use('/referral', require('./referral'));
router.use('/backoffice', require('./backoffice'));
router.use('/manager', require('./managers'));
router.use('/marketing', require('./marketing'));
router.use('/rankings', require('./rankings'));
router.use('/redirect', require('./redirect'));

router.get('/appv2', async (req, res) => {
  const external_id = await Cache.get(req.query.device_id);
  return res.send({ external_id });
});

router.post('/errors/logs', async (req, res) => {
  const { body } = req;
  try {
    // eslint-disable-next-line
    console.log('ERROR FRONTEND DASHBOARD/MEMBERSHIP', JSON.stringify(body));
    return res.sendStatus(200);
  } catch (error) {
    // eslint-disable-next-line
    console.log(error);
    return res.status(200).send([]);
  }
});

router.get('/install', async (req, res) => {
  const {
    shop,
    hmac,
    code,
    client_id,
    client_secret,
  } = req.query;

  if (!shop || !hmac || !code || !client_id || !client_secret) {
    return res.status(400).send('Missing required OAuth parameters');
  }


  const query = { ...req.query };
  delete query.hmac;
  delete query.signature;

  const message = Object.keys(query)
    .sort()
    .map(
      (key) =>
        `${key}=${
          Array.isArray(query[key])
            ? query[key].join(',')
            : query[key]
        }`
    )
    .join('&');

  const generatedHmac = crypto
    .createHmac('sha256', client_secret) 
    .update(message)
    .digest('hex');

  if (generatedHmac !== hmac) {
    return res.status(403).send('HMAC validation failed');
  }

  try {
    const tokenResponse = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id,       
        client_secret,   
        code,
      }
    );

    const { access_token, scope } = tokenResponse.data;

    console.log('✅ Shopify Admin Token obtido');
    console.log('Shop:', shop);
    console.log('Client ID:', client_id);
    console.log('Scopes:', scope);
    console.log('Access Token:', access_token);

    return res.status(200).send('App instalado com sucesso. Veja o console.');
  } catch (error) {
    console.error(
      '❌ Erro ao obter access token:',
      error.response?.data || error.message
    );
    return res.status(500).send('Error during OAuth');
  }
});


module.exports = router;
