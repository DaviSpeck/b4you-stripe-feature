const dispatcher = require('../core/dispatcher');
const logger = require('../core/logger');
const { getConfig } = require('../core/config');

module.exports = async function firstSignup(payload) {
  const config = getConfig();

  try {
    const phone = String(payload.phone || '').replace(/\D/g, '');
    const firstName = String(payload.name || '').split(' ')[0] || '';

    const intentIdOrName = payload.__templateKey;

    if (!intentIdOrName) {
      throw new Error('Template key not provided for first_signup event');
    }

    const botmakerPayload = {
      chat: {
        channelId: config.botmaker.whatsappChannelId,
        contactId: phone,
      },

      intentIdOrName,

      variables: {
        firstName,
      },

      webhookPayload: JSON.stringify(payload),
    };

    await dispatcher.send(botmakerPayload);

    logger.info('first_signup event dispatched successfully', {
      phone,
      firstName,
      intentIdOrName,
    });
  } catch (err) {
    logger.error('Error in first_signup handler', {
      message: err.message,
      botmakerError: err.response?.data,
      payload,
    });
    throw err;
  }
};