(async () => {
  try {
    require('dotenv').config();

    const DEV = process.env.NODE_ENV === 'development';
    const USE_SECRETS = process.env.USE_SECRETS === 'true';

    try {
      require('ts-node').register({
        project: './tsconfig.json',
        require: ['tsconfig-paths/register'],
        transpileOnly: true,
      });
      console.log(`[bootstrap] ts-node habilitado (${DEV ? 'dev' : 'prod'})`);
    } catch {
      console.warn('[warn] ts-node não encontrado');
    }

    if (DEV && USE_SECRETS) {
      const { bootstrapEnv } = require('./env-loader');
      await bootstrapEnv({
        requiredKeys: [
          'NODE_ENV',
          'PORT',
          'DEV_ALLOW_DOCS',
          'MYSQL_HOST',
          'MYSQL_PORT',
          'MYSQL_DATABASE',
          'MYSQL_USERNAME',
          'MYSQL_PASSWORD',
          'REDIS_HOST',
          'REDIS_PORT',
          'AWS_DEFAULT_REGION',
          'AWS_REGION',
          'AWS_ACCESS_KEY_ID',
          'AWS_SECRET_ACCESS_KEY',
          'BUCKET_NAME',
          'BUCKET_DOCUMENTS',
          'JWT_SECRET',
          'URL_SIXBASE_DASHBOARD',
          'URL_SIXBASE_SUPPORT',
          'URL_SIXBASE_MEMBERSHIP',
          'API_PAY42_URL',
          'API_PAY42_KEY',
          'PAGARME_URL',
          'PAGARME_PASSWORD',
          'PAGARME_RECEIVER_ID',
          'PAGARME_PASSWORD_2',
          'PAGARME_RECEIVER_ID_2',
          'PAGARME_PASSWORD_3',
          'PAGARME_RECEIVER_ID_3',
          'MAILJET_USERNAME',
          'MAILJET_PASSWORD',
          'MAILJET_EMAIL_SENDER',
          'MAILJET_TEMPLATE_ID',
          'CLEAR_USER',
          'CLEAR_PASSWORD',
        ],
      });
      console.log('[env] loaded from AWS Secrets Manager (local)');
    }

    require('./database/models');
    require('./cron/reactivationMonthly');
    require('./cron/updateRewardsTable');
    require('./cron/resetContactStatusWeekly');
    // require('./cron/fetchOnesignalNotifications');

    const express = require('express');
    const cors = require('cors');
    const morgan = require('morgan');
    const swaggerUi = require('swagger-ui-express');
    const routes = require('./routes/index');
    const logger = require('./utils/logger');
    const swaggerSpec = require('./config/swagger');
    const { setupMetricsEndpoint } = require('./middlewares/prom');

    const app = express();
    app.set('trust proxy', true);

    const PORT = process.env.PORT || 5000;

    morgan.token('data', (req) => {
      if (DEV && req.url === '/healthcheck') return '';
      let body = 'body: {}';
      let query = 'query: {}';
      let params = 'params: {}';
      let user = 'user: {}';
      if (req.body && Object.keys(req.body).length > 0)
        body = `body: ${JSON.stringify(req.body)}`;
      if (req.query && Object.keys(req.query).length > 0)
        query = `query: ${JSON.stringify(req.query)}`;
      if (req.params && Object.keys(req.params).length > 0)
        params = `params: ${JSON.stringify(req.params)}`;
      if (req.user) {
        user = `user_logged: ${JSON.stringify(req.user)}`;
      }
      const out = `${body} - ${query} - ${params} - ${user}`;
      logger.info(out);
      return out;
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

    app.use(
      cors({
        exposedHeaders: ['Content-Disposition', 'Content-Type'],
      }),
    );
    app.use(express.json());

    app.use('/api', routes);

    const DEV_ALLOW_DOCS = process.env.DEV_ALLOW_DOCS === 'true';
    function allowOnlyLocal(req, res, next) {
      if (DEV_ALLOW_DOCS) return next();
      const allowedIps = ['::1', '127.0.0.1'];
      if (!allowedIps.includes(req.ip)) {
        return res.status(403).send('Forbidden');
      }
      next();
    }
    app.use(
      '/docs',
      allowOnlyLocal,
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec),
    );

    app.get('/healthcheck', (_req, res) => res.status(200).send('OK'));

    setupMetricsEndpoint(app);

    app.listen(PORT, async () => {
      logger.info(`Listening on port ${PORT}`);
      logger.info(`DB host: ${process.env.MYSQL_HOST}`);
    });
  } catch (err) {
    console.error('[BOOTSTRAP ERROR]', err?.message || err);
    process.exit(1);
  }
})();
