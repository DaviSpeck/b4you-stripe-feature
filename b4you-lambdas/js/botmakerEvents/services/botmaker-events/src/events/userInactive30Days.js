const dispatcher = require('../core/dispatcher');
const logger = require('../core/logger');
const { getConfig } = require('../core/config');

module.exports = async function userInactive30Days(payload) {
  const config = getConfig();

  try {
    const phone = String(payload.phone || '').replace(/\D/g, '');
    const firstName = String(payload.name || '').split(' ')[0] || '';

    const dias_sem_vender = String(payload.inactiveDays || '');

    const intentIdOrName = payload.__templateKey;

    if (!intentIdOrName) {
      throw new Error('Template key not provided for user_inactive_30_days event');
    }

    const botmakerPayload = {
      chat: {
        channelId: config.botmaker.whatsappChannelId,
        contactId: phone,
      },

      intentIdOrName,

      variables: {
        firstName,
        dias_sem_vender,
      },

      webhookPayload: JSON.stringify(payload),
    };

    await dispatcher.send(botmakerPayload);

    logger.info('user_inactive_30_days event dispatched successfully', {
      phone,
      firstName,
      dias_sem_vender,
      intentIdOrName,
    });
  } catch (err) {
    logger.error('Error in userInactive30Days handler', {
      message: err.message,
      botmakerError: err.response?.data,
      payload,
    });
    throw err;
  }
};