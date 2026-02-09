require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./utils/logger');
const cors = require('./config/cors');
const uuid = require('./utils/helpers/uuid');
const apiErrorHandler = require('./error/api-error-handler');

const { setupMetricsEndpoint } = require('./middlewares/prom');
const { bootstrapEnv } = require('./env-loader');

const app = express();

const readyPromise = (async () => {
  try {
    const DEV = process.env.NODE_ENV === 'development';
    const USE_SECRETS = process.env.USE_SECRETS === 'true';

    if (DEV && USE_SECRETS) {
      await bootstrapEnv({
        requiredKeys: [
          'AWS_DEFAULT_REGION', 'AWS_REGION',
          'API_PAY42_KEY', 'API_PAY42_URL',
          'DATABASE_DIALECT', 'ENVIRONMENT',
          'MAILJET_EMAIL_SENDER', 'MAILJET_PASSWORD', 'MAILJET_TEMPLATE_ID', 'MAILJET_USERNAME',
          'MIN_PRICE',
          'MYSQL_DATABASE', 'MYSQL_HOST', 'MYSQL_PASSWORD', 'MYSQL_PORT', 'MYSQL_USERNAME',
          'PIXEL_URL',
          'PORT_SERVER',
          'RECAPTCHAV3_HOSTNAME', 'RECAPTCHAV3_SECRET',
          'REDIS_HOST', 'REDIS_PORT',
          'SQS_ACCESS_KEY', 'SQS_SECRET_ACCESS_KEY', 'SQS_PREFIX',
          'URL_BILLET_CALLBACK', 'URL_PIX_CALLBACK', 'URL_REFUND_CALLBACK',
          'URL_REFUND_CARD_VERIFICATION', 'URL_CARD_CALLBACK',
          'URL_SIXBASE_CHECKOUT', 'URL_SIXBASE_DASHBOARD', 'URL_SIXBASE_MEMBERSHIP',
          'URL_WITHDRAWAL_CALLBACK',
          'ZIPCODE_SERVICE',
          'CLEAR_SALE_URL', 'CLEAR_SALE_PASSWORD', 'CLEAR_SALE_FINGERPRINT',
          'PAGARME_URL', 'PAGARME_RECEIVER_ID', 'PAGARME_PASSWORD',
          'PAGARME_RECEIVER_ID_3', 'PAGARME_PASSWORD_3',
          'TURNSTILE_SECRET_KEY', 'TURNSTILE_SITE_KEY'
        ],
      });
      logger.info('[env] loaded from AWS Secrets Manager (local)');
    }

    /* eslint-disable global-require */
    require('./database/models');
    const {
      redirectController,
      redirectPageController,
    } = require('./controllers/product/product');
    const Cache = require('./config/Cache');
    const routes = require('./routes');
    const eventsRoutes = require('./routes/events');
    const productRoutes = require('./routes/product');
    /* eslint-enable global-require */

    app.use(express.static(path.join(__dirname, 'public')));

    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(
      express.json({
        verify: (req, _res, buf) => {
          if (
            req.originalUrl?.startsWith(
              '/api/checkout/international/payments/stripe/webhook',
            )
          ) {
            req.rawBody = buf;
          }
        },
      }),
    );
    app.use(cookieParser());

    app.use((req, res, next) => {
      if (DEV && req.url === '/healthcheck') return next();

      req.id = uuid.v4();
      logger.info(
        `${req.id} [req_url] ${req.url} - [req_headers] ${JSON.stringify(req.headers)} - [req_body] ${JSON.stringify(req.body)}`
      );
      return next();
    });

    morgan.token('data', (req) => {
      if (DEV && req.url === '/healthcheck') return '';
      let body = 'body: {}';
      let query = 'query: {}';
      let params = 'params: {}';
      let cookies = 'cookies: {}';
      const req_id = `req_id: ${req.id || '{}'}`;
      const ip = `ip_address: ${JSON.stringify(req.headers['x-forwarded-for'] || req.socket.remoteAddress)}`;
      const userAgent = req.headers['user-agent'];

      if (req.body && Object.keys(req.body).length > 0) body = `body: ${JSON.stringify(req.body)}`;
      if (req.query && Object.keys(req.query).length > 0) query = `query: ${JSON.stringify(req.query)}`;
      if (req.params && Object.keys(req.params).length > 0) params = `params: ${JSON.stringify(req.params)}`;
      if (req.originalUrl.includes('/api/checkout/')) cookies = `cookies: ${JSON.stringify(req.cookies)}`;

      logger.info(`${req_id} ${body} - ${query} - ${params} - ${cookies} - ${ip} - ${userAgent}`);
      return '';
    });

    const skipInfra = (req) => {
      if (!DEV) return false;
      return (
        req.url === '/healthcheck' ||
        req.url === '/favicon.ico' ||
        req.url === '/docs' ||
        req.url.startsWith('/docs/')
      );
    };

    app.use(
      morgan(':method :url :status :response-time ms - :res[content-length] :data', {
        skip: skipInfra,
      }),
    );

    // permissive CORS para rotas específicas antes do global
    app.use('/api/checkout/sales/process-upsell', (req, res, next) => {
      const { origin } = req.headers;
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      if (req.method === 'OPTIONS') return res.status(200).end();
      return next();
    });

    app.use('/api/checkout/event', (req, res, next) => {
      const { origin } = req.headers;
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      if (req.method === 'OPTIONS') return res.status(200).end();
      return next();
    });

    // global CORS exceto rotas já tratadas
    app.use((req, res, next) => {
      if (
        req.path === '/api/checkout/sales/process-upsell' ||
        req.path.startsWith('/api/checkout/event')
      ) {
        return next();
      }
      return cors(req, res, next);
    });

    app.use('/api/checkout', routes);
    app.use('/api/product', productRoutes);
    app.use('/events', eventsRoutes);

    app.get('/:offer_id/:affiliate_id', redirectController);
    app.get('/pages/:page_uuid/:affiliate_uuid', redirectPageController);

    app.use((err, req, res, next) => {
      if (req.originalUrl?.startsWith('/events/checkout')) {
        logger.error(
          JSON.stringify({
            type: 'CHECKOUT_EVENT_PERSIST_ERROR',
            error: err?.message || err,
            eventId: req.body?.eventId,
          }),
        );
        return res.sendStatus(204);
      }
      return next(err);
    });

    app.use(apiErrorHandler);

    app.get('/', (_req, res) => {
      res.status(200).json({
        status: 'ok',
        service: 'checkout-api',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    });

    app.get('/healthcheck', (_req, res) => {
      res.sendStatus(204);
    });

    setupMetricsEndpoint(app);

    app.get('/:id_user', async (req, res) => {
      await Cache.del(`user_${process.env.ENVIRONMENT}_${req.params.id_user}`);
      return res.status(200).send('danilex');
    });
  } catch (err) {
    logger.error('[BOOTSTRAP ERROR]', err?.message);
    if (err.stack) logger.error(err.stack);
    process.exit(1);
  }
})();

module.exports = { app, readyPromise };
