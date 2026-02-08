require('dotenv').config();
const http = require('http');
const logger = require('./utils/logger');
const { app, readyPromise } = require('./index');

(async () => {
  try {
    await readyPromise;

    const PORT = process.env.PORT_SERVER || 5501;
    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`Listening on port ${PORT}`);
      logger.info(`DB host: ${process.env.MYSQL_HOST}`);
      logger.info(`Running on ${process.env.ENVIRONMENT} mode`);
    });
  } catch (err) {
    logger.error('[SERVER BOOT ERROR]', err?.message);
    process.exit(1);
  }
})();