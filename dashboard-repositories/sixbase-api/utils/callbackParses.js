const { findCallbackStatus } = require('../status/callbackStatus');

const callbackWebhookParser = ({ transaction_id, status }) => ({
  transaction_id,
  status: findCallbackStatus(status),
});

module.exports = { callbackWebhookParser };
