const router = require('express').Router();
const {
  CloudWatchLogsClient,
  FilterLogEventsCommand,
} = require('@aws-sdk/client-cloudwatch-logs');
const ApiError = require('../error/ApiError');

const FILTER_PATTERNS = {
  'ERROR FRONTEND': 'ERROR FRONTEND',
  'PIX Sale Execution': 'PIX Sale Execution',
  'Erro ao gerar PIX': 'Erro ao gerar PIX',
  'Erro CARTÃO': 'Erro CARTÃO',
};

const LOG_GROUPS = {
  checkout: '/ecs/td-api-checkout',
};

function maskCardNumbers(message) {
  return message.replace(
    /("card_number"\s*:\s*["'])(\d{13,19})(["'])/gi,
    (match, prefix, cardNumber, suffix) => {
      if (cardNumber.length < 8) {
        return match;
      }
      const first4 = cardNumber.substring(0, 4);
      const last4 = cardNumber.substring(cardNumber.length - 4);
      const masked = first4 + '*'.repeat(cardNumber.length - 8) + last4;
      return prefix + masked + suffix;
    },
  );
}

router.get('/', async (req, res, next) => {
  try {
    const {
      query: { hours = 1, logGroup = 'checkout', filterPattern },
    } = req;

    const hoursNumber = Number(hours);
    if (isNaN(hoursNumber) || hoursNumber <= 0) {
      return res.status(400).send({
        error: 'Invalid hours parameter. Must be a positive number.',
      });
    }

    const groupName = LOG_GROUPS[logGroup];
    if (!groupName) {
      return res.status(400).send({
        error: `Invalid logGroup. Available options: ${Object.keys(
          LOG_GROUPS,
        ).join(', ')}`,
      });
    }

    const selectedFilterPattern = filterPattern;
    if (!selectedFilterPattern) {
      return res.status(400).send({
        error: 'filterPattern is required',
        availablePatterns: Object.keys(FILTER_PATTERNS),
      });
    }

    const patternValue = FILTER_PATTERNS[selectedFilterPattern];
    if (!patternValue) {
      return res.status(400).send({
        error: `Invalid filterPattern. Available options: ${Object.keys(
          FILTER_PATTERNS,
        ).join(', ')}`,
      });
    }

    const client = new CloudWatchLogsClient({
      region: 'sa-east-1',
      credentials: {
        accessKeyId: process.env.B4YOU_AWS_ACCESS_KEY_ID, // new keys
        secretAccessKey: process.env.B4YOU_AWS_SECRET_ACCESS_KEY,
      },
    });

    const startTime = Date.now() - 1000 * 60 * 60 * hoursNumber;
    const endTime = Date.now();

    let nextToken;
    const allEvents = [];
    let page = 1;

    do {
      const command = new FilterLogEventsCommand({
        logGroupName: groupName,
        startTime,
        endTime,
        filterPattern: patternValue,
        interleaved: true,
        limit: 1000,
        nextToken,
      });

      const response = await client.send(command);

      if (response.events) {
        allEvents.push(...response.events);
      }

      nextToken = response.nextToken;
      page++;
    } while (nextToken);

    const logs = allEvents.map((ev) => ({
      timestamp: new Date(ev.timestamp).toISOString(),
      message: maskCardNumbers(ev.message.trim()),
      logStreamName: ev.logStreamName,
    }));

    return res.send({
      logGroup,
      filterPattern: selectedFilterPattern,
      hours: hoursNumber,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      total: logs.length,
      logs,
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
});

router.get('/patterns', async (req, res, next) => {
  try {
    return res.send({
      patterns: Object.keys(FILTER_PATTERNS),
      logGroups: Object.keys(LOG_GROUPS),
    });
  } catch (error) {
    if (error instanceof ApiError) return res.status(error.code).send(error);
    return next(
      ApiError.internalservererror(
        `Internal Server Error, ${Object.keys(
          req.route.methods,
        )[0].toUpperCase()}: ${req.originalUrl}`,
        error,
      ),
    );
  }
});

module.exports = router;
