require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('./config/cors');
const logger = require('./utils/logger');
const apiErrorHandler = require('./error/api-error-handler');

const { setupMetricsEndpoint } = require('./middlewares/prom');
const { validateThirdPartyAuth } = require('./middlewares/thirdparty');
const { bootstrapEnv } = require('./env-loader');
const swaggerConfig = require('./config/swagger');

const app = express();

const readyPromise = (async () => {
  try {
    const DEV =
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';
    const USE_SECRETS = process.env.USE_SECRETS === 'true';

    if (DEV && USE_SECRETS) {
      await bootstrapEnv({
        requiredKeys: [
          'AWS_DEFAULT_REGION',
          'AWS_REGION',
          'API_BLING',
          'API_ENOTAS',
          'API_LEADLOVERS',
          'API_MAILCHIMP',
          'API_ONESIGNAL',
          'API_PAY42_URL',
          'API_PAY42_KEY',
          'API_SIXBASE',
          'API_YOUTUBE_V3',
          'AWS_ACCESS_KEY_ID',
          'AWS_SECRET_ACCESS_KEY',
          'AWS_SES_REGION',
          'AWS_SES_VERSION',
          'BUCKET_DOCUMENTS',
          'BUCKET_NAME',
          'DATABASE_DIALECT',
          'ENVIRONMENT',
          'MAILJET_EMAIL_SENDER',
          'MAILJET_PASSWORD',
          'MAILJET_TEMPLATE_ID',
          'MAILJET_USERNAME',
          'MIN_PRICE',
          'MYSQL_PASSWORD',
          'MYSQL_DATABASE',
          'MYSQL_HOST',
          'MYSQL_PORT',
          'MYSQL_USERNAME',
          'ONESIGNAL_APPID',
          'ONESIGNAL_AUTHORIZATION',
          'ONESIGNAL_SOUND',
          'PIXEL_SERVER_IP',
          'PIXEL_URL',
          'PORT_SERVER',
          'RECAPTCHAV3_HOSTNAME',
          'RECAPTCHAV3_SECRET',
          'REDIS_HOST',
          'REDIS_PORT',
          'SIXBASE_SUPPORT_EMAIL',
          'SIXBASE_URL_AFFILIATES',
          'SIXBASE_URL_COLLABORATORS',
          'SIXBASE_URL_INVITE',
          'SIXBASE_URL_PRODUCT',
          'SIXBASE_URL_STUDENT_PROFILE',
          'SQS_ACCESS_KEY',
          'SQS_SECRET_ACCESS_KEY',
          'SQS_PREFIX',
          'URL_BILLET_CALLBACK',
          'URL_PIX_CALLBACK',
          'URL_REFUND_CALLBACK',
          'URL_REFUND_CARD_VERIFICATION',
          'URL_SIXBASE_API',
          'URL_SIXBASE_CHECKOUT',
          'URL_SIXBASE_DASHBOARD',
          'URL_SIXBASE_MEMBERSHIP',
          'URL_WITHDRAWAL_CALLBACK',
          'VIMEO_AUTHORIZATION',
          'ZIPCODE_SERVICE',
          'JWT_PRIVATE_KEY',
          'JWT_PUBLIC_KEY',
          'PAGARME_URL',
          'PAGARME_PASSWORD',
          'PAGARME_RECEIVER_ID',
          'BLING_CLIENT_ID',
          'BLING_CLIENT_SECRET',
          'PAGARME_RECEIVER_ID_2',
          'PAGARME_PASSWORD_2',
          'CREATOR_SCHOOL_COURSE_ID',
          'URL_SIXBASE_CHECKOUT_PV',
          'PAGARME_PASSWORD_3',
          'PAGARME_RECEIVER_ID_3',
          'WEB_ONESIGNAL_APP_ID',
          'WEB_ONESIGNAL_API_KEY',
          'ONESIGNAL_API_URL',
          'TIKTOK_CLIENT_ID',
          'TIKTOK_CLIENT_SECRET',
        ],
      });
      logger.info('[env] loaded from AWS Secrets Manager (local)');
    }

    /* eslint-disable global-require */
    require('./database/models');
    const routes = require('./routes');
    const thirdpartyRoutes = require('./routes/dashboard/thirdparty/index');
    /* eslint-enable global-require */

    app.set('trust proxy', 1);
    app.use(helmet());
    app.use(cors);
    app.use(express.json());
    app.use(compression());

    morgan.token('data', (req) => {
      if (DEV && req.url === '/healthcheck') return '';
      let body = 'body: {}';
      let query = 'query: {}';
      let params = 'params: {}';
      let cookies = 'cookies: {}';
      let ip = 'ip: {}';
      const origin = `origin: ${JSON.stringify(
        req.headers.origin || req.headers.referer || 'N/A',
      )}`;
      if (req.body && Object.keys(req.body).length > 0)
        body = `body: ${JSON.stringify(req.body)}`;
      if (req.query && Object.keys(req.query).length > 0)
        query = `query: ${JSON.stringify(req.query)}`;
      if (req.params && Object.keys(req.params).length > 0)
        params = `params: ${JSON.stringify(req.params)}`;
      if (req.originalUrl.includes('/api/checkout/')) {
        cookies = `cookies: ${JSON.stringify(req.cookies)}`;
      }
      ip =
        `ip_address: ${JSON.stringify(req.headers['x-forwarded-for'])}` ||
        `ip_address: ${JSON.stringify(req.socket.remoteAddress)}`;

      logger.info(
        `${body} - ${query} - ${params} - ${cookies} - ${ip} - ${origin}`,
      );
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
      morgan(
        ':method :url :status :response-time ms - :res[content-length] :data',
        {
          skip: skipInfra,
        },
      ),
    );

    app.use(cookieParser());

    app.use('/api', routes);

    // Configuração do Swagger
    swaggerConfig(app);

    app.use('/thirdparty', validateThirdPartyAuth, thirdpartyRoutes);

    app.use(apiErrorHandler);

    app.get('/', (req, res) => {
      try {
        res.status(200).send({ msg: 'API ONLINE 123' });
      } catch (error) {
        res.sendStatus(500);
      }
    });

    app.get('/healthcheck', (_req, res) => {
      try {
        res.sendStatus(204);
      } catch (error) {
        res.sendStatus(500);
      }
    });

    setupMetricsEndpoint(app);
  } catch (err) {
    logger.error('[BOOTSTRAP ERROR]', err?.message);
    if (err.stack) {
      logger.error(err.stack);
    }
    process.exit(1);
  }
})();

module.exports = { app, readyPromise };
